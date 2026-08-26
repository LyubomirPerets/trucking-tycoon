import type { Contract, GameState, License, Vehicle } from "../types";
import { BALANCE } from "../data/balance";
import { getState } from "../data/stateData";
import { LICENSE_CATALOG } from "../data/licenseCatalog";
import {
  makeContractCompletedEvent,
  makeContractFailedEvent,
  makeInfoEvent,
  makeLicenseExpiredEvent,
  makeLicenseRenewedEvent,
  rollBreakdown,
} from "./eventGenerator";

const DEFAULT_FUEL_PRICE_CENTS_PER_GALLON = 350;

/** Fuel price where the truck currently is, based on how far along the route it is. */
function fuelPriceAlongRoute(contract: Contract): number {
  const { routePath, distanceMiles, progressMiles } = contract;
  if (routePath.length === 0) return DEFAULT_FUEL_PRICE_CENTS_PER_GALLON;
  const fraction = distanceMiles > 0 ? Math.min(1, progressMiles / distanceMiles) : 0;
  const idx = Math.min(routePath.length - 1, Math.floor(fraction * (routePath.length - 1)));
  return (
    getState(routePath[idx])?.fuelCostMultiplierCentsPerGallon ??
    DEFAULT_FUEL_PRICE_CENTS_PER_GALLON
  );
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
    if (contract.status !== "inProgress" || !contract.assignedVehicleId) {
      updatedContracts.push(contract);
      continue;
    }

    const vehicle = vehiclesById.get(contract.assignedVehicleId);
    if (!vehicle) {
      updatedContracts.push(contract);
      continue;
    }

    const milesPerDay =
      BALANCE.baseTruckSpeedMph *
      BALANCE.drivingHoursPerDay *
      BALANCE.loadSpeedFactor[contract.loadSize];
    const milesRemaining = Math.max(0, contract.distanceMiles - contract.progressMiles);
    const milesDriven = Math.min(milesPerDay, milesRemaining);
    const newProgress = contract.progressMiles + milesDriven;

    const effectiveMpg = vehicle.fuelEfficiencyMpg / BALANCE.loadFuelPenalty[contract.loadSize];
    const fuelCostCents = Math.round(
      (milesDriven / effectiveMpg) * fuelPriceAlongRoute(contract)
    );
    const maintenanceCostCents = Math.round(
      milesDriven * vehicle.maintenanceCostPerMileCents * BALANCE.loadWearFactor[contract.loadSize]
    );
    cashCents -= fuelCostCents + maintenanceCostCents;

    vehicle.mileage += milesDriven;
    vehicle.condition = Math.max(
      0,
      vehicle.condition -
        milesDriven *
          BALANCE.vehicleConditionDegradePerMile *
          BALANCE.loadWearFactor[contract.loadSize]
    );

    const breakdownEvent = rollBreakdown(vehicle, nextDay, rng);
    if (breakdownEvent) {
      newEvents.push(breakdownEvent);
      newEvents.push(makeContractFailedEvent(nextDay, contract.id, "vehicle breakdown"));
      vehicle.status = "maintenance";
      reputation = Math.max(0, reputation - BALANCE.reputationLossOnFailure);
      updatedContracts.push({ ...contract, progressMiles: newProgress, status: "failed", assignedVehicleId: null });
      continue;
    }

    if (newProgress >= contract.distanceMiles) {
      const onTime = nextDay <= contract.deadlineDay;
      const payoutCents = onTime
        ? contract.payoutCents
        : Math.round(contract.payoutCents * BALANCE.lateDeliveryPayoutMultiplier);
      cashCents += payoutCents;
      if (onTime) {
        reputation = Math.min(100, reputation + BALANCE.reputationGainOnCompletion);
      } else {
        reputation = Math.max(0, reputation - BALANCE.reputationLossOnFailure / 2);
      }
      newEvents.push(
        makeContractCompletedEvent(
          nextDay,
          payoutCents,
          `${contract.id}${onTime ? "" : " (late)"}`
        )
      );
      vehicle.status = "idle";
      updatedContracts.push({ ...contract, progressMiles: contract.distanceMiles, status: "completed" });
    } else {
      updatedContracts.push({ ...contract, progressMiles: newProgress });
    }
  }

  // Passive degrade for vehicles not currently en route.
  for (const vehicle of vehiclesById.values()) {
    if (vehicle.status === "idle") {
      vehicle.condition = Math.max(0, vehicle.condition - BALANCE.vehicleConditionDegradePerDay);
    }
  }

  // License renewals: auto-renew if affordable, otherwise let them lapse.
  const updatedLicenses: License[] = [];
  for (const license of state.licenses) {
    if (nextDay >= license.expiresOnDay) {
      const catalogEntry = LICENSE_CATALOG.find((e) => e.type === license.type);
      const label = catalogEntry?.label ?? license.type;
      const renewalCost = license.annualRenewalCostCents;
      if (cashCents >= renewalCost) {
        cashCents -= renewalCost;
        updatedLicenses.push({ ...license, expiresOnDay: license.expiresOnDay + BALANCE.licenseTermDays });
        newEvents.push(makeLicenseRenewedEvent(nextDay, label, renewalCost));
      } else {
        newEvents.push(makeLicenseExpiredEvent(nextDay, label));
      }
    } else {
      updatedLicenses.push(license);
    }
  }

  // Terminal leases, deducted monthly.
  if (state.terminals.length > 0 && nextDay % BALANCE.terminalLeaseIntervalDays === 0) {
    const totalLeaseCents = state.terminals.reduce((sum, t) => sum + t.monthlyLeaseCostCents, 0);
    cashCents -= totalLeaseCents;
    newEvents.push(makeInfoEvent(nextDay, `Paid $${(totalLeaseCents / 100).toLocaleString()} in terminal lease costs.`));
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
    licenses: updatedLicenses,
    contracts: updatedContracts,
    eventLog: newEvents,
  };
}
