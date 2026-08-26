import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { formatCents } from "../../utils/format";
import { LICENSE_CATALOG } from "../../data/licenseCatalog";
import { hasAllRequiredLicenses } from "../../systems/licenseSystem";
import type { Contract, License, Vehicle } from "../../types";

function licenseLabel(type: Contract["requiredLicenses"][number]): string {
  return LICENSE_CATALOG.find((e) => e.type === type)?.label ?? type;
}

export function ContractBoard() {
  const contracts = useGameStore((s) => s.state.contracts);
  const vehicles = useGameStore((s) => s.state.vehicles);
  const licenses = useGameStore((s) => s.state.licenses);
  const currentDay = useGameStore((s) => s.state.company.currentDay);
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
            {active.map((c) => (
              <ContractRow key={c.id} contract={c}>
                {c.status === "accepted" ? (
                  <DispatchControls
                    contract={c}
                    vehicles={vehicles}
                    licenses={licenses}
                    currentDay={currentDay}
                    onDispatch={(vehicleId) => assignVehicleToContract(c.id, vehicleId)}
                  />
                ) : (
                  <span className="text-xs text-blue-300">En route · due day {c.deadlineDay}</span>
                )}
              </ContractRow>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DispatchControls({
  contract,
  vehicles,
  licenses,
  currentDay,
  onDispatch,
}: {
  contract: Contract;
  vehicles: Vehicle[];
  licenses: License[];
  currentDay: number;
  onDispatch: (vehicleId: string) => void;
}) {
  const [vehicleId, setVehicleId] = useState("");

  const eligibleVehicles = vehicles.filter(
    (v) => v.status === "idle" && v.class === contract.requiredVehicleClass
  );
  const missingLicenses = contract.requiredLicenses.filter(
    (type) => !hasAllRequiredLicenses(licenses, [type], currentDay, contract.originStateCode)
  );

  if (missingLicenses.length > 0) {
    return (
      <span className="text-xs text-amber-400">Missing: {missingLicenses.map(licenseLabel).join(", ")}</span>
    );
  }
  if (eligibleVehicles.length === 0) {
    return <span className="text-xs text-amber-400">No idle {contract.requiredVehicleClass} available</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
        className="bg-slate-700 text-white text-sm rounded px-2 py-1"
      >
        <option value="" disabled>
          Vehicle…
        </option>
        {eligibleVehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.make} {v.model}
          </option>
        ))}
      </select>
      <button
        onClick={() => onDispatch(vehicleId)}
        disabled={!vehicleId}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors"
      >
        Dispatch
      </button>
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
        {contract.requiredLicenses.length > 0 && (
          <div className="text-xs text-slate-500 mt-0.5">
            Requires: {contract.requiredLicenses.map(licenseLabel).join(", ")}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-emerald-400 font-semibold text-sm">{formatCents(contract.payoutCents)}</span>
        {children}
      </div>
    </div>
  );
}
