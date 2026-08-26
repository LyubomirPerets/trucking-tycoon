import { create } from "zustand";
import type {
  Contract,
  GameState,
  JobSuggestion,
  License,
  LicenseType,
  LoadSize,
  Terminal,
  Vehicle,
} from "../types";
import { createInitialState } from "./initialState";
import { advanceDay as advanceDayPure } from "../systems/tickEngine";
import type { VehicleCatalogEntry } from "../data/vehicleCatalog";
import { LICENSE_CATALOG } from "../data/licenseCatalog";
import type { LicenseCatalogEntry } from "../data/licenseCatalog";
import { TERMINAL_TIERS } from "../data/terminalCatalog";
import { getState as getStateInfo, STATES } from "../data/stateData";
import { findRoute, isRoadConnected } from "../data/roadNetwork";
import { BALANCE } from "../data/balance";
import { makeInfoEvent } from "../systems/eventGenerator";
import { hasLicense } from "../systems/licenseSystem";
import { getFleetCapacity, getNewTerminalPriceCents } from "../systems/terminalSystem";
import {
  createContractFromSuggestion,
  optimizeJob,
  suggestJob,
} from "../systems/freightSystem";
import type { DispatchStrategy, LoadPreference } from "../systems/freightSystem";
import { formatCents } from "../utils/format";

const SAVE_KEY = "trucking-tycoon-save";

let nextVehicleSeq = 1;
let nextLicenseSeq = 1;
let nextTerminalSeq = 1;

function makeLicense(
  entry: LicenseCatalogEntry,
  stateCode: string | null,
  day: number
): License {
  return {
    id: `license-${nextLicenseSeq++}`,
    type: entry.type,
    stateCode: entry.scoped ? stateCode : null,
    acquiredOnDay: day,
    annualRenewalCostCents: entry.annualRenewalCostCents,
    expiresOnDay: day + BALANCE.licenseTermDays,
  };
}

/**
 * Keeps the ephemeral job-suggestion map in step with the current idle-vehicle
 * set: retains suggestions for vehicles still idle, generates one for each newly
 * idle vehicle, drops the rest. Empty until a home state is picked.
 */
function computeSuggestions(
  state: GameState,
  existing: Record<string, JobSuggestion>
): Record<string, JobSuggestion> {
  if (!state.company.homeStateCode) return {};
  const next: Record<string, JobSuggestion> = {};
  for (const v of state.vehicles) {
    if (v.status !== "idle") continue;
    next[v.id] = existing[v.id] ?? suggestJob(state, v);
  }
  return next;
}

function sanitizeContract(c: Contract): Contract {
  const legacy = c as Contract & { offeredOnDay?: number };
  const route =
    Array.isArray(c.routePath) && c.routePath.length >= 2
      ? c.routePath
      : findRoute(c.originStateCode, c.destinationStateCode)?.path ?? [
          c.originStateCode,
          c.destinationStateCode,
        ];
  const distanceMiles =
    typeof c.distanceMiles === "number" && c.distanceMiles > 0
      ? c.distanceMiles
      : findRoute(c.originStateCode, c.destinationStateCode)?.miles ?? 0;
  return {
    ...c,
    routePath: route,
    distanceMiles,
    progressMiles: typeof c.progressMiles === "number" ? c.progressMiles : 0,
    loadSize: c.loadSize === "heavy" ? "heavy" : "light",
    startedOnDay: typeof c.startedOnDay === "number" ? c.startedOnDay : legacy.offeredOnDay ?? 1,
  };
}

function loadFromStorage(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    // Merge over fresh defaults so a save from before a field existed
    // doesn't crash the app on load.
    const defaults = createInitialState();
    const parsedCompany: Partial<GameState["company"]> = parsed.company ?? {};
    const firstTerminalState = parsed.terminals?.[0]?.stateCode || "";
    const rawContracts = Array.isArray(parsed.contracts) ? parsed.contracts : defaults.contracts;
    return {
      company: {
        ...defaults.company,
        ...parsedCompany,
        homeStateCode: parsedCompany.homeStateCode ?? firstTerminalState,
      },
      vehicles: parsed.vehicles ?? defaults.vehicles,
      licenses: parsed.licenses ?? defaults.licenses,
      terminals: parsed.terminals ?? defaults.terminals,
      contracts: rawContracts
        .filter(
          (c) =>
            c &&
            (c.status === "inProgress" || c.status === "completed" || c.status === "failed")
        )
        .map(sanitizeContract),
      eventLog: parsed.eventLog ?? defaults.eventLog,
    };
  } catch {
    return null;
  }
}

