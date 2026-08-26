import type { GameState } from "../types";
import { BALANCE } from "../data/balance";
import { generateDriverCandidates } from "../systems/driverGenerator";

export function createInitialState(): GameState {
  return {
    company: {
      name: "New Trucking Co.",
      cashCents: BALANCE.startingCashCents,
      reputation: BALANCE.startingReputation,
      currentDay: 1,
      headquarters: null,
    },
    vehicles: [],
    licenses: [],
    terminals: [],
    drivers: [],
    driverCandidates: generateDriverCandidates(BALANCE.driverCandidatesPerWeek, 1),
    contracts: [],
    eventLog: [
      {
        id: "event-welcome",
        day: 1,
        type: "info",
        message: "Welcome to Trucking Empire. Buy your first van to get started.",
      },
    ],
  };
}
