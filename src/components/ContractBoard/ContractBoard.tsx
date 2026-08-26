import { useGameStore } from "../../state/gameStore";
import { formatCents } from "../../utils/format";
import type { Contract } from "../../types";

export function ContractBoard() {
  const contracts = useGameStore((s) => s.state.contracts);
  const vehicles = useGameStore((s) => s.state.vehicles);
  const acceptContract = useGameStore((s) => s.acceptContract);
  const assignVehicleToContract = useGameStore((s) => s.assignVehicleToContract);

  const offered = contracts.filter((c) => c.status === "offered");
  const active = contracts.filter((c) => c.status === "accepted" || c.status === "inProgress");

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-white">Contract Board</h2>

      <div>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
          Offered ({offered.length})
        </h3>
        {offered.length === 0 ? (
          <p className="text-slate-500 text-sm">No contracts offered right now. Check back after the week rolls over.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {offered.map((c) => (
              <ContractRow key={c.id} contract={c}>
                <button
                  onClick={() => acceptContract(c.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors"
                >
                  Accept
                </button>
              </ContractRow>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
          Active ({active.length})
        </h3>
        {active.length === 0 ? (
          <p className="text-slate-500 text-sm">Nothing in progress.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {active.map((c) => {
              const eligibleVehicles = vehicles.filter(
                (v) => v.status === "idle" && v.class === c.requiredVehicleClass
              );
              return (
                <ContractRow key={c.id} contract={c}>
                  {c.status === "accepted" ? (
                    eligibleVehicles.length === 0 ? (
                      <span className="text-xs text-amber-400">No idle {c.requiredVehicleClass} available</span>
                    ) : (
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) assignVehicleToContract(c.id, e.target.value);
                        }}
                        className="bg-slate-700 text-white text-sm rounded px-2 py-1"
                      >
                        <option value="" disabled>
                          Assign vehicle…
                        </option>
                        {eligibleVehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.make} {v.model}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <span className="text-xs text-blue-300">En route · due day {c.deadlineDay}</span>
                  )}
                </ContractRow>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ContractRow({ contract, children }: { contract: Contract; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 rounded p-3 flex items-center justify-between gap-3">
      <div>
        <div className="text-white font-medium">
          {contract.originStateCode} → {contract.destinationStateCode}{" "}
          <span className="text-slate-400 text-xs font-normal">
            ({contract.distanceMiles.toLocaleString()} mi, {contract.requiredVehicleClass})
          </span>
        </div>
        <div className="text-xs text-slate-400">
          {contract.cargoType} · {contract.weightLbs.toLocaleString()} lbs · due day {contract.deadlineDay}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-emerald-400 font-semibold text-sm">{formatCents(contract.payoutCents)}</span>
        {children}
      </div>
    </div>
  );
}
