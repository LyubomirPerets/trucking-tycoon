# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Trucking Empire — a single-player, browser-based trucking tycoon sim. Discrete day-based ticks, not real time. See `spec.md` for the original design doc and `README.md` for current feature status; this file is architecture/workflow guidance, not a feature list.

**`spec.md` is historical and partially stale** — don't treat it as ground truth for current shape. Notably: money fields there are unsuffixed (`cash`, `payout`); the actual code uses `*Cents` integer fields throughout. The spec's `Driver`/hiring system was implemented and then deliberately removed (see Architecture below) — don't reintroduce it because spec.md still describes it. The spec's contract-board loop (browse offered contracts, accept, assign a truck) was also replaced: freight is now on-demand per idle truck with an auto-suggested interstate route — see "Dispatch" below.

## Commands

```bash
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # tsc -b (type-check) && vite build — this is the real correctness gate, see note below
npm run lint      # eslint .
npm run test      # vitest run — DO NOT USE, see note below
```

There's no per-test-file CLI shortcut worth documenting while `vitest` is unusable here — see below.

### `vitest` hangs indefinitely in this environment — do not use it or debug it further

`npx vitest run` hangs forever on this machine (Windows, confirmed on vitest 2.1.9 and 4.1.11, all pool settings, sandbox on/off). This has already been extensively debugged; don't re-diagnose it. Instead:

- **Correctness / type safety**: `npx tsc -b --noEmit` and `npm run build` (Rollup does full static dependency resolution, so a clean build is strong evidence the whole graph — including third-party deps like `react-simple-maps` — is sound).
- **Lint**: `npx eslint .`
- **Actual UI verification**: `playwright` is a devDependency and a matching Chromium is cached at `C:\Users\lyubo\AppData\Local\ms-playwright`. Write a throwaway `.mjs` script **inside the project root** (not a temp/scratch dir — ESM import resolution needs the project's `node_modules`), launch with `chromium.launch()`, drive it with the Page API, and delete the script/screenshot when done. This has already caught one real bug (a stale-localStorage crash) that static checks couldn't.
- **Process hygiene on Windows**: killing a hung `npx`/node process via a plain timeout does **not** kill its child processes — they orphan and pile up, degrading the whole machine. Launch anything that might hang via PowerShell `Start-Process -PassThru`, wait with `$p.WaitForExit(ms)`, and on timeout run `taskkill /PID $p.Id /T /F` to kill the whole tree.
- Test files still exist (`src/systems/tickEngine.test.ts`) and are kept correct/up to date — they just can't be run in this environment.

## Architecture

### Layering

```
types/index.ts          — GameState and all entity interfaces (source of truth for shape)
data/*.ts                — static catalogs & tuning constants (vehicleCatalog, licenseCatalog,
                            terminalCatalog, stateData, balance). Edit prices/costs here, never
                            hardcode numbers in components or systems.
systems/*.ts              — pure game logic: tickEngine, freightSystem, licenseSystem,
                            terminalSystem, eventGenerator. No React, no localStorage, no Zustand.
state/                    — gameStore.ts (Zustand store: owns mutation, localStorage, ID sequences),
                            initialState.ts (fresh-game factory)
components/*/*.tsx        — one folder per panel, each reads/writes the store directly via
                            useGameStore(selector) — no prop-drilling, no shared component state
                            beyond a component's own local UI state (selects, toggles).
```

`App.tsx` just lays out the panels in a grid; there's no routing.

### The tick engine is the core, and it's pure

`systems/tickEngine.ts` exports `advanceDay(state: GameState, rng = Math.random): GameState`. It takes a full state snapshot and returns a new one — no mutation, no I/O, RNG injected so it's testable. Every day-tick side effect lives here: haul progress (miles/day) + fuel/maintenance accrual + completion/failure, vehicle wear and breakdown rolls, license renewal/expiry, terminal lease billing. If you're adding a new recurring cost or state transition, it goes in this function, not in a component or the store.

The Zustand store (`gameStore.ts`) is the only place that calls `advanceDay` and the only place that touches `localStorage`. Store actions that aren't the tick (buying a vehicle, dispatching a haul, etc.) are synchronous, validate-then-mutate closures — look at any existing action (e.g. `buyTerminal`) for the pattern: read-guard with early `return s`, then return a new `{ state: {...} }`.

### Dispatch: auto-suggested route-based hauls (no contract board)

There is no list of offered contracts to pick from. For every **idle** vehicle the store holds a `JobSuggestion` (in `jobSuggestions`, an ephemeral non-persisted map): a demand-weighted destination, an interstate route + mileage from `data/roadNetwork.ts`'s `findRoute` (Dijkstra over a hand-authored city-to-city interstate graph), a cargo type, and a **light / heavy** load option pair (`systems/freightSystem.ts`'s `suggestJob`). Each option carries its own weight, payout, ETA, `requiredVehicleClass`, `requiredLicenses`, and a `feasible` flag + `blockReason` computed against that specific vehicle. Payout is `distance × (payoutBaseCentsPerMile + payoutCentsPerTonMile × tons) × demandFactor × reputationFactor` — the per-ton term is what makes a loaded semi worth far more per mile than a van. Heavy loads carry ~2× the weight (so ~2× the pay), are sized for a bigger class (often gating them behind a truck you don't own yet), can need the oversize permit, and travel a bit slower / burn a bit more.

`DispatchBoard.tsx` shows active hauls (progress bar over `progressMiles / distanceMiles`) and one card per idle truck (retarget destination, reroll, pick light/heavy, dispatch). `dispatchJob(vehicleId, loadSize)` creates a `Contract` straight in `inProgress` (statuses are just `inProgress → completed | failed`) and sets the vehicle `enRoute`. `dispatchAll(strategy, loadPreference)` bulk-dispatches every idle truck: `freightSystem.ts`'s `optimizeJob` samples several candidate hauls per truck and keeps the best for the strategy (`profitPerHaul` / `profitPerDay` / `shortest`), and `chooseLoad` resolves `auto`/`light`/`heavy`. Ranking uses `LoadOption.estNetCents` / `estNetCentsPerDay` — a rough net (payout minus a flat-fuel-price fuel + maintenance estimate) also shown on each card. After a tick, `computeSuggestions` re-syncs the map to the idle set; delivered trucks return to base (home state, or their `assignedTerminalId` terminal's state — set via the FleetManager row selector, auto-assigned on purchase).

