import type { Contract, GameState, Vehicle } from "../types";
import { BALANCE } from "../data/balance";
import { getState } from "../data/stateData";
import { generateWeeklyContracts } from "./contractGenerator";
import {
  makeContractCompletedEvent,
  makeContractFailedEvent,
  makeContractOfferEvent,
  rollBreakdown,
} from "./eventGenerator";

const DEFAULT_FUEL_PRICE_CENTS_PER_GALLON = 350;

function tripDays(contract: Contract): number {
  return Math.max(1, contract.deadlineDay - contract.offeredOnDay);
}

/**
 * Advances the game by exactly one day. Pure: takes state (+ rng), returns
 * a new state. No I/O, no mutation of the input.
 */
export function advanceDay(state: GameState, rng: () => number = Math.random): GameState {
  const nextDay = state.company.currentDay + 1;

  let cashCents = state.company.cashCents;
  let reputation = state.company.reputation;
  const newEvents = [...state.eventLog];

  const vehiclesById = new Map<string, Vehicle>(state.vehicles.map((v) => [v.id, { ...v }]));

  const updatedContracts: Contract[] = [];

  for (const contract of state.contracts) {
    if (contract.status === "offered") {
      const expired = nextDay - contract.offeredOnDay > BALANCE.contractOfferExpiryDays;
      if (expired) {
        continue; // offer lapses, drop it
      }
      updatedContracts.push(contract);
      continue;
    }

    if (contract.status !== "inProgress" || !contract.assignedVehicleId) {
      updatedContracts.push(contract);
      continue;
    }

    const vehicle = vehiclesById.get(contract.assignedVehicleId);
    if (!vehicle) {
      updatedContracts.push(contract);
      continue;
    }

    const days = tripDays(contract);
    const dailyDistance = contract.distanceMiles / days;
    const fuelPrice =
      getState(contract.originStateCode)?.fuelCostMultiplierCentsPerGallon ??
      DEFAULT_FUEL_PRICE_CENTS_PER_GALLON;

    const fuelCostCents = Math.round((dailyDistance / vehicle.fuelEfficiencyMpg) * fuelPrice);
    const maintenanceCostCents = Math.round(dailyDistance * vehicle.maintenanceCostPerMileCents);
    cashCents -= fuelCostCents + maintenanceCostCents;

    vehicle.mileage += dailyDistance;
    vehicle.condition = Math.max(
      0,
      vehicle.condition - dailyDistance * BALANCE.vehicleConditionDegradePerMile
    );

    const breakdownEvent = rollBreakdown(vehicle, nextDay, rng);
    if (breakdownEvent) {
      newEvents.push(breakdownEvent);
      newEvents.push(makeContractFailedEvent(nextDay, contract.id, "vehicle breakdown"));
      vehicle.status = "maintenance";
      reputation = Math.max(0, reputation - BALANCE.reputationLossOnFailure);
      updatedContracts.push({ ...contract, status: "failed", assignedVehicleId: null });
      continue;
    }

    if (nextDay >= contract.deadlineDay) {
      cashCents += contract.payoutCents;
      reputation = Math.min(100, reputation + BALANCE.reputationGainOnCompletion);
      newEvents.push(makeContractCompletedEvent(nextDay, contract.payoutCents, contract.id));
      vehicle.status = "idle";
      updatedContracts.push({ ...contract, status: "completed" });
    } else {
      updatedContracts.push(contract);
    }
  }

  // Passive degrade for vehicles not currently en route.
  for (const vehicle of vehiclesById.values()) {
    if (vehicle.status === "idle") {
      vehicle.condition = Math.max(0, vehicle.condition - BALANCE.vehicleConditionDegradePerDay);
    }
  }

  // Weekly contract offers.
  let contractsWithOffers = updatedContracts;
  if (nextDay % 7 === 0) {
    const offers = generateWeeklyContracts({ ...state, company: { ...state.company, currentDay: nextDay } }, rng);
    contractsWithOffers = [...updatedContracts, ...offers];
    newEvents.push(makeContractOfferEvent(nextDay, offers.length));
  }

  return {
    ...state,
    company: {
      ...state.company,
      currentDay: nextDay,
      cashCents,
      reputation,
    },
    vehicles: Array.from(vehiclesById.values()),
    contracts: contractsWithOffers,
    eventLog: newEvents,
  };
}
