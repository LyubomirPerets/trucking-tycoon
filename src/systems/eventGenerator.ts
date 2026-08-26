import type { GameEvent, Vehicle } from "../types";
import { BALANCE } from "../data/balance";

let nextEventSeq = 1;

function makeEvent(day: number, type: GameEvent["type"], message: string): GameEvent {
  return { id: `event-${nextEventSeq++}`, day, type, message };
}

/**
 * Rolls breakdown risk for a single vehicle currently en route.
 * Returns an event if a breakdown occurs, otherwise null. Pure aside from rng.
 */
export function rollBreakdown(
  vehicle: Vehicle,
  day: number,
  rng: () => number = Math.random
): GameEvent | null {
  if (vehicle.condition >= BALANCE.breakdownConditionThreshold) return null;
  const severity = (BALANCE.breakdownConditionThreshold - vehicle.condition) / BALANCE.breakdownConditionThreshold;
  const chance = BALANCE.breakdownBaseChance * (1 + severity * 3);
  if (rng() >= chance) return null;
  return makeEvent(
    day,
    "breakdown",
    `${vehicle.make} ${vehicle.model} (${vehicle.id}) broke down due to poor condition.`
  );
}

export function makeInfoEvent(day: number, message: string): GameEvent {
  return makeEvent(day, "info", message);
}

export function makeContractOfferEvent(day: number, count: number): GameEvent {
  return makeEvent(day, "contractOffer", `${count} new contract${count === 1 ? "" : "s"} offered this week.`);
}

export function makeContractCompletedEvent(day: number, payoutCents: number, contractId: string): GameEvent {
  return makeEvent(
    day,
    "contractCompleted",
    `Contract ${contractId} completed. Paid out $${(payoutCents / 100).toLocaleString()}.`
  );
}

export function makeContractFailedEvent(day: number, contractId: string, reason: string): GameEvent {
  return makeEvent(day, "contractFailed", `Contract ${contractId} failed: ${reason}`);
}

export function makeLicenseRenewedEvent(day: number, label: string, costCents: number): GameEvent {
  return makeEvent(day, "info", `Renewed ${label} for $${(costCents / 100).toLocaleString()}.`);
}

export function makeLicenseExpiredEvent(day: number, label: string): GameEvent {
  return makeEvent(day, "info", `${label} expired and lapsed — insufficient funds to renew.`);
}
