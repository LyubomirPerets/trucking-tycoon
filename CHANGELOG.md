# Changelog

## License/terminal fixes + cheats panel

**Oversize Load Permit is now a national license.** It used to be per-state, so buying it did nothing for a contract unless you happened to pick the contract's origin state — and nothing in the UI told you which state that was. It now covers everywhere, like the Hazmat and Refrigerated certs. Existing per-state oversize permits in old saves keep working. (Intrastate Operating Authority stays per-state but no contract currently requires it.)

**Terminal purchase price is now consistent.** The "Open Terminal" button checked affordability against the unscaled base price ($80k) while the store actually charged `base × state demand multiplier` — so cheap states were wrongly disabled and expensive states let you click a button that silently did nothing. The map panel now shows the real demand-scaled price and gates on it. Single source of truth: `getNewTerminalPriceCents()` in `terminalSystem.ts`.

**Terminals are reachable earlier.** Tier-1 base cost lowered $80k → $50k (Tier 2 $120k → $100k, Tier 3 $200k → $180k), so the lower-demand states are affordable within the first few contracts.

**Cheats / Debug panel** (collapsible, collapsed by default, at the bottom of the grid): inject cash (fixed increments or custom), grant all licenses, set reputation and day directly, and a Free Mode toggle that makes vehicles/terminals/upgrades free and ignores fleet-capacity limits. Free Mode is transient (resets on reload); the other actions mutate normal game state.

## Drivers removed, vehicle catalog expanded, map polish

**Drivers removed.** No more hiring pool or HR panel — dispatch just needs an idle vehicle of the right class (plus licenses). Former driver wage is folded into each vehicle's per-mile operating cost.

**Vehicle catalog expanded** from 4 to 19 vehicles across vans, box trucks, and semis — all buyable from day one. Fleet Manager has class filter buttons (All/Van/Box Truck/Semi).

**Terminal Map**
- Click any state to open a terminal there or view/upgrade an existing one — a permanent hint above the map now says so.
- "Minimize Map" / "Show Map" toggle collapses the SVG while keeping the terminal list visible.

**Save compatibility.** `loadFromStorage()` merges saved data over fresh defaults instead of trusting the shape blindly, so saves from older versions of the schema (e.g. the old driver fields) load without crashing.
