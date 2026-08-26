// ── Company ──────────────────────────────
export interface Company {
  name: string;
  cashCents: number;
  reputation: number; // 0-100, affects contract quality and rates
  currentDay: number; // in-game day counter
  headquarters: Headquarters | null;
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
  maintenanceCostPerMileCents: number;
  fuelEfficiencyMpg: number;
  cargoCapacityLbs: number;
  assignedDriverId: string | null;
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

// ── Drivers ──────────────────────────────
export type DriverStatus = "available" | "onRoute" | "offDuty";

export interface Driver {
  id: string;
  name: string;
  hiredOnDay: number;
  wagePerMileCents: number;
  experienceLevel: 1 | 2 | 3 | 4 | 5; // affects safety, speed, fuel efficiency
  cdlClass: "A" | "B" | "C";
  homeTerminalId: string | null;
  status: DriverStatus;
}

// A prospect in the hiring pool — becomes a Driver once hired.
export interface DriverCandidate {
  id: string;
  name: string;
  experienceLevel: 1 | 2 | 3 | 4 | 5;
  cdlClass: "A" | "B" | "C";
  wagePerMileCents: number;
  offeredOnDay: number;
}

// ── Contracts / Freight ──────────────────
export type ContractStatus = "offered" | "accepted" | "inProgress" | "completed" | "failed";

export interface Contract {
  id: string;
  originStateCode: string;
  destinationStateCode: string;
  cargoType: string;
  weightLbs: number;
  requiredVehicleClass: VehicleClass;
  requiredLicenses: LicenseType[];
  payoutCents: number;
  distanceMiles: number;
  deadlineDay: number;
  offeredOnDay: number;
  status: ContractStatus;
  assignedVehicleId: string | null;
  assignedDriverId: string | null;
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
  drivers: Driver[];
  driverCandidates: DriverCandidate[];
  contracts: Contract[];
  eventLog: GameEvent[];
}
