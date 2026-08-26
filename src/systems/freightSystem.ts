import type {
  Contract,
  GameState,
  JobSuggestion,
  LicenseType,
  LoadOption,
  LoadSize,
  Vehicle,
  VehicleClass,
} from "../types";
import { BALANCE } from "../data/balance";
import { CARGO_TYPES, getState } from "../data/stateData";
import { ROAD_CONNECTED_STATES, findRoute } from "../data/roadNetwork";
import { hasLicense } from "./licenseSystem";

const CARGO_LICENSE_REQUIREMENTS: Partial<Record<string, LicenseType>> = {
  "Hazardous Materials": "hazmatEndorsement",
  "Refrigerated Goods": "refrigeratedFreightCert",
};

// Flat fuel price used only for the estimate shown in the UI and for ranking
// candidates in "Dispatch All" — the tick engine uses the real per-state price.
const ESTIMATE_FUEL_PRICE_CENTS = 350;

/** How "Dispatch All" ranks candidate hauls for each truck. */
export type DispatchStrategy = "profitPerHaul" | "profitPerDay" | "shortest";
/** Which load size "Dispatch All" sends. */
export type LoadPreference = "auto" | "light" | "heavy";

const CLASS_ORDER: VehicleClass[] = ["van", "boxTruck", "semi"];
const CLASS_LABEL: Record<VehicleClass, string> = {
  van: "Van",
  boxTruck: "Box Truck",
  semi: "Semi",
};

function classRank(c: VehicleClass): number {
  return CLASS_ORDER.indexOf(c);
}

/**
 * The vehicle class a suggested haul is sized for: usually the dispatching
 * vehicle's own class, sometimes one smaller, sometimes one larger (a job you
 * can see but need a bigger rig to take).
 */
function pickJobClass(vehicleClass: VehicleClass, rng: () => number): VehicleClass {
  const rank = classRank(vehicleClass);
  const r = rng();
  if (r < 0.6) return vehicleClass;
  if (r < 0.8 && rank > 0) return CLASS_ORDER[rank - 1];
  if (rank < CLASS_ORDER.length - 1) return CLASS_ORDER[rank + 1];
  return vehicleClass;
}

function randomItem<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function randomInRange(min: number, max: number, rng: () => number): number {
  return Math.round(min + rng() * (max - min));
}

/** Where a vehicle's trips start: its terminal's state, else the company home state. */
export function vehicleOriginState(state: GameState, vehicle: Vehicle): string {
  if (vehicle.assignedTerminalId) {
    const terminal = state.terminals.find((t) => t.id === vehicle.assignedTerminalId);
    if (terminal) return terminal.stateCode;
  }
  return state.company.homeStateCode;
}

