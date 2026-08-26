import { create } from "zustand";
import type { GameState, Vehicle } from "../types";
import { createInitialState } from "./initialState";
import { advanceDay as advanceDayPure } from "../systems/tickEngine";
import type { VehicleCatalogEntry } from "../data/vehicleCatalog";
import { makeInfoEvent } from "../systems/eventGenerator";

const SAVE_KEY = "trucking-tycoon-save";

let nextVehicleSeq = 1;

function loadFromStorage(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

interface GameStore {
  state: GameState;
  advanceDay: () => void;
  buyVehicle: (entry: VehicleCatalogEntry) => void;
  acceptContract: (contractId: string) => void;
  assignVehicleToContract: (contractId: string, vehicleId: string) => void;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: loadFromStorage() ?? createInitialState(),

  advanceDay: () =>
    set((s) => ({ state: advanceDayPure(s.state) })),

  buyVehicle: (entry) =>
    set((s) => {
      if (s.state.company.cashCents < entry.priceCents) return s;
      const vehicle: Vehicle = {
        id: `vehicle-${nextVehicleSeq++}`,
        class: entry.class,
        make: entry.make,
        model: entry.model,
        year: entry.year,
        purchasePriceCents: entry.priceCents,
        mileage: 0,
        condition: 100,
        maintenanceCostPerMileCents: entry.maintenanceCostPerMileCents,
        fuelEfficiencyMpg: entry.fuelEfficiencyMpg,
        cargoCapacityLbs: entry.cargoCapacityLbs,
        assignedDriverId: null,
        assignedTerminalId: null,
        status: "idle",
      };
      return {
        state: {
          ...s.state,
          company: {
            ...s.state.company,
            cashCents: s.state.company.cashCents - entry.priceCents,
          },
          vehicles: [...s.state.vehicles, vehicle],
          eventLog: [
            ...s.state.eventLog,
            makeInfoEvent(s.state.company.currentDay, `Purchased ${entry.make} ${entry.model}.`),
          ],
        },
      };
    }),

  acceptContract: (contractId) =>
    set((s) => ({
      state: {
        ...s.state,
        contracts: s.state.contracts.map((c) =>
          c.id === contractId && c.status === "offered" ? { ...c, status: "accepted" } : c
        ),
      },
    })),

  assignVehicleToContract: (contractId, vehicleId) =>
    set((s) => {
      const contract = s.state.contracts.find((c) => c.id === contractId);
      const vehicle = s.state.vehicles.find((v) => v.id === vehicleId);
      if (!contract || !vehicle) return s;
      if (contract.status !== "accepted") return s;
      if (vehicle.status !== "idle") return s;
      if (vehicle.class !== contract.requiredVehicleClass) return s;

      return {
        state: {
          ...s.state,
          contracts: s.state.contracts.map((c) =>
            c.id === contractId ? { ...c, status: "inProgress", assignedVehicleId: vehicleId } : c
          ),
          vehicles: s.state.vehicles.map((v) =>
            v.id === vehicleId ? { ...v, status: "enRoute", assignedTerminalId: v.assignedTerminalId } : v
          ),
        },
      };
    }),

  saveGame: () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(get().state));
  },

  loadGame: () => {
    const loaded = loadFromStorage();
    if (loaded) set({ state: loaded });
  },

  resetGame: () => {
    localStorage.removeItem(SAVE_KEY);
    set({ state: createInitialState() });
  },
}));
