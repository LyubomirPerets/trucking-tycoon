import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useGameStore } from "../../state/gameStore";
import { getStateByName } from "../../data/stateData";
import { TERMINAL_TIERS } from "../../data/terminalCatalog";
import { formatCents } from "../../utils/format";

const US_TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export function TerminalMap() {
  const terminals = useGameStore((s) => s.state.terminals);
  const cashCents = useGameStore((s) => s.state.company.cashCents);
  const buyTerminal = useGameStore((s) => s.buyTerminal);
  const upgradeTerminal = useGameStore((s) => s.upgradeTerminal);
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);

  const terminalByState = new Map(terminals.map((t) => [t.stateCode, t]));
  const selectedTerminal = selectedStateCode ? terminalByState.get(selectedStateCode) : undefined;

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-white">Terminal Map</h2>

      <div className="bg-slate-900 rounded overflow-hidden">
        <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 900 }} width={800} height={480}>
          <Geographies geography={US_TOPOJSON_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateInfo = getStateByName(geo.properties.name);
                const owned = stateInfo ? terminalByState.has(stateInfo.code) : false;
                const isSelected = stateInfo?.code === selectedStateCode;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => stateInfo && setSelectedStateCode(stateInfo.code)}
                    style={{
                      default: {
                        fill: owned ? "#10b981" : "#334155",
                        stroke: isSelected ? "#facc15" : "#0f172a",
                        strokeWidth: isSelected ? 1.5 : 0.5,
                        outline: "none",
                        cursor: stateInfo ? "pointer" : "default",
                      },
                      hover: {
                        fill: owned ? "#34d399" : "#475569",
                        stroke: "#0f172a",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: stateInfo ? "pointer" : "default",
                      },
                      pressed: {
                        fill: owned ? "#059669" : "#64748b",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {selectedStateCode && (
        <StateDetailPanel
          stateCode={selectedStateCode}
          terminal={selectedTerminal}
          cashCents={cashCents}
          onBuy={() => buyTerminal(selectedStateCode)}
          onUpgrade={() => selectedTerminal && upgradeTerminal(selectedTerminal.id)}
        />
      )}

      <div>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
          Terminals ({terminals.length})
        </h3>
        {terminals.length === 0 ? (
          <p className="text-slate-500 text-sm">No terminals yet. Click a state on the map to open one.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {terminals.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 rounded p-3 flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedStateCode(t.stateCode)}
              >
                <div>
                  <div className="text-white font-medium">
                    {t.city}, {t.stateCode}
                  </div>
                  <div className="text-xs text-slate-400">
                    Tier {t.tier} · {t.vehicleCapacity} vehicle capacity · {formatCents(t.monthlyLeaseCostCents)}/mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StateDetailPanel({
  stateCode,
  terminal,
  cashCents,
  onBuy,
  onUpgrade,
}: {
  stateCode: string;
  terminal: { id: string; city: string; tier: 1 | 2 | 3; vehicleCapacity: number; monthlyLeaseCostCents: number } | undefined;
  cashCents: number;
  onBuy: () => void;
  onUpgrade: () => void;
}) {
  if (!terminal) {
    const tier1 = TERMINAL_TIERS[1];
    return (
      <div className="bg-slate-900 rounded p-3 flex items-center justify-between">
        <div className="text-sm text-slate-300">
          No terminal in {stateCode} yet. Tier 1: {tier1.vehicleCapacity} capacity, {formatCents(tier1.monthlyLeaseCostCents)}/mo lease.
        </div>
        <button
          onClick={onBuy}
          disabled={cashCents < tier1.priceCents}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors shrink-0"
        >
          Open Terminal
        </button>
      </div>
    );
  }

  const nextTier = terminal.tier < 3 ? ((terminal.tier + 1) as 2 | 3) : null;
  const nextTierInfo = nextTier ? TERMINAL_TIERS[nextTier] : null;

  return (
    <div className="bg-slate-900 rounded p-3 flex items-center justify-between">
      <div className="text-sm text-slate-300">
        {terminal.city}, {stateCode} · Tier {terminal.tier} · {terminal.vehicleCapacity} capacity ·{" "}
        {formatCents(terminal.monthlyLeaseCostCents)}/mo
      </div>
      {nextTierInfo && (
        <button
          onClick={onUpgrade}
          disabled={cashCents < nextTierInfo.priceCents}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors shrink-0"
        >
          Upgrade to Tier {nextTier} ({formatCents(nextTierInfo.priceCents)})
        </button>
      )}
    </div>
  );
}
