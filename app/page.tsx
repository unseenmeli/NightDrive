import Link from "next/link";
import { RouteCard } from "@/components/RouteCard";
import { DIFFICULTIES, parseFilters } from "@/lib/filters";
import { listApprovedRoutes, listRegions } from "@/lib/routes";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseFilters(await searchParams);
  const [routes, regions] = await Promise.all([listApprovedRoutes(filters), listRegions()]);

  return (
    <main className="space-y-10">
      <section className="relative overflow-hidden py-4 sm:py-16">
        <p className="hud">Sakartvelo · after dark · {regions.length} regions online</p>
        <h1 className="chrome mt-3 text-5xl italic sm:text-7xl">NightDrive</h1>
        <p className="mt-4 max-w-xl text-lg text-fog/90">Discover and plan scenic night drives.</p>
        <p className="mt-1 max-w-xl text-sm text-mist">
          Mountain passes, empty coast roads and city loops, picked for when the streets go quiet.
        </p>
        {/* Horizon: sodium glow with a perspective road grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-6 -z-10 h-40 opacity-60 [mask-image:linear-gradient(to_top,black,transparent)]"
          style={{
            background:
              "linear-gradient(to top, rgb(255 173 66 / 0.18), transparent 70%), repeating-linear-gradient(90deg, rgb(180 92 255 / 0.25) 0 1px, transparent 1px 60px)",
            transform: "perspective(300px) rotateX(55deg)",
            transformOrigin: "bottom",
          }}
        />
      </section>

      <form method="get" role="search" className="panel grid grid-cols-2 gap-4 p-5 lg:grid-cols-6 lg:items-end">
        <p className="hud col-span-2 lg:col-span-6">Search filters</p>
        <div className="col-span-2">
          <input type="search" name="q" placeholder="Search routes" defaultValue={filters.q} />
        </div>
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
        <label className="flex flex-col gap-1">
          Min scenery
          <input type="number" name="minScenery" min={1} max={10} defaultValue={filters.minScenery} />
        </label>
        <label className="flex flex-col gap-1">
          Min road quality
          <input type="number" name="minRoad" min={1} max={10} defaultValue={filters.minRoad} />
        </label>
        <div className="col-span-2 flex items-center gap-4 lg:col-span-6">
          <button type="submit" className="btn">
            Search
          </button>
          <Link href="/" className="font-mono text-xs tracking-[0.2em] uppercase">
            Reset
          </Link>
        </div>
      </form>

      <section className="space-y-5">
        <h2 className="flex items-baseline gap-3 text-2xl italic">
          Routes
          <span className="font-mono text-sm text-neon not-italic">[{String(routes.length).padStart(2, "0")}]</span>
        </h2>
        {routes.length === 0 ? (
          <div className="panel p-10 text-center">
            <p className="font-display text-sodium italic">Dead end.</p>
            <p className="mt-2 text-mist">No routes match your filters.</p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route, i) => (
              <RouteCard key={route.id} route={route} index={i} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