function pickDestination(originCode: string, rng: () => number): string {
  const candidates = ROAD_CONNECTED_STATES.filter((c) => c !== originCode);
  // Demand-weighted so busy states come up more often.
  const weights = candidates.map((c) => getState(c)?.demandMultiplier ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function requiredLicensesFor(cargoType: string, weightLbs: number): LicenseType[] {
  const required: LicenseType[] = ["interstateOperatingAuthority"];
  const cargoLicense = CARGO_LICENSE_REQUIREMENTS[cargoType];
  if (cargoLicense) required.push(cargoLicense);
  if (weightLbs > BALANCE.oversizeWeightThresholdLbs) required.push("oversizeLoadPermit");
  return required;
}

function buildLoadOption(
  state: GameState,
  vehicle: Vehicle,
  loadSize: LoadSize,
  weightLbs: number,
  requiredVehicleClass: VehicleClass,
  cargoType: string,
  distanceMiles: number,
  demandFactor: number,
  originCode: string
): LoadOption {
  const requiredLicenses = requiredLicensesFor(cargoType, weightLbs);

  const reputationFactor = 0.7 + (state.company.reputation / 100) * 0.6;
  const ratePerMile =
    BALANCE.payoutBaseCentsPerMile + BALANCE.payoutCentsPerTonMile * (weightLbs / 2000);
  const payoutCents = Math.round(distanceMiles * ratePerMile * demandFactor * reputationFactor);

  const milesPerDay =
    BALANCE.baseTruckSpeedMph * BALANCE.drivingHoursPerDay * BALANCE.loadSpeedFactor[loadSize];
  const estimatedDays = Math.max(1, Math.ceil(distanceMiles / milesPerDay));

  // Rough net estimate for ranking/UI (uses a flat fuel price, not the per-state one).
  const effMpg = vehicle.fuelEfficiencyMpg / BALANCE.loadFuelPenalty[loadSize];
  const estFuelCents = (distanceMiles / effMpg) * ESTIMATE_FUEL_PRICE_CENTS;
  const estMaintCents =
    distanceMiles * vehicle.maintenanceCostPerMileCents * BALANCE.loadWearFactor[loadSize];
  const estNetCents = Math.round(payoutCents - estFuelCents - estMaintCents);
  const estNetCentsPerDay = Math.round(estNetCents / estimatedDays);

  let feasible = true;
  let blockReason: string | undefined;
  if (classRank(vehicle.class) < classRank(requiredVehicleClass)) {
    feasible = false;
    blockReason = `Needs ${CLASS_LABEL[requiredVehicleClass]}`;
  } else if (vehicle.cargoCapacityLbs < weightLbs) {
    feasible = false;
    blockReason = `Over ${vehicle.make} ${vehicle.model} capacity`;
  } else {
    const missing = requiredLicenses.filter(
      (type) => !hasLicense(state.licenses, type, state.company.currentDay, originCode)
    );
    if (missing.length > 0) {
      feasible = false;
      blockReason = `Missing license${missing.length > 1 ? "s" : ""}`;
    }
  }

  return {
    loadSize,
    weightLbs,
    payoutCents,
    estNetCents,
    estNetCentsPerDay,
    requiredVehicleClass,
    requiredLicenses,
    estimatedDays,
    feasible,
    blockReason,
  };
}

/**
 * Builds a suggested haul for one idle vehicle: a destination, an interstate
 * route, a cargo, and a light/heavy load option pair. Pure aside from `rng`.
 * `destOverride` forces a specific destination (used when the player retargets).
 */
export function suggestJob(
  state: GameState,
  vehicle: Vehicle,
  rng: () => number = Math.random,
  destOverride?: string
): JobSuggestion {
  const originCode = vehicleOriginState(state, vehicle);

  let destinationCode =
    destOverride && destOverride !== originCode ? destOverride : pickDestination(originCode, rng);

  let route = findRoute(originCode, destinationCode);
  if (!route || route.path.length < 2) {
    // Origin off the graph (shouldn't happen post new-game screen) or degenerate —
    // fall back to any reachable state.
    destinationCode = pickDestination(originCode, rng);
    route = findRoute(originCode, destinationCode);
  }
  const routePath = route ? route.path : [originCode, destinationCode];
  const distanceMiles = route ? route.miles : 0;

  const cargoType = randomItem(CARGO_TYPES, rng);
  const jobClass = pickJobClass(vehicle.class, rng);
  const refCapacity = BALANCE.classLoadCapacityLbs[jobClass];
  const lightWeight = Math.round(
    refCapacity * randomInRange(BALANCE.lightLoadFraction[0] * 100, BALANCE.lightLoadFraction[1] * 100, rng) / 100
  );
  const heavyWeight = Math.round(
    refCapacity * randomInRange(BALANCE.heavyLoadFraction[0] * 100, BALANCE.heavyLoadFraction[1] * 100, rng) / 100
  );

  const demandFactor =
    ((getState(originCode)?.demandMultiplier ?? 1) +
      (getState(destinationCode)?.demandMultiplier ?? 1)) /
    2;

  return {
    vehicleId: vehicle.id,
    originStateCode: originCode,
    destinationStateCode: destinationCode,
    routePath,
    distanceMiles,
    cargoType,
    options: {
      light: buildLoadOption(
        state,
        vehicle,
        "light",
        lightWeight,
        jobClass,
        cargoType,
        distanceMiles,
        demandFactor,
        originCode
      ),
      heavy: buildLoadOption(
        state,
        vehicle,
        "heavy",
        heavyWeight,
        jobClass,
        cargoType,
        distanceMiles,
        demandFactor,
        originCode
      ),
    },
  };
}

let nextContractSeq = 1;

/** Turns a chosen load option into a live in-progress haul. */
export function createContractFromSuggestion(
  suggestion: JobSuggestion,
  loadSize: LoadSize,
  currentDay: number
): Contract {
  const option = suggestion.options[loadSize];
  const deadlineDay = currentDay + Math.ceil(option.estimatedDays * BALANCE.deadlineSlack);
  return {
    id: `contract-${nextContractSeq++}`,
    originStateCode: suggestion.originStateCode,
    destinationStateCode: suggestion.destinationStateCode,
    routePath: suggestion.routePath,
    cargoType: suggestion.cargoType,
    weightLbs: option.weightLbs,
    loadSize,
    requiredVehicleClass: option.requiredVehicleClass,
    requiredLicenses: option.requiredLicenses,
    payoutCents: option.payoutCents,
    distanceMiles: suggestion.distanceMiles,
    progressMiles: 0,
    deadlineDay,
    startedOnDay: currentDay,
    status: "inProgress",
    assignedVehicleId: suggestion.vehicleId,
  };
}

function optionScore(opt: LoadOption, strategy: DispatchStrategy): number {
  if (strategy === "profitPerHaul") return opt.estNetCents;
  if (strategy === "profitPerDay") return opt.estNetCentsPerDay;
  // shortest: fewest days wins, net profit breaks ties
  return -opt.estimatedDays * 1e9 + opt.estNetCents;
}

/**
 * Picks the load size to send for a suggestion, honoring the preference.
 * "auto" chooses whichever feasible option scores better for the strategy.
 * Returns null if no allowed load is feasible.
 */
export function chooseLoad(
  suggestion: JobSuggestion,
  preference: LoadPreference,
  strategy: DispatchStrategy
): LoadSize | null {
  const feasible = (["light", "heavy"] as LoadSize[]).filter((s) => suggestion.options[s].feasible);
  if (feasible.length === 0) return null;
  if (preference === "light") return feasible.includes("light") ? "light" : null;
  if (preference === "heavy") return feasible.includes("heavy") ? "heavy" : null;
  return feasible.reduce((best, s) =>
    optionScore(suggestion.options[s], strategy) > optionScore(suggestion.options[best], strategy)
      ? s
      : best
  );
}

/**
 * Samples several candidate hauls for a vehicle and returns the best one per the
 * strategy, along with the load size to send. `loadSize` is null when no sampled
 * candidate had a feasible allowed load (the returned suggestion is then just the
 * best-paying one, for display). Pure aside from `rng`.
 */
export function optimizeJob(
  state: GameState,
  vehicle: Vehicle,
  strategy: DispatchStrategy,
  preference: LoadPreference,
  rng: () => number = Math.random,
  samples = 8
): { suggestion: JobSuggestion; loadSize: LoadSize | null } {
  let best: { suggestion: JobSuggestion; loadSize: LoadSize | null } | null = null;
  let bestScore = -Infinity;
  let fallback: JobSuggestion | null = null;
  let fallbackScore = -Infinity;

  for (let i = 0; i < samples; i++) {
    const suggestion = suggestJob(state, vehicle, rng);
    const payoutMax = Math.max(
      suggestion.options.light.payoutCents,
      suggestion.options.heavy.payoutCents
    );
    if (payoutMax > fallbackScore) {
      fallbackScore = payoutMax;
      fallback = suggestion;
    }
    const loadSize = chooseLoad(suggestion, preference, strategy);
    if (!loadSize) continue;
    const score = optionScore(suggestion.options[loadSize], strategy);
    if (score > bestScore) {
      bestScore = score;
      best = { suggestion, loadSize };
    }
  }

  return best ?? { suggestion: fallback!, loadSize: null };
}
