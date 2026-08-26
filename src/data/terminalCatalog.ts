export interface TerminalTierInfo {
  tier: 1 | 2 | 3;
  vehicleCapacity: number;
  monthlyLeaseCostCents: number;
  // Cost to establish (tier 1) or upgrade into this tier from the one below.
  priceCents: number;
}

export const TERMINAL_TIERS: Record<1 | 2 | 3, TerminalTierInfo> = {
  1: { tier: 1, vehicleCapacity: 5, monthlyLeaseCostCents: 150_000, priceCents: 8_000_000 },
  2: { tier: 2, vehicleCapacity: 15, monthlyLeaseCostCents: 350_000, priceCents: 12_000_000 },
  3: { tier: 3, vehicleCapacity: 30, monthlyLeaseCostCents: 700_000, priceCents: 20_000_000 },
};
