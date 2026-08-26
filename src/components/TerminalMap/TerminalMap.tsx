import { useState } from "react";
import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps";
import { useGameStore } from "../../state/gameStore";
import { getState, getStateByName } from "../../data/stateData";
import { TERMINAL_TIERS } from "../../data/terminalCatalog";
import { getNewTerminalPriceCents } from "../../systems/terminalSystem";
import { formatCents } from "../../utils/format";
import { CollapsiblePanel } from "../common/CollapsiblePanel";

const US_TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

function coord(code: string): [number, number] | null {
  const s = getState(code);
  return s ? [s.lon, s.lat] : null;
}

export function TerminalMap() {
  const terminals = useGameStore((s) => s.state.terminals);
  const contracts = useGameStore((s) => s.state.contracts);
  const homeStateCode = useGameStore((s) => s.state.company.homeStateCode);
  const cashCents = useGameStore((s) => s.state.company.cashCents);
  const freeMode = useGameStore((s) => s.freeMode);
  const buyTerminal = useGameStore((s) => s.buyTerminal);
  const upgradeTerminal = useGameStore((s) => s.upgradeTerminal);
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(true);

  const terminalByState = new Map(terminals.map((t) => [t.stateCode, t]));
  const selectedTerminal = selectedStateCode ? terminalByState.get(selectedStateCode) : undefined;

  const activeHauls = contracts.filter((c) => c.status === "inProgress");
  const homeCoord = coord(homeStateCode);

  return (
    <CollapsiblePanel
      title="Terminal Map"
      storageKey="map"
      headerRight={
        <button
          onClick={() => setMapVisible((v) => !v)}
          className="bg-slate-900 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded transition-colors"
        >
          {mapVisible ? "Minimize Map" : "Show Map"}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {mapVisible ? (
          <>
            <p className="text-xs text-slate-400">
              Click a state to open a terminal or view/upgrade one. Amber lines are hauls in progress.
            </p>
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

                {activeHauls.flatMap((c) =>
                  c.routePath.slice(0, -1).map((from, i) => {
                    const a = coord(from);
                    const b = coord(c.routePath[i + 1]);
                    if (!a || !b) return null;
                    return (
                      <Line
                        key={`${c.id}-${i}`}
                        from={a}
                        to={b}
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                      />
                    );
                  })
                )}

                {homeCoord && (
                  <Marker coordinates={homeCoord}>
                    <circle r={4} fill="#38bdf8" stroke="#0f172a" strokeWidth={1} />
                  </Marker>
                )}

                {activeHauls.map((c) => {
                  const d = coord(c.destinationStateCode);
                  return d ? (
                    <Marker key={`dst-${c.id}`} coordinates={d}>
                      <circle r={3} fill="#f59e0b" stroke="#0f172a" strokeWidth={1} />
                    </Marker>
                  ) : null;
                })}
              </ComposableMap>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500">Show the map to open a terminal in a new state.</p>
        )}

        {selectedStateCode && (
          <StateDetailPanel
            stateCode={selectedStateCode}
            terminal={selectedTerminal}
            cashCents={cashCents}
            freeMode={freeMode}
            onBuy={() => buyTerminal(selectedStateCode)}
            onUpgrade={() => selectedTerminal && upgradeTerminal(selectedTerminal.id)}
          />
        )}

        <div>
          <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
            Terminals ({terminals.length})
          </h3>
          {terminals.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No terminals yet — trucks run out of your home state ({homeStateCode}). Click a state to open one.
            </p>
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
    </CollapsiblePanel>
  );
}

function StateDetailPanel({
  stateCode,
  terminal,
  cashCents,
  freeMode,
  onBuy,
  onUpgrade,
}: {
  stateCode: string;
  terminal: { id: string; city: string; tier: 1 | 2 | 3; vehicleCapacity: number; monthlyLeaseCostCents: number } | undefined;
  cashCents: number;
  freeMode: boolean;
  onBuy: () => void;
  onUpgrade: () => void;
}) {
  if (!terminal) {
    const tier1 = TERMINAL_TIERS[1];
    const priceCents = getNewTerminalPriceCents(stateCode);
    return (
      <div className="bg-slate-900 rounded p-3 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-300">
          No terminal in {stateCode} yet. Tier 1: {tier1.vehicleCapacity} capacity,{" "}
          {formatCents(tier1.monthlyLeaseCostCents)}/mo lease.
          <span className="block text-xs text-slate-400 mt-0.5">
            Cost to open: {formatCents(priceCents)} (scaled by local demand)
          </span>
        </div>
        <button
          onClick={onBuy}
          disabled={!freeMode && cashCents < priceCents}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors shrink-0"
        >
          Open Terminal ({formatCents(priceCents)})
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
          disabled={!freeMode && cashCents < nextTierInfo.priceCents}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors shrink-0"
        >
          Upgrade to Tier {nextTier} ({formatCents(nextTierInfo.priceCents)})
        </button>
      )}
    </div>
  );
}
