// Central tuning knobs — edit here, not in components/systems.
export const BALANCE = {
  startingCashCents: 5_000_000, // $50,000
  startingReputation: 50,

  licenseTermDays: 365,
  oversizeWeightThresholdLbs: 30_000,

  baseFleetCapacityNoTerminals: 3, // vehicles allowed before any terminal is bought
  terminalLeaseIntervalDays: 30,

  // Payout = distance × (base rate + per-ton-mile rate × cargo tons) × demand × reputation.
  // The per-ton term is what makes a loaded semi worth far more than a van per mile.
  payoutBaseCentsPerMile: 320,
  payoutCentsPerTonMile: 90,

  // ── Freight loads ──────────────────────
  // Each suggested haul is sized for a vehicle class; it offers a "light" and a
  // "heavy" variant (a fraction of that class's reference capacity). Heavy carries
  // ~2× the weight (so ~2× the pay via the per-ton term) at a modest efficiency hit.
  classLoadCapacityLbs: { van: 3_600, boxTruck: 11_500, semi: 42_000 },
  lightLoadFraction: [0.4, 0.55] as [number, number],
  heavyLoadFraction: [0.8, 0.95] as [number, number],
  loadSpeedFactor: { light: 1, heavy: 0.88 }, // heavy loads travel slower
  loadFuelPenalty: { light: 1, heavy: 1.25 }, // heavy loads worsen effective mpg
  loadWearFactor: { light: 1, heavy: 1.35 }, // heavy loads wear the truck faster

  // ── Travel / deadlines ─────────────────
  baseTruckSpeedMph: 55,
  drivingHoursPerDay: 10,
  deadlineSlack: 1.3, // deadline = estimated trip days × this
  lateDeliveryPayoutMultiplier: 0.5, // payout if delivered past the deadline

  vehicleConditionDegradePerMile: 0.004, // condition points lost per mile driven
  vehicleConditionDegradePerDay: 0.05, // passive degrade even when idle
  breakdownConditionThreshold: 30, // below this, breakdown risk kicks in
  breakdownBaseChance: 0.01, // per-day chance once below threshold

  reputationGainOnCompletion: 2,
  reputationLossOnFailure: 8,
} as const;
