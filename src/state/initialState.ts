import type { GameState } from "../types";
import { BALANCE } from "../data/balance";

export function createInitialState(): GameState {
  return {
    company: {
      name: "New Trucking Co.",
      cashCents: BALANCE.startingCashCents,
      reputation: BALANCE.startingReputation,
      currentDay: 1,
      headquarters: null,
      homeStateCode: "",
    },
    vehicles: [],
    licenses: [],
    terminals: [],
    contracts: [],
    eventLog: [
      {
        id: "event-welcome",
        day: 1,
        type: "info",
        message: "Welcome to Trucking Empire. Buy your first vehicle to get started.",
      },
    ],
  };
}
