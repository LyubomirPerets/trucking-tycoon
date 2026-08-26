# Trucking Empire

A single-player, browser-based trucking company management/tycoon simulation. Start with one van and no terminals; grow into a national logistics company.

See [spec.md](./spec.md) for the full project spec.

## Stack
Vite + React + TypeScript, Zustand for state, Tailwind CSS for styling, `localStorage` for persistence.

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build     # type-check + production build
npm run test      # run the vitest suite
npm run lint      # eslint
```

## Current status

- Game state store with save/load to `localStorage` (tolerant of saves from older versions of the schema)
- Dashboard: cash, reputation, current day, Advance Day
- Fleet Manager: a wide vehicle catalog across vans/box trucks/semis, filterable by class; fleet size capped by terminal capacity
- License Office: buy operating authorities/endorsements; contracts require them (interstate authority always, hazmat/refrigerated/oversize situationally — all national) and auto-renew annually if affordable
- Cheats / Debug panel: inject cash, grant all licenses, set reputation/day, Free Mode (free purchases, no capacity limit)
- Terminal Map: an interactive US map (`react-simple-maps`) to open and upgrade terminals per state, minimizable; terminal leases billed monthly
- Contract Board: weekly offered contracts, accept, assign an idle vehicle of the right class (once licensed), watch it complete on the deadline day and pay out
- Tick engine (`src/systems/tickEngine.ts`) is a pure function — covered by tests in `tickEngine.test.ts`

Driver hiring/wages were tried and removed by design — vehicle operating cost is all-in (upkeep + crew) rather than tracking individual drivers.

Not yet implemented (next up per spec.md): the Headquarters concept, random events beyond breakdowns (fuel price shifts, inspections), auto-play.
