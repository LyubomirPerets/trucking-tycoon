# Trucking Empire — Project Spec

> **Historical document.** Parts no longer match the code. Drivers/hiring were removed.
> Freight is no longer a browsable contract board — each idle truck gets an auto-suggested
> haul with an interstate route and a light/heavy load choice. Money is integer `*Cents`.
> See `CLAUDE.md` for current architecture.

## Overview
A single-player, browser-based trucking company management/tycoon simulation. The player starts with a small operation (one van, no terminals) and grows into a national logistics company by buying vehicles, acquiring operating licenses, establishing terminals across states, hiring drivers, and fulfilling freight contracts.

## Tech Stack
- **Vite + React + TypeScript** — app shell and UI
- **Zustand** — global game state management
- **react-simple-maps** (or similar SVG-based library) — interactive US state map
- **Tailwind CSS** — styling
- Persistence: `localStorage` initially (JSON serialize/deserialize the game state), can migrate to a backend later

## Core Game Loop
The simulation runs on **discrete ticks** (represent in-game days), not real time.
- Player advances the day manually via an "Advance Day" button, or optionally toggles auto-play at a configurable speed.
- Each tick: contracts progress/complete, expenses are deducted (fuel, maintenance, driver wages, terminal leases, insurance), revenue is collected, vehicle wear increases, and random events may fire (breakdowns, fuel price shifts, contract offers, inspections).

## Core Data Models (TypeScript)

```typescript
// ── Company ──────────────────────────────
interface Company {
  name: string;
  cash: number;
  reputation: number; // 0-100, affects contract quality and rates
  currentDay: number; // in-game day counter
  headquarters: Headquarters | null;
}

interface Headquarters {
  stateCode: string; // e.g. "NC"
  tier: 1 | 2 | 3; // upgrade level — affects fleet capacity, admin overhead reduction
  purchasePrice: number;
}

// ── Vehicles ─────────────────────────────
type VehicleClass = "van" | "boxTruck" | "semi";

interface Vehicle {
  id: string;
  class: VehicleClass;
  make: string;
  model: string;
  year: number;
  purchasePrice: number;
  mileage: number;
  condition: number; // 0-100, degrades over time/use, affects breakdown chance
  maintenanceCostPerMile: number;
  fuelEfficiencyMpg: number;
  cargoCapacityLbs: number;
  assignedDriverId: string | null;
  assignedTerminalId: string | null;
  status: "idle" | "enRoute" | "maintenance" | "outOfService";
}

// ── Licenses ─────────────────────────────
type LicenseType =
  | "intrastateOperatingAuthority"
  | "interstateOperatingAuthority" // MC Number equivalent
  | "hazmatEndorsement"
  | "oversizeLoadPermit"
  | "refrigeratedFreightCert";

interface License {
  id: string;
  type: LicenseType;
  stateCode: string | null; // null = federal/national scope
  acquiredOnDay: number;
  annualRenewalCost: number;
  expiresOnDay: number;
}

// ── Terminals ──────────────────────────────
interface Terminal {
  id: string;
  stateCode: string;
  city: string;
  tier: 1 | 2 | 3; // capacity tier
  vehicleCapacity: number;
  monthlyLeaseCost: number;
  purchasePrice: number;
  staffCount: number;
}

// ── Drivers ──────────────────────────────
interface Driver {
  id: string;
  name: string;
  hiredOnDay: number;
  wagePerMile: number;
  experienceLevel: 1 | 2 | 3 | 4 | 5; // affects safety, speed, fuel efficiency
  cdlClass: "A" | "B" | "C";
  homeTerminalId: string | null;
  status: "available" | "onRoute" | "offDuty";
}

// ── Contracts / Freight ──────────────────
interface Contract {
  id: string;
  originStateCode: string;
  destinationStateCode: string;
  cargoType: string;
  weightLbs: number;
  requiredVehicleClass: VehicleClass;
  requiredLicenses: LicenseType[];
  payout: number;
  deadlineDay: number;
  status: "offered" | "accepted" | "inProgress" | "completed" | "failed";
  assignedVehicleId: string | null;
  assignedDriverId: string | null;
}

// ── Root Game State ──────────────────────
interface GameState {
  company: Company;
  vehicles: Vehicle[];
  licenses: License[];
  terminals: Terminal[];
  drivers: Driver[];
  contracts: Contract[];
  eventLog: GameEvent[];
}

interface GameEvent {
  id: string;
  day: number;
  type: "breakdown" | "contractOffer" | "inspection" | "fuelPriceChange" | "info";
  message: string;
}
```

## Suggested Folder Structure
```
src/
  components/
    Dashboard/
    FleetManager/
    LicenseOffice/
    TerminalMap/
    ContractBoard/
    HRPanel/
  state/
    gameStore.ts        # Zustand store
    initialState.ts
  systems/
    tickEngine.ts        # advances the day, resolves contracts/expenses/events
    contractGenerator.ts # generates offered contracts based on reputation/terminals
    eventGenerator.ts    # random events
  data/
    vehicleCatalog.ts    # purchasable vehicle options
    licenseCatalog.ts
    stateData.ts          # per-state modifiers (regulations, demand, fuel cost)
  types/
    index.ts              # the interfaces above
  App.tsx
  main.tsx
```

## First Milestone (MVP scope)
1. Game state store + save/load to `localStorage`
2. Dashboard showing cash, reputation, current day, "Advance Day" button
3. Fleet Manager: buy a van (only vehicle class unlocked at start), view owned vehicles
4. Contract Board: 2-3 offered contracts generated per week, accept one, assign a vehicle, watch it complete on deadline day and pay out
5. Basic tick engine: deduct fuel/maintenance cost per active contract, apply vehicle wear

Once that loop works end-to-end, layer in: drivers/hiring, licenses, terminals, the state map UI, and random events.

## Notes for Claude Code
- Keep `tickEngine.ts` pure (state in, state out) so it's easy to test in isolation.
- Model money in integer cents internally to avoid floating point drift; format to dollars only at render time.
- Balance numbers (prices, wages, fuel costs) should live in `data/` as editable constants, not hardcoded in components — makes tuning painless.