interface GameStore {
  state: GameState;
  /**
   * Per-idle-vehicle suggested haul. Ephemeral — recomputed from game state,
   * never persisted.
   */
  jobSuggestions: Record<string, JobSuggestion>;
  /**
   * Dev/debug "free mode": when on, buying vehicles/terminals/upgrades costs
   * nothing and skips fleet-capacity limits. Transient — not persisted, resets
   * on reload.
   */
  freeMode: boolean;
  advanceDay: () => void;
  buyVehicle: (entry: VehicleCatalogEntry) => void;
  buyLicense: (type: LicenseType, stateCode: string | null) => void;
  buyTerminal: (stateCode: string) => void;
  upgradeTerminal: (terminalId: string) => void;
  setHomeState: (stateCode: string) => void;
  assignVehicleToTerminal: (vehicleId: string, terminalId: string | null) => void;
  dispatchJob: (vehicleId: string, loadSize: LoadSize) => void;
  dispatchAll: (strategy: DispatchStrategy, loadPreference: LoadPreference) => void;
  rerollSuggestion: (vehicleId: string) => void;
  setSuggestionDestination: (vehicleId: string, destinationStateCode: string) => void;
  syncSuggestions: () => void;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
  // ── Cheats ──
  toggleFreeMode: () => void;
  cheatInjectCash: (cents: number) => void;
  cheatGrantAllLicenses: () => void;
  cheatSetReputation: (value: number) => void;
  cheatSetDay: (day: number) => void;
}

const bootState = loadFromStorage() ?? createInitialState();

