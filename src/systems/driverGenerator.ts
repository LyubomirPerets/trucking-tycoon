import type { DriverCandidate } from "../types";
import {
  CDL_CLASSES,
  DRIVER_FIRST_NAMES,
  DRIVER_LAST_NAMES,
  WAGE_PER_MILE_CENTS_BY_EXPERIENCE,
} from "../data/driverCatalog";

function randomItem<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

let nextCandidateSeq = 1;

/** Generates a single hiring-pool candidate. Pure aside from the injected rng. */
export function generateDriverCandidate(
  currentDay: number,
  rng: () => number = Math.random
): DriverCandidate {
  const experienceLevel = (Math.floor(rng() * 5) + 1) as 1 | 2 | 3 | 4 | 5;
  const baseWage = WAGE_PER_MILE_CENTS_BY_EXPERIENCE[experienceLevel];
  const wageJitter = Math.round(baseWage * (rng() * 0.2 - 0.1)); // +/-10%

  return {
    id: `candidate-${nextCandidateSeq++}`,
    name: `${randomItem(DRIVER_FIRST_NAMES, rng)} ${randomItem(DRIVER_LAST_NAMES, rng)}`,
    experienceLevel,
    cdlClass: randomItem(CDL_CLASSES, rng),
    wagePerMileCents: baseWage + wageJitter,
    offeredOnDay: currentDay,
  };
}

export function generateDriverCandidates(
  count: number,
  currentDay: number,
  rng: () => number = Math.random
): DriverCandidate[] {
  return Array.from({ length: count }, () => generateDriverCandidate(currentDay, rng));
}
