import { useEffect, useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { formatCents } from "../../utils/format";
import { LICENSE_CATALOG } from "../../data/licenseCatalog";
import { STATES, getState } from "../../data/stateData";
import { ROAD_CONNECTED_STATES } from "../../data/roadNetwork";
import { hasLicense } from "../../systems/licenseSystem";
import type { DispatchStrategy, LoadPreference } from "../../systems/freightSystem";
import type { Contract, JobSuggestion, License, LoadSize, Terminal, Vehicle } from "../../types";

const STRATEGY_LABELS: Record<DispatchStrategy, string> = {
  profitPerHaul: "Max profit / haul",
  profitPerDay: "Max profit / day",
  shortest: "Shortest trips",
};
const LOAD_PREF_LABELS: Record<LoadPreference, string> = {
  auto: "Auto (best load)",
  light: "Light only",
  heavy: "Heavy only",
};

const CLASS_LABEL: Record<Vehicle["class"], string> = {
  van: "Van",
  boxTruck: "Box Truck",
  semi: "Semi",
};

function licenseLabel(type: string): string {
  return LICENSE_CATALOG.find((e) => e.type === type)?.label ?? type;
}

function cityLabel(code: string): string {
  const s = getState(code);
  return s ? `${s.majorCity}, ${code}` : code;
}

function RouteChips({ path }: { path: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      {path.map((code, i) => (
        <span key={`${code}-${i}`} className="flex items-center gap-1">
          {i > 0 && <span className="text-slate-600">›</span>}
          <span className="bg-slate-800 text-slate-300 rounded px-1.5 py-0.5">{code}</span>
        </span>
      ))}
    </div>
  );
}

export function DispatchBoard() {
  const contracts = useGameStore((s) => s.state.contracts);
  const vehicles = useGameStore((s) => s.state.vehicles);
  const terminals = useGameStore((s) => s.state.terminals);
  const licenses = useGameStore((s) => s.state.licenses);
  const currentDay = useGameStore((s) => s.state.company.currentDay);
  const suggestions = useGameStore((s) => s.jobSuggestions);
  const dispatchJob = useGameStore((s) => s.dispatchJob);
  const dispatchAll = useGameStore((s) => s.dispatchAll);
  const rerollSuggestion = useGameStore((s) => s.rerollSuggestion);
  const setSuggestionDestination = useGameStore((s) => s.setSuggestionDestination);
  const syncSuggestions = useGameStore((s) => s.syncSuggestions);

  const [strategy, setStrategy] = useState<DispatchStrategy>("profitPerDay");
  const [loadPref, setLoadPref] = useState<LoadPreference>("auto");

  useEffect(() => {
    syncSuggestions();
  }, [syncSuggestions]);

  const activeHauls = contracts.filter((c) => c.status === "inProgress");
  const idleTrucks = vehicles.filter((v) => v.status === "idle");
  const vehiclesById = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
          Active Hauls ({activeHauls.length})
        </h3>
        {activeHauls.length === 0 ? (
          <p className="text-slate-500 text-sm">Nothing on the road.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeHauls.map((c) => (
              <ActiveHaulRow key={c.id} contract={c} vehicle={vehiclesById.get(c.assignedVehicleId ?? "")} currentDay={currentDay} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="text-sm uppercase tracking-wide text-slate-400">
            Idle Trucks ({idleTrucks.length})
          </h3>
          {idleTrucks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as DispatchStrategy)}
                className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1"
                title="How Dispatch All ranks candidate hauls"
              >
                {(Object.keys(STRATEGY_LABELS) as DispatchStrategy[]).map((k) => (
                  <option key={k} value={k}>
                    {STRATEGY_LABELS[k]}
                  </option>
                ))}
              </select>
              <select
                value={loadPref}
                onChange={(e) => setLoadPref(e.target.value as LoadPreference)}
                className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1"
                title="Which load size Dispatch All sends"
              >
                {(Object.keys(LOAD_PREF_LABELS) as LoadPreference[]).map((k) => (
                  <option key={k} value={k}>
                    {LOAD_PREF_LABELS[k]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => dispatchAll(strategy, loadPref)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded transition-colors"
              >
                Dispatch All ({idleTrucks.length})
              </button>
            </div>
          )}
        </div>
        {vehicles.length === 0 ? (
          <p className="text-slate-500 text-sm">No trucks yet — buy one in Fleet Manager.</p>
        ) : idleTrucks.length === 0 ? (
          <p className="text-slate-500 text-sm">Every truck is out on a haul.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {idleTrucks.map((v) => (
              <IdleTruckCard
                key={v.id}
                vehicle={v}
                suggestion={suggestions[v.id]}
                terminals={terminals}
                licenses={licenses}
                currentDay={currentDay}
                onDispatch={(loadSize) => dispatchJob(v.id, loadSize)}
                onReroll={() => rerollSuggestion(v.id)}
                onRetarget={(code) => setSuggestionDestination(v.id, code)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ActiveHaulRow({
  contract,
  vehicle,
  currentDay,
}: {
  contract: Contract;
  vehicle: Vehicle | undefined;
  currentDay: number;
}) {
  const pct = contract.distanceMiles > 0
    ? Math.min(100, Math.round((contract.progressMiles / contract.distanceMiles) * 100))
    : 0;
  const daysLeft = contract.deadlineDay - currentDay;
  return (
    <div className="bg-slate-900 rounded p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-white font-medium">
          {cityLabel(contract.originStateCode)} → {cityLabel(contract.destinationStateCode)}
        </div>
        <span className="text-emerald-400 font-semibold text-sm">{formatCents(contract.payoutCents)}</span>
      </div>
      <div className="text-xs text-slate-400">
        {vehicle ? `${vehicle.make} ${vehicle.model}` : "—"} · {contract.cargoType} ·{" "}
        {contract.loadSize} · {contract.weightLbs.toLocaleString()} lbs
      </div>
      <RouteChips path={contract.routePath} />
      <div className="h-2 bg-slate-800 rounded overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-slate-500 flex justify-between">
        <span>
          {Math.round(contract.progressMiles).toLocaleString()} / {contract.distanceMiles.toLocaleString()} mi ({pct}%)
        </span>
        <span className={daysLeft < 0 ? "text-amber-400" : ""}>
          {daysLeft < 0 ? `${-daysLeft}d late` : `due day ${contract.deadlineDay} (${daysLeft}d)`}
        </span>
      </div>
    </div>
  );
}

function IdleTruckCard({
  vehicle,
  suggestion,
  terminals,
  licenses,
  currentDay,
  onDispatch,
  onReroll,
  onRetarget,
}: {
  vehicle: Vehicle;
  suggestion: JobSuggestion | undefined;
  terminals: Terminal[];
  licenses: License[];
  currentDay: number;
  onDispatch: (loadSize: LoadSize) => void;
  onReroll: () => void;
  onRetarget: (destinationStateCode: string) => void;
}) {
  const [loadSize, setLoadSize] = useState<LoadSize>("light");

  const terminal = terminals.find((t) => t.id === vehicle.assignedTerminalId);

  if (!suggestion) {
    return (
      <div className="bg-slate-900 rounded p-3 text-sm text-slate-400">
        {vehicle.year} {vehicle.make} {vehicle.model} — preparing a suggestion…
      </div>
    );
  }

  const opt = suggestion.options[loadSize];
  const missing = opt.requiredLicenses.filter(
    (type) => !hasLicense(licenses, type, currentDay, suggestion.originStateCode)
  );

  return (
    <div className="bg-slate-900 rounded p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-white font-medium">
          {vehicle.year} {vehicle.make} {vehicle.model}
          <span className="text-slate-500 font-normal"> · {CLASS_LABEL[vehicle.class]}</span>
        </div>
        <button
          onClick={onReroll}
          className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded px-2 py-1 transition-colors"
        >
          ↻ Suggest another
        </button>
      </div>

      <div className="text-xs text-slate-400">
        From {terminal ? `terminal ${terminal.city}, ${terminal.stateCode}` : `home ${cityLabel(suggestion.originStateCode)}`}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 text-xs">Destination</span>
        <select
          value={suggestion.destinationStateCode}
          onChange={(e) => onRetarget(e.target.value)}
          className="bg-slate-700 text-white text-sm rounded px-2 py-1"
        >
          {ROAD_CONNECTED_STATES.filter((c) => c !== suggestion.originStateCode).map((c) => {
            const st = STATES.find((s) => s.code === c);
            return (
              <option key={c} value={c}>
                {c} — {st?.majorCity ?? c}
              </option>
            );
          })}
        </select>
        <span className="text-xs text-slate-500">{suggestion.distanceMiles.toLocaleString()} mi</span>
      </div>

      <RouteChips path={suggestion.routePath} />
      <div className="text-xs text-slate-400">Cargo: {suggestion.cargoType}</div>

      <div className="flex gap-1">
        {(["light", "heavy"] as LoadSize[]).map((size) => {
          const o = suggestion.options[size];
          const better =
            o.feasible && o.estNetCentsPerDay >= suggestion.options[size === "light" ? "heavy" : "light"].estNetCentsPerDay;
          return (
            <button
              key={size}
              onClick={() => setLoadSize(size)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                loadSize === size ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {size === "light" ? "Light" : "Heavy"} · {o.weightLbs.toLocaleString()} lbs
              {o.feasible && (
                <span className={loadSize === size ? "text-emerald-100" : "text-slate-500"}>
                  {" "}· {formatCents(o.estNetCentsPerDay)}/d{better ? " ★" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <Stat label="Payout" value={formatCents(opt.payoutCents)} />
        <Stat label="Est. net" value={formatCents(opt.estNetCents)} />
        <Stat label="Per day" value={`${formatCents(opt.estNetCentsPerDay)}/d`} />
        <Stat label="ETA" value={`~${opt.estimatedDays}d`} />
      </div>

      {opt.requiredVehicleClass !== vehicle.class && (
        <div className="text-xs text-slate-400">Needs: {CLASS_LABEL[opt.requiredVehicleClass]}</div>
      )}
      {missing.length > 0 && (
        <div className="text-xs text-amber-400">Missing: {missing.map(licenseLabel).join(", ")}</div>
      )}

      <button
        onClick={() => onDispatch(loadSize)}
        disabled={!opt.feasible}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold px-3 py-1.5 rounded transition-colors self-start"
      >
        {opt.feasible
          ? `Dispatch ${loadSize === "light" ? "Light" : "Heavy"} load`
          : opt.blockReason ?? "Can't dispatch"}
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800 rounded px-2 py-1">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-200 font-medium">{value}</div>
    </div>
  );
}
