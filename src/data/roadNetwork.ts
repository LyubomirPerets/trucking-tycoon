// A coarse interstate-highway graph: one node per state (its major city), edges
// along real interstate corridors between neighboring states, weighted by an
// approximate driving distance in miles. Alaska and Hawaii are not on the graph
// (no road connection to the lower 48).
//
// Used to suggest and draw truck routes: `findRoute` runs Dijkstra over these
// edges and returns the ordered list of state codes plus total mileage.

export interface RoadEdge {
  a: string;
  b: string;
  miles: number;
}

export const INTERSTATE_EDGES: RoadEdge[] = [
  // ── Northeast ──────────────────────────
  { a: "ME", b: "NH", miles: 95 },
  { a: "NH", b: "MA", miles: 55 },
  { a: "NH", b: "VT", miles: 150 },
  { a: "VT", b: "NY", miles: 300 },
  { a: "MA", b: "RI", miles: 50 },
  { a: "MA", b: "CT", miles: 100 },
  { a: "RI", b: "CT", miles: 75 },
  { a: "CT", b: "NY", miles: 115 },
  { a: "NY", b: "NJ", miles: 12 },
  { a: "NJ", b: "PA", miles: 90 },
  { a: "PA", b: "DE", miles: 30 },
  { a: "DE", b: "MD", miles: 70 },
  { a: "MD", b: "DC", miles: 40 },
  { a: "DC", b: "VA", miles: 110 },
  { a: "PA", b: "OH", miles: 430 },
  // ── Mid-Atlantic / Appalachia ──────────
  { a: "VA", b: "NC", miles: 290 },
  { a: "VA", b: "WV", miles: 300 },
  { a: "WV", b: "OH", miles: 160 },
  { a: "WV", b: "KY", miles: 280 },
  { a: "NC", b: "SC", miles: 95 },
  { a: "NC", b: "TN", miles: 410 },
  { a: "NC", b: "GA", miles: 245 },
  { a: "SC", b: "GA", miles: 215 },
  // ── Southeast ──────────────────────────
  { a: "GA", b: "FL", miles: 660 },
  { a: "GA", b: "AL", miles: 150 },
  { a: "GA", b: "TN", miles: 250 },
  { a: "AL", b: "MS", miles: 240 },
  { a: "AL", b: "TN", miles: 190 },
  { a: "MS", b: "TN", miles: 410 },
  { a: "MS", b: "LA", miles: 185 },
  { a: "MS", b: "AR", miles: 265 },
  { a: "LA", b: "TX", miles: 350 },
  // ── Mid-South ──────────────────────────
  { a: "TN", b: "KY", miles: 175 },
  { a: "TN", b: "AR", miles: 350 },
  { a: "KY", b: "OH", miles: 210 },
  { a: "KY", b: "IN", miles: 115 },
  { a: "KY", b: "IL", miles: 300 },
  { a: "AR", b: "MO", miles: 400 },
  { a: "AR", b: "OK", miles: 340 },
  { a: "AR", b: "TX", miles: 440 },
  // ── Great Lakes ────────────────────────
  { a: "OH", b: "IN", miles: 175 },
  { a: "OH", b: "MI", miles: 205 },
  { a: "IN", b: "MI", miles: 285 },
  { a: "IN", b: "IL", miles: 180 },
  { a: "MI", b: "WI", miles: 380 },
  { a: "IL", b: "WI", miles: 90 },
  { a: "IL", b: "IA", miles: 330 },
  { a: "IL", b: "MO", miles: 510 },
  { a: "WI", b: "MN", miles: 335 },
  { a: "WI", b: "IA", miles: 340 },
  // ── Upper Midwest / Plains ─────────────
  { a: "MN", b: "IA", miles: 245 },
  { a: "MN", b: "ND", miles: 240 },
  { a: "MN", b: "SD", miles: 240 },
  { a: "IA", b: "SD", miles: 285 },
  { a: "IA", b: "NE", miles: 135 },
  { a: "IA", b: "MO", miles: 195 },
  { a: "NE", b: "SD", miles: 180 },
  { a: "NE", b: "MO", miles: 185 },
  { a: "NE", b: "KS", miles: 290 },
  { a: "NE", b: "WY", miles: 495 },
  { a: "NE", b: "CO", miles: 540 },
  { a: "SD", b: "ND", miles: 240 },
  { a: "SD", b: "WY", miles: 435 },
  { a: "SD", b: "MT", miles: 505 },
  { a: "ND", b: "MT", miles: 415 },
  { a: "MO", b: "KS", miles: 200 },
  { a: "MO", b: "OK", miles: 340 },
  { a: "KS", b: "OK", miles: 160 },
  { a: "KS", b: "CO", miles: 520 },
  // ── South Central ──────────────────────
  { a: "OK", b: "TX", miles: 450 },
  { a: "OK", b: "NM", miles: 545 },
  // ── Mountain West ──────────────────────
  { a: "NM", b: "CO", miles: 450 },
  { a: "NM", b: "AZ", miles: 420 },
  { a: "CO", b: "WY", miles: 100 },
  { a: "CO", b: "UT", miles: 525 },
  { a: "WY", b: "UT", miles: 440 },
  { a: "WY", b: "MT", miles: 450 },
  { a: "MT", b: "ID", miles: 620 },
  { a: "UT", b: "ID", miles: 340 },
  { a: "UT", b: "NV", miles: 420 },
  { a: "NV", b: "AZ", miles: 300 },
  { a: "NV", b: "CA", miles: 270 },
  { a: "AZ", b: "CA", miles: 375 },
  // ── Pacific Northwest ──────────────────
  { a: "CA", b: "OR", miles: 960 },
  { a: "OR", b: "WA", miles: 175 },
  { a: "OR", b: "ID", miles: 430 },
];