export const useGameStore = create<GameStore>((set, get) => ({
  state: bootState,
  jobSuggestions: computeSuggestions(bootState, {}),
  freeMode: false,

  advanceDay: () =>
    set((s) => {
      const nextState = advanceDayPure(s.state);
      return { state: nextState, jobSuggestions: computeSuggestions(nextState, s.jobSuggestions) };
    }),

  buyVehicle: (entry) =>
    set((s) => {
      if (!s.freeMode) {
        if (s.state.company.cashCents < entry.priceCents) return s;
        if (s.state.vehicles.length >= getFleetCapacity(s.state.terminals)) return s;
      }
      // Park the new truck at the first terminal with spare room, else no terminal.
      const spareTerminal = s.state.terminals.find(
        (t) =>
          s.state.vehicles.filter((v) => v.assignedTerminalId === t.id).length < t.vehicleCapacity
      );
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
        assignedTerminalId: spareTerminal?.id ?? null,
        status: "idle",
      };
      const nextState: GameState = {
        ...s.state,
        company: {
          ...s.state.company,
          cashCents: s.state.company.cashCents - (s.freeMode ? 0 : entry.priceCents),
        },
        vehicles: [...s.state.vehicles, vehicle],
        eventLog: [
          ...s.state.eventLog,
          makeInfoEvent(s.state.company.currentDay, `Purchased ${entry.make} ${entry.model}.`),
        ],
      };
      return { state: nextState, jobSuggestions: computeSuggestions(nextState, s.jobSuggestions) };
    }),

  buyLicense: (type, stateCode) =>
    set((s) => {
      const catalogEntry = LICENSE_CATALOG.find((e) => e.type === type);
      if (!catalogEntry) return s;
      if (catalogEntry.scoped && !stateCode) return s;
      if (!s.freeMode && s.state.company.cashCents < catalogEntry.priceCents) return s;

      const relevantStateCode = catalogEntry.scoped ? stateCode! : "";
      if (hasLicense(s.state.licenses, type, s.state.company.currentDay, relevantStateCode)) return s;

      const license = makeLicense(catalogEntry, stateCode, s.state.company.currentDay);

      const nextState: GameState = {
        ...s.state,
        company: {
          ...s.state.company,
          cashCents: s.state.company.cashCents - (s.freeMode ? 0 : catalogEntry.priceCents),
        },
        licenses: [...s.state.licenses, license],
        eventLog: [
          ...s.state.eventLog,
          makeInfoEvent(
            s.state.company.currentDay,
            `Acquired ${catalogEntry.label}${stateCode ? ` (${stateCode})` : ""}.`
          ),
        ],
      };
      // Newly held licenses can make suggested hauls feasible.
      return { state: nextState, jobSuggestions: computeSuggestions(nextState, {}) };
    }),

  buyTerminal: (stateCode) =>
    set((s) => {
      if (s.state.terminals.some((t) => t.stateCode === stateCode)) return s;
      const stateInfo = getStateInfo(stateCode);
      if (!stateInfo) return s;

      const tier1 = TERMINAL_TIERS[1];
      const priceCents = getNewTerminalPriceCents(stateCode);
      if (!s.freeMode && s.state.company.cashCents < priceCents) return s;

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
            cashCents: s.state.company.cashCents - (s.freeMode ? 0 : priceCents),
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
      if (!s.freeMode && s.state.company.cashCents < tierInfo.priceCents) return s;

      return {
        state: {
          ...s.state,
          company: {
            ...s.state.company,
            cashCents: s.state.company.cashCents - (s.freeMode ? 0 : tierInfo.priceCents),
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

  setHomeState: (stateCode) =>
    set((s) => {
      if (!isRoadConnected(stateCode)) return s;
      const nextState: GameState = {
        ...s.state,
        company: { ...s.state.company, homeStateCode: stateCode },
      };
      return { state: nextState, jobSuggestions: computeSuggestions(nextState, {}) };
    }),

  assignVehicleToTerminal: (vehicleId, terminalId) =>
    set((s) => {
      const vehicle = s.state.vehicles.find((v) => v.id === vehicleId);
      if (!vehicle) return s;
      if (terminalId !== null && !s.state.terminals.some((t) => t.id === terminalId)) return s;

      const vehicles = s.state.vehicles.map((v) =>
        v.id === vehicleId ? { ...v, assignedTerminalId: terminalId } : v
      );
      const nextState: GameState = { ...s.state, vehicles };
      const updated = vehicles.find((v) => v.id === vehicleId)!;
      const jobSuggestions =
        updated.status === "idle"
          ? { ...s.jobSuggestions, [vehicleId]: suggestJob(nextState, updated) }
          : s.jobSuggestions;
      return { state: nextState, jobSuggestions };
    }),

  dispatchJob: (vehicleId, loadSize) =>
    set((s) => {
      const suggestion = s.jobSuggestions[vehicleId];
      const vehicle = s.state.vehicles.find((v) => v.id === vehicleId);
      if (!suggestion || !vehicle || vehicle.status !== "idle") return s;
      if (!suggestion.options[loadSize].feasible) return s;

      const contract = createContractFromSuggestion(suggestion, loadSize, s.state.company.currentDay);
      const nextState: GameState = {
        ...s.state,
        contracts: [...s.state.contracts, contract],
        vehicles: s.state.vehicles.map((v) =>
          v.id === vehicleId ? { ...v, status: "enRoute" } : v
        ),
        eventLog: [
          ...s.state.eventLog,
          makeInfoEvent(
            s.state.company.currentDay,
            `Dispatched ${vehicle.make} ${vehicle.model}: ${suggestion.originStateCode} → ${suggestion.destinationStateCode} (${loadSize} ${suggestion.cargoType}).`
          ),
        ],
      };
      const rest = { ...s.jobSuggestions };
      delete rest[vehicleId];
      return { state: nextState, jobSuggestions: rest };
    }),

  dispatchAll: (strategy, loadPreference) =>
    set((s) => {
      const idle = s.state.vehicles.filter((v) => v.status === "idle");
      if (idle.length === 0) return s;

      const enRoute = new Set<string>();
      const contracts: Contract[] = [...s.state.contracts];
      const suggestions = { ...s.jobSuggestions };
      const day = s.state.company.currentDay;
      let dispatched = 0;

      for (const vehicle of idle) {
        const best = optimizeJob(s.state, vehicle, strategy, loadPreference);
        if (best.loadSize) {
          contracts.push(createContractFromSuggestion(best.suggestion, best.loadSize, day));
          enRoute.add(vehicle.id);
          delete suggestions[vehicle.id];
          dispatched++;
        } else {
          // Show the best candidate we found so the card explains why it's stuck.
          suggestions[vehicle.id] = best.suggestion;
        }
      }

      if (dispatched === 0) return { jobSuggestions: suggestions };

      const skipped = idle.length - dispatched;
      const nextState: GameState = {
        ...s.state,
        contracts,
        vehicles: s.state.vehicles.map((v) =>
          enRoute.has(v.id) ? { ...v, status: "enRoute" } : v
        ),
        eventLog: [
          ...s.state.eventLog,
          makeInfoEvent(
            day,
            `Dispatched ${dispatched} truck${dispatched === 1 ? "" : "s"}${
              skipped > 0 ? ` — ${skipped} skipped (no feasible load)` : ""
            }.`
          ),
        ],
      };
      return { state: nextState, jobSuggestions: suggestions };
    }),

  rerollSuggestion: (vehicleId) =>
    set((s) => {
      const vehicle = s.state.vehicles.find((v) => v.id === vehicleId);
      if (!vehicle || vehicle.status !== "idle") return s;
      return {
        jobSuggestions: { ...s.jobSuggestions, [vehicleId]: suggestJob(s.state, vehicle) },
      };
    }),

  setSuggestionDestination: (vehicleId, destinationStateCode) =>
    set((s) => {
      const vehicle = s.state.vehicles.find((v) => v.id === vehicleId);
      if (!vehicle || vehicle.status !== "idle") return s;
      return {
        jobSuggestions: {
          ...s.jobSuggestions,
          [vehicleId]: suggestJob(s.state, vehicle, Math.random, destinationStateCode),
        },
      };
    }),

  syncSuggestions: () =>
    set((s) => ({ jobSuggestions: computeSuggestions(s.state, s.jobSuggestions) })),

  saveGame: () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(get().state));
  },

  loadGame: () => {
    const loaded = loadFromStorage();
    if (loaded) set({ state: loaded, jobSuggestions: computeSuggestions(loaded, {}) });
  },

  resetGame: () => {
    localStorage.removeItem(SAVE_KEY);
    const fresh = createInitialState();
    set({ state: fresh, jobSuggestions: {}, freeMode: false });
  },

  // ── Cheats ──────────────────────────────
  toggleFreeMode: () => set((s) => ({ freeMode: !s.freeMode })),

  cheatInjectCash: (cents) =>
    set((s) => ({
      state: {
        ...s.state,
        company: {
          ...s.state.company,
          cashCents: Math.max(0, s.state.company.cashCents + cents),
        },
        eventLog: [
          ...s.state.eventLog,
          makeInfoEvent(
            s.state.company.currentDay,
            `[cheat] ${cents >= 0 ? "Injected" : "Removed"} ${formatCents(Math.abs(cents))}.`
          ),
        ],
      },
    })),

  cheatGrantAllLicenses: () =>
    set((s) => {
      const day = s.state.company.currentDay;
      const held = new Set(s.state.licenses.map((l) => `${l.type}:${l.stateCode ?? ""}`));
      const added: License[] = [];
      for (const entry of LICENSE_CATALOG) {
        const targets = entry.scoped ? STATES.map((st) => st.code) : [null];
        for (const code of targets) {
          if (held.has(`${entry.type}:${code ?? ""}`)) continue;
          added.push(makeLicense(entry, code, day));
        }
      }
      if (added.length === 0) return s;
      const nextState: GameState = {
        ...s.state,
        licenses: [...s.state.licenses, ...added],
        eventLog: [
          ...s.state.eventLog,
          makeInfoEvent(day, `[cheat] Granted ${added.length} license(s).`),
        ],
      };
      return { state: nextState, jobSuggestions: computeSuggestions(nextState, {}) };
    }),

  cheatSetReputation: (value) =>
    set((s) => ({
      state: {
        ...s.state,
        company: {
          ...s.state.company,
          reputation: Math.min(100, Math.max(0, Math.round(value))),
        },
      },
    })),

  cheatSetDay: (day) =>
    set((s) => ({
      state: {
        ...s.state,
        company: { ...s.state.company, currentDay: Math.max(1, Math.round(day)) },
      },
    })),
}));
