import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { VEHICLE_CATALOG } from "../../data/vehicleCatalog";
import { formatCents } from "../../utils/format";
import { getFleetCapacity } from "../../systems/terminalSystem";
import type { VehicleClass } from "../../types";

const CLASS_LABELS: Record<VehicleClass, string> = {
  van: "Van",
  boxTruck: "Box Truck",
  semi: "Semi",
};

const CLASS_FILTERS: Array<VehicleClass | "all"> = ["all", "van", "boxTruck", "semi"];

export function FleetManager() {
  const vehicles = useGameStore((s) => s.state.vehicles);
  const terminals = useGameStore((s) => s.state.terminals);
  const cashCents = useGameStore((s) => s.state.company.cashCents);
  const buyVehicle = useGameStore((s) => s.buyVehicle);
  const [classFilter, setClassFilter] = useState<VehicleClass | "all">("all");

  const capacity = getFleetCapacity(terminals);
  const atCapacity = vehicles.length >= capacity;

  const catalog =
    classFilter === "all" ? VEHICLE_CATALOG : VEHICLE_CATALOG.filter((entry) => entry.class === classFilter);

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-white">Fleet Manager</h2>

      <div>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">Buy a Vehicle</h3>
        {atCapacity && (
          <p className="text-amber-400 text-xs mb-2">
            Fleet at capacity ({vehicles.length}/{capacity}). Open or upgrade a terminal for more room.
          </p>
        )}
        <div className="flex gap-1.5 mb-2">
          {CLASS_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setClassFilter(c)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                classFilter === c
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              {c === "all" ? "All" : CLASS_LABELS[c]}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {catalog.map((entry) => (
            <div
              key={`${entry.make}-${entry.model}`}
              className="flex items-center justify-between bg-slate-900 rounded p-3"
            >
              <div>
                <div className="text-white font-medium">
                  {entry.year} {entry.make} {entry.model}
                  <span className="text-slate-500 font-normal"> · {CLASS_LABELS[entry.class]}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {entry.cargoCapacityLbs.toLocaleString()} lbs cap · {entry.fuelEfficiencyMpg} mpg
                </div>
              </div>
              <button
                onClick={() => buyVehicle(entry)}
                disabled={cashCents < entry.priceCents || atCapacity}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors shrink-0"
              >
                Buy for {formatCents(entry.priceCents)}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
          Owned Vehicles ({vehicles.length}/{capacity})
        </h3>
        {vehicles.length === 0 ? (
          <p className="text-slate-500 text-sm">No vehicles yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-slate-900 rounded p-3 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">
                    {v.year} {v.make} {v.model}
                    <span className="text-slate-500 font-normal"> · {CLASS_LABELS[v.class]}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {Math.round(v.mileage).toLocaleString()} mi · condition {Math.round(v.condition)}%
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    idle: "bg-slate-700 text-slate-200",
    enRoute: "bg-blue-900 text-blue-200",
    maintenance: "bg-amber-900 text-amber-200",
    outOfService: "bg-red-900 text-red-200",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[status] ?? colors.idle}`}>{status}</span>
  );
}
