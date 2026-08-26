import { describe, expect, it } from "vitest";
import { advanceDay } from "./tickEngine";
import { createInitialState } from "../state/initialState";
import type { Contract, Driver, Vehicle } from "../types";

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
    maintenanceCostPerMileCents: 10,
    fuelEfficiencyMpg: 18,
    cargoCapacityLbs: 3800,
    assignedDriverId: null,
    assignedTerminalId: null,
    status: "enRoute",
    ...overrides,
  };
}

function makeDriver(overrides: Partial<Driver> = {}): Driver {
  return {
    id: "driver-1",
    name: "Test Driver",
    hiredOnDay: 1,
    wagePerMileCents: 50,
    experienceLevel: 3,
    cdlClass: "A",
    homeTerminalId: null,
    status: "onRoute",
    ...overrides,
  };
}

function makeContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "contract-1",
    originStateCode: "NC",
    destinationStateCode: "SC",
    cargoType: "General Freight",
    weightLbs: 1000,
    requiredVehicleClass: "van",
    requiredLicenses: [],
    payoutCents: 100_000,
    distanceMiles: 200,
    deadlineDay: 4,
    offeredOnDay: 1,
    status: "inProgress",
    assignedVehicleId: "vehicle-1",
    assignedDriverId: "driver-1",
    ...overrides,
  };
}

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

  it("deducts fuel, maintenance, and wage costs for an in-progress contract", () => {
    const state = createInitialState();
    state.vehicles = [makeVehicle()];
    state.drivers = [makeDriver()];
    state.contracts = [makeContract()];

    const next = advanceDay(state, noBreakdown);
    expect(next.company.cashCents).toBeLessThan(state.company.cashCents);
    expect(next.vehicles[0].mileage).toBeGreaterThan(0);
  });

  it("pays out and completes a contract on its deadline day, freeing vehicle and driver", () => {
    const state = createInitialState();
    state.company.currentDay = 3;
    state.vehicles = [makeVehicle()];
    state.drivers = [makeDriver()];
    state.contracts = [makeContract({ deadlineDay: 4, offeredOnDay: 1 })];

    const cashBefore = state.company.cashCents;
    const next = advanceDay(state, noBreakdown);

    const contract = next.contracts.find((c) => c.id === "contract-1")!;
    expect(contract.status).toBe("completed");
    expect(next.company.cashCents).toBeGreaterThan(cashBefore);
    expect(next.vehicles[0].status).toBe("idle");
    expect(next.drivers[0].status).toBe("available");
  });

  it("drops offered contracts past their expiry window", () => {
    const state = createInitialState();
    state.company.currentDay = 10;
    state.contracts = [
      makeContract({
        id: "stale-offer",
        status: "offered",
        offeredOnDay: 1,
        assignedVehicleId: null,
      }),
    ];

    const next = advanceDay(state, noBreakdown);
    expect(next.contracts.find((c) => c.id === "stale-offer")).toBeUndefined();
  });

  it("generates weekly contract offers every 7th day", () => {
    const state = createInitialState();
    state.company.currentDay = 6; // advancing lands on day 7
    const next = advanceDay(state, noBreakdown);
    expect(next.contracts.length).toBeGreaterThan(0);
  });
});
