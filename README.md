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

## Current status (MVP)

- Game state store with save/load to `localStorage`
- Dashboard: cash, reputation, current day, Advance Day
- Fleet Manager: buy a van, view owned vehicles
- Contract Board: weekly offered contracts, accept, assign a vehicle, watch it complete on the deadline day and pay out
- Tick engine (`src/systems/tickEngine.ts`) is a pure function — covered by tests in `tickEngine.test.ts`

Not yet implemented (next up per spec.md): drivers/hiring, licenses, terminals, the state map UI, random events beyond breakdowns.
