# Changelog

## Drivers removed, vehicle catalog expanded, map polish

**Drivers removed.** No more hiring pool or HR panel — dispatch just needs an idle vehicle of the right class (plus licenses). Former driver wage is folded into each vehicle's per-mile operating cost.

**Vehicle catalog expanded** from 4 to 19 vehicles across vans, box trucks, and semis — all buyable from day one. Fleet Manager has class filter buttons (All/Van/Box Truck/Semi).

**Terminal Map**
- Click any state to open a terminal there or view/upgrade an existing one — a permanent hint above the map now says so.
- "Minimize Map" / "Show Map" toggle collapses the SVG while keeping the terminal list visible.

**Save compatibility.** `loadFromStorage()` merges saved data over fresh defaults instead of trusting the shape blindly, so saves from older versions of the schema (e.g. the old driver fields) load without crashing.
