// ── Company ──────────────────────────────
export interface Company {
  name: string;
  cashCents: number;
  reputation: number; // 0-100, affects contract quality and rates
  currentDay: number; // in-game day counter
  headquarters: Headquarters | null;
  homeStateCode: string; // base of operations; "" until picked on the new-game screen
}

export interface Headquarters {
  stateCode: string; // e.g. "NC"
  tier: 1 | 2 | 3; // upgrade level — affects fleet capacity, admin overhead reduction
  purchasePriceCents: number;
}

// ── Vehicles ─────────────────────────────
export type VehicleClass = "van" | "boxTruck" | "semi";
export type VehicleStatus = "idle" | "enRoute" | "maintenance" | "outOfService";

export interface Vehicle {
  id: string;
  class: VehicleClass;
  make: string;
  model: string;
  year: number;
  purchasePriceCents: number;
  mileage: number;
  condition: number; // 0-100, degrades over time/use, affects breakdown chance
  maintenanceCostPerMileCents: number; // all-in operating cost per mile: upkeep + crew
  fuelEfficiencyMpg: number;
  cargoCapacityLbs: number;
  assignedTerminalId: string | null;
  status: VehicleStatus;
}

// ── Licenses ─────────────────────────────
export type LicenseType =
  | "intrastateOperatingAuthority"
  | "interstateOperatingAuthority" // MC Number equivalent
  | "hazmatEndorsement"
  | "oversizeLoadPermit"
  | "refrigeratedFreightCert";

export interface License {
  id: string;
  type: LicenseType;
  stateCode: string | null; // null = federal/national scope
  acquiredOnDay: number;
  annualRenewalCostCents: number;
  expiresOnDay: number;
}

// ── Terminals ────────────────────────────
export interface Terminal {
  id: string;
  stateCode: string;
  city: string;
  tier: 1 | 2 | 3; // capacity tier
  vehicleCapacity: number;
  monthlyLeaseCostCents: number;
  purchasePriceCents: number;
  staffCount: number;
}

// ── Contracts / Freight ──────────────────
export type ContractStatus = "inProgress" | "completed" | "failed";

export type LoadSize = "light" | "heavy";

export interface Contract {
  id: string;
  originStateCode: string;
  destinationStateCode: string;
  routePath: string[]; // ordered state codes along the interstate route
  cargoType: string;
  weightLbs: number;
  loadSize: LoadSize;
  requiredVehicleClass: VehicleClass;
  requiredLicenses: LicenseType[];
  payoutCents: number;
  distanceMiles: number;
  progressMiles: number; // miles driven so far toward distanceMiles
  deadlineDay: number;
  startedOnDay: number;
  status: ContractStatus;
  assignedVehicleId: string | null;
}

// ── Job suggestions (ephemeral — not part of GameState / not persisted) ──
export interface LoadOption {
  loadSize: LoadSize;
  weightLbs: number;
  payoutCents: number;
  estNetCents: number; // payout minus a rough fuel + maintenance estimate for the trip
  estNetCentsPerDay: number; // estNetCents / estimatedDays
  requiredVehicleClass: VehicleClass;
  requiredLicenses: LicenseType[];
  estimatedDays: number;
  feasible: boolean; // can THIS vehicle take this load right now?
  blockReason?: string; // why not, if infeasible
}

export interface JobSuggestion {
  vehicleId: string;
  originStateCode: string;
  destinationStateCode: string;
  routePath: string[];
  distanceMiles: number;
  cargoType: string;
  options: Record<LoadSize, LoadOption>;
}

// ── Events ───────────────────────────────
export type GameEventType =
  | "breakdown"
  | "contractOffer"
  | "contractCompleted"
  | "contractFailed"
  | "inspection"
  | "fuelPriceChange"
  | "info";

export interface GameEvent {
  id: string;
  day: number;
  type: GameEventType;
  message: string;
}

// ── Root Game State ──────────────────────
export interface GameState {
  company: Company;
  vehicles: Vehicle[];
  licenses: License[];
  terminals: Terminal[];
  contracts: Contract[];
  eventLog: GameEvent[];
}
