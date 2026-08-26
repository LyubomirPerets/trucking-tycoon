import type { Contract, GameState, LicenseType, VehicleClass } from "../types";
import { BALANCE } from "../data/balance";
import { CARGO_TYPES, STATES, getState } from "../data/stateData";

const CARGO_LICENSE_REQUIREMENTS: Partial<Record<(typeof CARGO_TYPES)[number], LicenseType>> = {
  "Hazardous Materials": "hazmatEndorsement",
  "Refrigerated Goods": "refrigeratedFreightCert",
};

const VEHICLE_CLASSES: VehicleClass[] = ["van", "boxTruck", "semi"];

function randomItem<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function randomInRange(min: number, max: number, rng: () => number): number {
  return Math.round(min + rng() * (max - min));
}

let nextContractSeq = 1;

/**
 * Generates a single offered contract. Pure aside from the injected rng,
 * so callers can pass a seeded generator in tests for determinism.
 */
export function generateContract(
  currentDay: number,
  rng: () => number = Math.random
): Contract {
  const origin = randomItem(STATES, rng);
  let destination = randomItem(STATES, rng);
  while (destination.code === origin.code) {
    destination = randomItem(STATES, rng);
  }

  const distanceMiles = randomInRange(
    BALANCE.minContractDistanceMiles,
    BALANCE.maxContractDistanceMiles,
    rng
  );

  const demandFactor = ((getState(origin.code)?.demandMultiplier ?? 1) +
    (getState(destination.code)?.demandMultiplier ?? 1)) / 2;

  const requiredVehicleClass = randomItem(VEHICLE_CLASSES, rng);
  const payoutCents = Math.round(
    distanceMiles * BALANCE.payoutCentsPerMile * demandFactor
  );

  const travelDays = Math.ceil(distanceMiles / (BALANCE.averageTruckSpeedMph * 8));
  const deadlineDay = currentDay + travelDays + randomInRange(1, 4, rng);

  const cargoType = randomItem(CARGO_TYPES, rng);
  const weightLbs = randomInRange(500, 40_000, rng);

  // Every contract crosses state lines, so interstate authority is always
  // required; cargo type and heavy loads can layer on further requirements.
  const requiredLicenses: LicenseType[] = ["interstateOperatingAuthority"];
  const cargoLicense = CARGO_LICENSE_REQUIREMENTS[cargoType];
  if (cargoLicense) requiredLicenses.push(cargoLicense);
  if (weightLbs > BALANCE.oversizeWeightThresholdLbs) requiredLicenses.push("oversizeLoadPermit");

  return {
    id: `contract-${nextContractSeq++}`,
    originStateCode: origin.code,
    destinationStateCode: destination.code,
    cargoType,
    weightLbs,
    requiredVehicleClass,
    requiredLicenses,
    payoutCents,
    distanceMiles,
    deadlineDay,
    offeredOnDay: currentDay,
    status: "offered",
    assignedVehicleId: null,
    assignedDriverId: null,
  };
}

/**
 * Given the current state, returns newly-offered contracts to append.
 * Called weekly by the tick engine (does not mutate the input state).
 */
export function generateWeeklyContracts(
  state: GameState,
  rng: () => number = Math.random
): Contract[] {
  const count = BALANCE.contractsOfferedPerWeek;
  const generated: Contract[] = [];
  for (let i = 0; i < count; i++) {
    generated.push(generateContract(state.company.currentDay, rng));
  }
  return generated;
}
