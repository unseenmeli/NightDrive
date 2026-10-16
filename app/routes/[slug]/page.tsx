import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteShape } from "@/components/RouteShape";
import { StatBar } from "@/components/StatBar";
import type { StopType } from "@/lib/db/schema";
import { getApprovedRoute } from "@/lib/routes";

const STOP_ICONS: Record<StopType, string> = { fuel: "F", cafe: "C", viewpoint: "◈", parking: "P" };

export default async function RoutePage({ params }: PageProps<"/routes/[slug]">) {
  const { slug } = await params;
  const route = await getApprovedRoute(slug);
  if (!route) notFound();

  return (
    <main className="space-y-8">
      <Link href="/" className="inline-block font-mono text-xs tracking-[0.2em] uppercase">
        ← All routes
      </Link>

      <header>
        <p className="hud">{route.region}</p>
        <h1 className="chrome mt-2 text-4xl italic sm:text-5xl">{route.title}</h1>
        <p className="mt-3 font-mono text-sm tracking-wider text-mist">
          <span className="text-neon">{route.startName}</span> → <span className="text-sodium">{route.endName}</span> ·{" "}
          {route.region}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="panel bg-asphalt/70">
          <RouteShape path={route.path} stops={route.stops} showStops className="w-full" />
          <p className="hud absolute bottom-3 left-4">Route trace · not to scale</p>
        </div>

        <aside className="panel space-y-5 p-5">
          <p className="hud">Spec sheet</p>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="font-mono text-[0.65rem] tracking-[0.2em] text-mist uppercase">Distance</dt>
              <dd className="font-display text-2xl text-white">
                {route.distanceKm}
                <span className="ml-1 text-sm text-mist">km</span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.65rem] tracking-[0.2em] text-mist uppercase">Duration</dt>
              <dd className="font-display text-2xl text-white">
                ~{route.durationMin}
                <span className="ml-1 text-sm text-mist">min</span>
              </dd>
            </div>
          </dl>
          <StatBar label="Scenery" value={route.scenery} />
          <StatBar label="Road quality" value={route.roadQuality} />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-[0.15em] text-mist uppercase">Difficulty</span>
            <span className={`chip chip-${route.difficulty}`}>{route.difficulty}</span>
          </div>
          {route.bestTime && (
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-xs tracking-[0.15em] text-mist uppercase">Best time</span>
              <span className="text-right text-sm text-sodium">{route.bestTime}</span>
            </div>
          )}
          {route.bestFor.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {route.bestFor.map((tag) => (
                <span key={tag} className="chip chip-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <p className="hud">Briefing</p>
          <p className="text-lg leading-relaxed text-fog">{route.description}</p>
          {route.notes && (
            <p className="border-l-2 border-sodium/70 pl-4 text-mist italic">
              <span className="font-mono text-xs tracking-[0.2em] text-sodium not-italic uppercase">Notes: </span>
              {route.notes}
            </p>
          )}
        </div>

        {route.stops.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg italic">Stops</h2>
            <ul className="space-y-2">
              {route.stops.map((stop) => (
                <li key={stop.name} className="panel flex items-center gap-3 px-4 py-3">
                  <span className="grid size-8 place-items-center border border-violet/50 bg-violet/10 text-violet">
                    {STOP_ICONS[stop.type]}
                  </span>
                  <span>
                    <span className="block text-sm text-white">{stop.name}</span>
                    <span className="font-mono text-[0.65rem] tracking-[0.2em] text-mist uppercase">{stop.type}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