The company `homeStateCode` starts `""` and `App.tsx` shows `NewGameScreen` until the player picks one.

### Drivers were removed by design

An earlier pass added a full driver-hiring system (candidate pool, HR panel, per-driver wages, dispatch requiring both vehicle and driver). It was deliberately ripped out at the user's request as unwanted complexity. Former driver wage cost was folded into `Vehicle.maintenanceCostPerMileCents`, which is now an all-in operating cost (upkeep + crew), not just maintenance — the field name is a bit of a misnomer now but wasn't worth a rename. **Do not reintroduce per-driver hiring/assignment** unless explicitly asked, even though `spec.md` still describes it.

### Fleet capacity is gated by terminals

`systems/terminalSystem.ts`'s `getFleetCapacity(terminals)` = `BALANCE.baseFleetCapacityNoTerminals` + sum of each terminal's `vehicleCapacity`. `buyVehicle` in the store enforces this. Terminals are bought per-state via the map (`TerminalMap.tsx`, using `react-simple-maps` with a remote topojson URL — the map needs network access at runtime, it's not bundled), price scaled by that state's `demandMultiplier`, and can be upgraded through 3 tiers (`data/terminalCatalog.ts`).

### Licenses gate dispatch, not purchase

`systems/licenseSystem.ts` distinguishes scoped licenses (`stateCode` matters — only Intrastate Operating Authority now, and no freight currently requires it) from national ones (`stateCode: null` covers everywhere; interstate authority, hazmat, refrigerated, and oversize are all national). `hasLicense` feeds the per-load `feasible`/`blockReason` in `freightSystem.ts` and the "Missing: ..." hint in `DispatchBoard.tsx`. Licenses auto-renew annually in `tickEngine` if cash allows, otherwise they lapse.

### Money

All monetary fields are integer cents (`*Cents` suffix), never floats. Format to dollars only at render time via `utils/format.ts`'s `formatCents`. This deviates from `spec.md`'s unsuffixed field names deliberately (spec's own notes ask for integer-cents modeling; the suffix just makes it explicit and typo-resistant).

### Save/load resilience

`gameStore.ts`'s `loadFromStorage()` merges `JSON.parse`d saves over `createInitialState()` defaults field-by-field rather than trusting the parsed shape — a save from before some `GameState` field existed must not crash render. When adding a new top-level `GameState` field, add it to that merge, not just to the type. It also *sanitizes* contracts on load (`sanitizeContract`): drops any not in `inProgress|completed|failed` (e.g. legacy `offered`/`accepted`) and backfills `routePath` / `progressMiles` / `loadSize` / `startedOnDay`. `homeStateCode` backfills from the first terminal's state, else `""`.

`CollapsiblePanel.tsx` wraps every panel; it persists its open/closed state under `localStorage` key `tt-panel-<storageKey>` (separate from the game save).
