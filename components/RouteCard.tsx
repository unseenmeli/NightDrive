import Link from "next/link";
import type { Route } from "@/lib/db/schema";
import { RouteShape } from "./RouteShape";
import { StatBar } from "./StatBar";

export function RouteCard({ route, index }: { route: Route; index: number }) {
  return (
    <li className="group panel flex flex-col transition hover:-translate-y-0.5 hover:border-neon/60">
      <div className="relative border-b border-line/70 bg-asphalt/60">
        <RouteShape path={route.path} className="aspect-[16/9] w-full" />
        <span className="hud absolute top-2 left-3">R{String(index + 1).padStart(2, "0")}</span>
        {route.featured && (
          <span className="chip absolute top-2 right-3 border-sodium/50 bg-night/70 text-sodium">★ Featured</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base leading-snug">
            {/* The ::after stretches the title link over the whole card */}
            <Link
              href={`/routes/${route.slug}`}
              className="text-white after:absolute after:inset-0 group-hover:text-neon group-hover:[text-shadow:0_0_12px_var(--color-neon)]"
            >
              {route.title}
            </Link>
          </h3>
          <p className="mt-1 font-mono text-xs tracking-wider text-mist">
            {route.startName} → {route.endName} · {route.region}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-fog">
          <span className="chip border-line text-fog">{route.distanceKm} km</span>
          <span className="chip border-line text-fog">{route.durationMin} min</span>
          <span className={`chip chip-${route.difficulty}`}>{route.difficulty}</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-4">
          <StatBar label="Scenery" value={route.scenery} />
          <StatBar label="Road" value={route.roadQuality} />
        </div>
      </div>
    </li>
  );
}
