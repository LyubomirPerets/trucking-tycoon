# Changelog

## Dispatch All + per-load profit estimates

**"Dispatch All" button** on the Dispatch panel sends every idle truck at once. Two
controls tune it:
- **Strategy** — `Max profit / haul` (chase big long-haul payouts), `Max profit / day`
  (best $/day, the default), or `Shortest trips` (fast turnover). For each truck it samples
  several candidate destinations and keeps the best one for the chosen strategy.
- **Load** — `Auto` picks whichever of light/heavy is more profitable per truck, or force
  `Light only` / `Heavy only`.

Trucks with no feasible load are skipped (and their card updates to show why).

**Each idle-truck card now shows the estimated net profit** — total and per-day — for the
selected load, and the light/heavy toggle shows each option's $/day with a ★ on the better
one, so "which weight pays more" is visible at a glance.

**Free Mode fix** — the cheat now also un-gates the buy buttons in Fleet Manager, License
Office, and the Terminal Map (previously the store allowed free purchases but the buttons
stayed disabled at the cash/capacity limit).

## Economy rebalance

**Payouts now scale with cargo weight.** Freight paid a flat rate per mile regardless of
how much you were hauling, so a semi carrying 20,000 lb earned the same per mile as a van
carrying 2,000 lb. Payout is now `distance × (base $3.20/mi + $0.90 per ton-mile) × demand
× reputation`, and the light/heavy multiplier is gone — heavy loads pay more simply because
they weigh more. A loaded semi is finally worth its price.

**Per-mile operating costs roughly halved** across the vehicle catalog (they were eating
most of the revenue — a van spent ~26% of gross on "maintenance" alone). Heavy-load
penalties softened too (speed 0.82→0.88, fuel 1.35→1.25, wear 1.5→1.35) so heavy is a real
"more money" choice, not a trap.

Net effect (rep 50): a van nets ~$1,400–1,700 per working day and pays for itself in ~3
weeks; a box truck ~$2,100–2,600/day; a semi ~$4,700/day light and ~$7,200/day running
heavy. Profits compound fast enough to be into box trucks and semis within the first month.

## Route-based dispatch replaces the contract board; collapsible panels

**No more picking contracts.** The Contract Board is gone. Every idle truck now shows an
auto-suggested haul: a demand-weighted destination, a route along a real US interstate
graph (~90 corridors, Dijkstra shortest path) with its mileage, a cargo type, and a
**light vs heavy** load choice. Retarget the destination, reroll for a different job, pick
the load size, and dispatch. Heavy loads pay ~1.9× but are sized for a bigger vehicle
class (so some are gated behind a truck you don't own yet), can require the oversize
permit, and travel slower while burning more fuel and wearing the truck faster.

**Hauls progress by miles per day.** A dispatched truck covers `baseTruckSpeedMph ×
drivingHoursPerDay` miles each tick (less for heavy loads), with fuel priced by the state
it's currently passing through. Delivery on time pays in full; late pays half. On arrival
the truck returns to its home base.

**Pick a home state at game start.** New games open on a state picker; trucks without their
own terminal run their hauls out of that state. Assign individual trucks to a terminal from
the Fleet Manager. The Cheats panel can change the home state later.

**Every panel is collapsible** and remembers whether you left it open or closed, so you're
not scrolling past the map to get to Dispatch.

**Map** now draws each active haul's route in amber with origin/destination markers, and a
blue dot for your home state.

**Save compatibility.** Old saves load fine: legacy `offered`/`accepted` contracts are
dropped, in-progress hauls get a backfilled route, and the home state is inferred from your
first terminal (or the picker runs once).

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
