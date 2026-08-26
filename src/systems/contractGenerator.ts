import type { Contract, GameState, VehicleClass } from "../types";
import { BALANCE } from "../data/balance";
import { CARGO_TYPES, STATES, getState } from "../data/stateData";

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

  return {
    id: `contract-${nextContractSeq++}`,
    originStateCode: origin.code,
    destinationStateCode: destination.code,
    cargoType: randomItem(CARGO_TYPES, rng),
    weightLbs: randomInRange(500, 40_000, rng),
    requiredVehicleClass,
    requiredLicenses: [],
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
