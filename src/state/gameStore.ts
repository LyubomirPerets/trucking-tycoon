import { create } from "zustand";
import type { Driver, GameState, License, LicenseType, Terminal, Vehicle } from "../types";
import { createInitialState } from "./initialState";
import { advanceDay as advanceDayPure } from "../systems/tickEngine";
import type { VehicleCatalogEntry } from "../data/vehicleCatalog";
import { LICENSE_CATALOG } from "../data/licenseCatalog";
import { TERMINAL_TIERS } from "../data/terminalCatalog";
import { getState as getStateInfo } from "../data/stateData";
import { BALANCE } from "../data/balance";
import { makeInfoEvent } from "../systems/eventGenerator";
import { hasAllRequiredLicenses, hasLicense } from "../systems/licenseSystem";
import { getFleetCapacity } from "../systems/terminalSystem";

const SAVE_KEY = "trucking-tycoon-save";

let nextVehicleSeq = 1;
let nextDriverSeq = 1;
let nextLicenseSeq = 1;
let nextTerminalSeq = 1;

function loadFromStorage(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    // Merge over fresh defaults so a save from before a field existed
    // (e.g. driverCandidates) doesn't crash the app on load.
    const defaults = createInitialState();
    return {
      company: { ...defaults.company, ...parsed.company },
      vehicles: parsed.vehicles ?? defaults.vehicles,
      licenses: parsed.licenses ?? defaults.licenses,
      terminals: parsed.terminals ?? defaults.terminals,
      drivers: parsed.drivers ?? defaults.drivers,
      driverCandidates: parsed.driverCandidates ?? defaults.driverCandidates,
      contracts: parsed.contracts ?? defaults.contracts,
      eventLog: parsed.eventLog ?? defaults.eventLog,
    };
  } catch {
    return null;
  }
}

interface GameStore {
  state: GameState;
  advanceDay: () => void;
  buyVehicle: (entry: VehicleCatalogEntry) => void;
  hireDriver: (candidateId: string) => void;
  buyLicense: (type: LicenseType, stateCode: string | null) => void;
  buyTerminal: (stateCode: string) => void;
  upgradeTerminal: (terminalId: string) => void;
  acceptContract: (contractId: string) => void;
  assignCrewToContract: (contractId: string, vehicleId: string, driverId: string) => void;
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
      if (s.state.vehicles.length >= getFleetCapacity(s.state.terminals)) return s;
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

  hireDriver: (candidateId) =>
    set((s) => {
      const candidate = s.state.driverCandidates.find((c) => c.id === candidateId);
      if (!candidate) return s;

      const driver: Driver = {
        id: `driver-${nextDriverSeq++}`,
        name: candidate.name,
        hiredOnDay: s.state.company.currentDay,
        wagePerMileCents: candidate.wagePerMileCents,
        experienceLevel: candidate.experienceLevel,
        cdlClass: candidate.cdlClass,
        homeTerminalId: null,
        status: "available",
      };

      return {
        state: {
          ...s.state,
          drivers: [...s.state.drivers, driver],
          driverCandidates: s.state.driverCandidates.filter((c) => c.id !== candidateId),
          eventLog: [
            ...s.state.eventLog,
            makeInfoEvent(s.state.company.currentDay, `Hired driver ${driver.name}.`),
          ],
        },
      };
    }),

  buyLicense: (type, stateCode) =>
    set((s) => {
      const catalogEntry = LICENSE_CATALOG.find((e) => e.type === type);
      if (!catalogEntry) return s;
      if (catalogEntry.scoped && !stateCode) return s;
      if (s.state.company.cashCents < catalogEntry.priceCents) return s;

      const relevantStateCode = catalogEntry.scoped ? stateCode! : "";
      if (hasLicense(s.state.licenses, type, s.state.company.currentDay, relevantStateCode)) return s;

      const license: License = {
        id: `license-${nextLicenseSeq++}`,
        type,
        stateCode: catalogEntry.scoped ? stateCode : null,
        acquiredOnDay: s.state.company.currentDay,
        annualRenewalCostCents: catalogEntry.annualRenewalCostCents,
        expiresOnDay: s.state.company.currentDay + BALANCE.licenseTermDays,
      };

      return {
        state: {
          ...s.state,
          company: {
            ...s.state.company,
            cashCents: s.state.company.cashCents - catalogEntry.priceCents,
          },
          licenses: [...s.state.licenses, license],
          eventLog: [
            ...s.state.eventLog,
            makeInfoEvent(
              s.state.company.currentDay,
              `Acquired ${catalogEntry.label}${stateCode ? ` (${stateCode})` : ""}.`
            ),
          ],
        },
      };
    }),

