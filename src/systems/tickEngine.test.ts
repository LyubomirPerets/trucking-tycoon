import { describe, expect, it } from "vitest";
import { advanceDay } from "./tickEngine";
import { createInitialState } from "../state/initialState";
import { BALANCE } from "../data/balance";
import type { Contract, Vehicle } from "../types";

const noBreakdown = () => 0.99; // rng always above breakdown chance

function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "vehicle-1",
    class: "van",
    make: "Ford",
    model: "Transit",
    year: 2021,
    purchasePriceCents: 3_000_000,
    mileage: 0,
    condition: 100,
    maintenanceCostPerMileCents: 60,
    fuelEfficiencyMpg: 18,
    cargoCapacityLbs: 3800,
    assignedTerminalId: null,
    status: "enRoute",
    ...overrides,
  };
}

function makeContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "contract-1",
    originStateCode: "NC",
    destinationStateCode: "SC",
    routePath: ["NC", "SC"],
    cargoType: "General Freight",
    weightLbs: 3000,
    loadSize: "light",
    requiredVehicleClass: "van",
    requiredLicenses: [],
    payoutCents: 100_000,
    distanceMiles: 200,
    progressMiles: 0,
    deadlineDay: 10,
    startedOnDay: 1,
    status: "inProgress",
    assignedVehicleId: "vehicle-1",
    ...overrides,
  };
}

const milesPerLightDay =
  BALANCE.baseTruckSpeedMph * BALANCE.drivingHoursPerDay * BALANCE.loadSpeedFactor.light;

describe("advanceDay", () => {
  it("increments the day counter", () => {
    const state = createInitialState();
    const next = advanceDay(state, noBreakdown);
    expect(next.company.currentDay).toBe(state.company.currentDay + 1);
  });

  it("does not mutate the input state", () => {
    const state = createInitialState();
    const snapshot = JSON.stringify(state);
    advanceDay(state, noBreakdown);
    expect(JSON.stringify(state)).toBe(snapshot);
  });

  it("advances a haul by miles/day and deducts fuel + maintenance", () => {
    const state = createInitialState();
    state.vehicles = [makeVehicle()];
    state.contracts = [makeContract({ distanceMiles: 5000 })];

    const next = advanceDay(state, noBreakdown);
    const contract = next.contracts[0];
    expect(contract.progressMiles).toBeCloseTo(milesPerLightDay);
    expect(contract.status).toBe("inProgress");
    expect(next.company.cashCents).toBeLessThan(state.company.cashCents);
    expect(next.vehicles[0].mileage).toBeGreaterThan(0);
  });

  it("heavy loads travel slower than light loads", () => {
    const base = createInitialState();
    base.vehicles = [makeVehicle({ class: "semi", cargoCapacityLbs: 45000 })];

    const light = advanceDay(
      { ...base, contracts: [makeContract({ distanceMiles: 5000, loadSize: "light" })] },
      noBreakdown
    );
    const heavy = advanceDay(
      { ...base, contracts: [makeContract({ distanceMiles: 5000, loadSize: "heavy" })] },
      noBreakdown
    );
    expect(heavy.contracts[0].progressMiles).toBeLessThan(light.contracts[0].progressMiles);
  });

  it("pays out in full and frees the vehicle when the load arrives on time", () => {
    const state = createInitialState();
    state.vehicles = [makeVehicle()];
    // Short trip that finishes in one day, well before the deadline.
    state.contracts = [makeContract({ distanceMiles: 50, deadlineDay: 10, payoutCents: 100_000 })];

    const cashBefore = state.company.cashCents;
    const next = advanceDay(state, noBreakdown);

    const contract = next.contracts[0];
    expect(contract.status).toBe("completed");
    expect(next.company.cashCents).toBeGreaterThan(cashBefore + 90_000); // net of costs on 50 mi
    expect(next.vehicles[0].status).toBe("idle");
  });

  it("pays a reduced amount for a late delivery", () => {
    const state = createInitialState();
    state.company.currentDay = 20;
    state.vehicles = [makeVehicle()];
    state.contracts = [
      makeContract({ distanceMiles: 50, deadlineDay: 5, payoutCents: 100_000 }),
    ];

    const cashBefore = state.company.cashCents;
    const next = advanceDay(state, noBreakdown);
    const gained = next.company.cashCents - cashBefore;
    expect(next.contracts[0].status).toBe("completed");
    expect(gained).toBeLessThan(60_000); // ~half payout minus costs
    expect(gained).toBeGreaterThan(0);
  });

  it("fails a haul and frees nothing on breakdown", () => {
    const alwaysBreakdown = () => 0; // rng below breakdown chance
    const state = createInitialState();
    state.vehicles = [makeVehicle({ condition: 5 })];
    state.contracts = [makeContract({ distanceMiles: 5000 })];

    const next = advanceDay(state, alwaysBreakdown);
    expect(next.contracts[0].status).toBe("failed");
    expect(next.vehicles[0].status).toBe("maintenance");
    expect(next.company.reputation).toBeLessThan(state.company.reputation);
  });
});
