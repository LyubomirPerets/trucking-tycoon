import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { LICENSE_CATALOG } from "../../data/licenseCatalog";
import { STATES } from "../../data/stateData";
import { formatCents } from "../../utils/format";
import { hasLicense } from "../../systems/licenseSystem";
import { CollapsiblePanel } from "../common/CollapsiblePanel";

export function LicenseOffice() {
  const licenses = useGameStore((s) => s.state.licenses);
  const currentDay = useGameStore((s) => s.state.company.currentDay);
  const cashCents = useGameStore((s) => s.state.company.cashCents);
  const freeMode = useGameStore((s) => s.freeMode);
  const buyLicense = useGameStore((s) => s.buyLicense);
  const [selectedState, setSelectedState] = useState<Record<string, string>>({});

  return (
    <CollapsiblePanel title="License Office" storageKey="licenses">
      <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {LICENSE_CATALOG.map((entry) => {
          const stateCode = selectedState[entry.type] ?? "";
          const owned = entry.scoped
            ? stateCode && hasLicense(licenses, entry.type, currentDay, stateCode)
            : hasLicense(licenses, entry.type, currentDay, "");
          const canAfford = freeMode || cashCents >= entry.priceCents;

          return (
            <div key={entry.type} className="bg-slate-900 rounded p-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-white font-medium">{entry.label}</div>
                <div className="text-xs text-slate-400">{entry.description}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {formatCents(entry.priceCents)} · renews at {formatCents(entry.annualRenewalCostCents)}/yr
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {entry.scoped && (
                  <select
                    value={stateCode}
                    onChange={(e) =>
                      setSelectedState((prev) => ({ ...prev, [entry.type]: e.target.value }))
                    }
                    className="bg-slate-700 text-white text-sm rounded px-2 py-1"
                  >
                    <option value="" disabled>
                      State…
                    </option>
                    {STATES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.code}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => buyLicense(entry.type, entry.scoped ? stateCode : null)}
                  disabled={!canAfford || Boolean(owned) || (entry.scoped && !stateCode)}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors"
                >
                  {owned ? "Owned" : "Buy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
          Held Licenses ({licenses.length})
        </h3>
        {licenses.length === 0 ? (
          <p className="text-slate-500 text-sm">None yet — you'll need Interstate Operating Authority before dispatching any contract.</p>
        ) : (
          <div className="flex flex-col gap-1 text-sm">
            {licenses.map((l) => {
              const catalogEntry = LICENSE_CATALOG.find((e) => e.type === l.type);
              return (
                <div key={l.id} className="text-slate-300 flex justify-between">
                  <span>
                    {catalogEntry?.label ?? l.type}
                    {l.stateCode ? ` (${l.stateCode})` : ""}
                  </span>
                  <span className="text-slate-500">expires day {l.expiresOnDay}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </CollapsiblePanel>
  );
}
