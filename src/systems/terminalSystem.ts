import type { Terminal } from "../types";
import { BALANCE } from "../data/balance";
import { TERMINAL_TIERS } from "../data/terminalCatalog";
import { getState } from "../data/stateData";

/** Total vehicles the fleet can hold: a small base allowance plus each terminal's capacity. */
export function getFleetCapacity(terminals: Terminal[]): number {
  return (
    BALANCE.baseFleetCapacityNoTerminals +
    terminals.reduce((sum, t) => sum + t.vehicleCapacity, 0)
  );
}

/**
 * Cost to open a new (tier 1) terminal in a state — the base tier-1 price
 * scaled by that state's freight demand. Single source of truth for both
 * the store (which charges it) and the map UI (which displays/gates on it).
 */
export function getNewTerminalPriceCents(stateCode: string): number {
  const demandMultiplier = getState(stateCode)?.demandMultiplier ?? 1;
  return Math.round(TERMINAL_TIERS[1].priceCents * demandMultiplier);
}