  buyTerminal: (stateCode) =>
    set((s) => {
      if (s.state.terminals.some((t) => t.stateCode === stateCode)) return s;
      const stateInfo = getStateInfo(stateCode);
      if (!stateInfo) return s;

      const tier1 = TERMINAL_TIERS[1];
      const priceCents = Math.round(tier1.priceCents * stateInfo.demandMultiplier);
      if (s.state.company.cashCents < priceCents) return s;

      const terminal: Terminal = {
        id: `terminal-${nextTerminalSeq++}`,
        stateCode,
        city: stateInfo.majorCity,
        tier: 1,
        vehicleCapacity: tier1.vehicleCapacity,
        monthlyLeaseCostCents: tier1.monthlyLeaseCostCents,
        purchasePriceCents: priceCents,
        staffCount: 2,
      };

      return {
        state: {
          ...s.state,
          company: {
            ...s.state.company,
            cashCents: s.state.company.cashCents - priceCents,
          },
          terminals: [...s.state.terminals, terminal],
          eventLog: [
            ...s.state.eventLog,
            makeInfoEvent(s.state.company.currentDay, `Opened a terminal in ${stateInfo.majorCity}, ${stateCode}.`),
          ],
        },
      };
    }),

  upgradeTerminal: (terminalId) =>
    set((s) => {
      const terminal = s.state.terminals.find((t) => t.id === terminalId);
      if (!terminal) return s;
      if (terminal.tier >= 3) return s;

      const nextTier = (terminal.tier + 1) as 2 | 3;
      const tierInfo = TERMINAL_TIERS[nextTier];
      if (s.state.company.cashCents < tierInfo.priceCents) return s;

      return {
        state: {
          ...s.state,
          company: {
            ...s.state.company,
            cashCents: s.state.company.cashCents - tierInfo.priceCents,
          },
          terminals: s.state.terminals.map((t) =>
            t.id === terminalId
              ? {
                  ...t,
                  tier: nextTier,
                  vehicleCapacity: tierInfo.vehicleCapacity,
                  monthlyLeaseCostCents: tierInfo.monthlyLeaseCostCents,
                }
              : t
          ),
          eventLog: [
            ...s.state.eventLog,
            makeInfoEvent(
              s.state.company.currentDay,
              `Upgraded terminal in ${terminal.city}, ${terminal.stateCode} to tier ${nextTier}.`
            ),
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

  assignCrewToContract: (contractId, vehicleId, driverId) =>
    set((s) => {
      const contract = s.state.contracts.find((c) => c.id === contractId);
      const vehicle = s.state.vehicles.find((v) => v.id === vehicleId);
      const driver = s.state.drivers.find((d) => d.id === driverId);
      if (!contract || !vehicle || !driver) return s;
      if (contract.status !== "accepted") return s;
      if (vehicle.status !== "idle") return s;
      if (driver.status !== "available") return s;
      if (vehicle.class !== contract.requiredVehicleClass) return s;
      if (
        !hasAllRequiredLicenses(
          s.state.licenses,
          contract.requiredLicenses,
          s.state.company.currentDay,
          contract.originStateCode
        )
      )
        return s;

      return {
        state: {
          ...s.state,
          contracts: s.state.contracts.map((c) =>
            c.id === contractId
              ? { ...c, status: "inProgress", assignedVehicleId: vehicleId, assignedDriverId: driverId }
              : c
          ),
          vehicles: s.state.vehicles.map((v) =>
            v.id === vehicleId ? { ...v, status: "enRoute" } : v
          ),
          drivers: s.state.drivers.map((d) =>
            d.id === driverId ? { ...d, status: "onRoute" } : d
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
