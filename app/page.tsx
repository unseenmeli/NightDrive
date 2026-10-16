import Link from "next/link";
import { DIFFICULTIES, parseFilters } from "@/lib/filters";
import { listApprovedRoutes, listRegions } from "@/lib/routes";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseFilters(await searchParams);
  const [routes, regions] = await Promise.all([listApprovedRoutes(filters), listRegions()]);

  return (
    <main>
      <h1>NightDrive</h1>
      <p>Discover and plan scenic night drives.</p>

      <form method="get" role="search">
        <input type="search" name="q" placeholder="Search routes" defaultValue={filters.q} />
        <select name="region" defaultValue={filters.region ?? ""} aria-label="Region">
          <option value="">Any region</option>
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select name="difficulty" defaultValue={filters.difficulty ?? ""} aria-label="Difficulty">
          <option value="">Any difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <label>
          Min scenery{" "}
          <input type="number" name="minScenery" min={1} max={10} defaultValue={filters.minScenery} />
        </label>
        <label>
          Min road quality{" "}
          <input type="number" name="minRoad" min={1} max={10} defaultValue={filters.minRoad} />
        </label>
        <button type="submit">Search</button> <Link href="/">Reset</Link>
      </form>

      <h2>Routes ({routes.length})</h2>
      {routes.length === 0 ? (
        <p>No routes match your filters.</p>
      ) : (
        <ul>
          {routes.map((route) => (
            <li key={route.id}>
              <Link href={`/routes/${route.slug}`}>{route.title}</Link> · {route.region} ·{" "}
              {route.distanceKm} km · scenery {route.scenery}/10 · road {route.roadQuality}/10 ·{" "}
              {route.difficulty}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