const ADJACENCY: Map<string, { to: string; miles: number }[]> = (() => {
  const map = new Map<string, { to: string; miles: number }[]>();
  const link = (from: string, to: string, miles: number) => {
    if (!map.has(from)) map.set(from, []);
    map.get(from)!.push({ to, miles });
  };
  for (const { a, b, miles } of INTERSTATE_EDGES) {
    link(a, b, miles);
    link(b, a, miles);
  }
  return map;
})();

/** State codes that are on the road graph (lower 48 + DC). */
export const ROAD_CONNECTED_STATES: string[] = [...ADJACENCY.keys()].sort();

export function isRoadConnected(code: string): boolean {
  return ADJACENCY.has(code);
}

/**
 * Shortest driving route between two states along the interstate graph.
 * Returns the ordered list of state codes (origin first, destination last)
 * and the total mileage, or null if either endpoint is off the graph.
 */
export function findRoute(
  from: string,
  to: string
): { path: string[]; miles: number } | null {
  if (!ADJACENCY.has(from) || !ADJACENCY.has(to)) return null;
  if (from === to) return { path: [from], miles: 0 };

  const dist = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  // Small graph — a linear-scan frontier is plenty.
  const frontier = new Set<string>([from]);

  while (frontier.size > 0) {
    let current = "";
    let best = Infinity;
    for (const node of frontier) {
      const d = dist.get(node) ?? Infinity;
      if (d < best) {
        best = d;
        current = node;
      }
    }
    frontier.delete(current);
    if (current === to) break;
    visited.add(current);

    for (const { to: next, miles } of ADJACENCY.get(current) ?? []) {
      if (visited.has(next)) continue;
      const candidate = best + miles;
      if (candidate < (dist.get(next) ?? Infinity)) {
        dist.set(next, candidate);
        prev.set(next, current);
        frontier.add(next);
      }
    }
  }

  if (!dist.has(to)) return null;
  const path: string[] = [to];
  let step = to;
  while (step !== from) {
    step = prev.get(step)!;
    path.unshift(step);
  }
  return { path, miles: Math.round(dist.get(to)!) };
}
