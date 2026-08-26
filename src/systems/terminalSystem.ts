import type { Terminal } from "../types";
import { BALANCE } from "../data/balance";

/** Total vehicles the fleet can hold: a small base allowance plus each terminal's capacity. */
export function getFleetCapacity(terminals: Terminal[]): number {
  return (
    BALANCE.baseFleetCapacityNoTerminals +
    terminals.reduce((sum, t) => sum + t.vehicleCapacity, 0)
  );
}
