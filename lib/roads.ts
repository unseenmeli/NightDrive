import type { LatLng } from "./db/schema";

export type Track = { line: LatLng[]; distanceKm: number; durationMin: number };

// Public OSRM demo server: free and keyless, fine for a hobby project but rate-limited and
// without uptime guarantees, so every caller must cope with `null` (draw straight lines instead).
const OSRM = "https://router.project-osrm.org/route/v1/driving";

/**
 * Snaps hand-placed waypoints to the road network and returns the road geometry.
 * `detail: "simplified"` returns a light line for overviews and cards.
 */
export async function snapToRoads(
  waypoints: LatLng[],
  { detail = "full", init }: { detail?: "full" | "simplified"; init?: RequestInit } = {},
): Promise<Track | null> {
  if (waypoints.length < 2) return null;
  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
  try {
    const res = await fetch(`${OSRM}/${coords}?overview=${detail}&geometries=geojson`, {
      signal: AbortSignal.timeout(5000),
      ...init,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const route = data.routes?.[0];
    if (data.code !== "Ok" || !route) return null;
    return {
      line: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
      distanceKm: Math.round(route.distance / 1000),
      durationMin: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

/** Server-side variant: results are kept in Next's data cache, since roads rarely move. */
export function cachedSnap(waypoints: LatLng[], detail: "full" | "simplified" = "full") {
  return snapToRoads(waypoints, { detail, init: { cache: "force-cache" } });
}
