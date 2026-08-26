// Central tuning knobs — edit here, not in components/systems.
export const BALANCE = {
  startingCashCents: 5_000_000, // $50,000
  startingReputation: 50,

  contractsOfferedPerWeek: 3,
  contractOfferExpiryDays: 7,

  licenseTermDays: 365,
  oversizeWeightThresholdLbs: 30_000,

  baseFleetCapacityNoTerminals: 3, // vehicles allowed before any terminal is bought
  terminalLeaseIntervalDays: 30,
  minContractDistanceMiles: 80,
  maxContractDistanceMiles: 1200,
  payoutCentsPerMile: 220, // base rate before reputation/demand modifiers

  vehicleConditionDegradePerMile: 0.004, // condition points lost per mile driven
  vehicleConditionDegradePerDay: 0.05, // passive degrade even when idle
  breakdownConditionThreshold: 30, // below this, breakdown risk kicks in
  breakdownBaseChance: 0.01, // per-day chance once below threshold

  reputationGainOnCompletion: 2,
  reputationLossOnFailure: 8,

  averageTruckSpeedMph: 50, // used to estimate contract deadlines
} as const;
