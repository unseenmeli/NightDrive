"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapContainer, Tooltip } from "react-leaflet";
import type { LatLng } from "@/lib/db/schema";
import { DarkTiles, FitBounds, GlowLine, TBILISI } from "./parts";

export type OverviewRoute = { slug: string; title: string; line: LatLng[] };

export default function OverviewMapView({ routes }: { routes: OverviewRoute[] }) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);

  return (
    <MapContainer center={TBILISI} zoom={7} scrollWheelZoom={false} className="h-full w-full">
      <DarkTiles />
      <FitBounds points={routes.flatMap((r) => r.line)} padding={30} />
      {routes.map((route) => (
        <GlowLine
          key={route.slug}
          positions={route.line}
          color={active === route.slug ? "#ffad42" : "#3ef0ff"}
          eventHandlers={{
            mouseover: () => setActive(route.slug),
            mouseout: () => setActive(null),
            click: () => router.push(`/routes/${route.slug}`),
          }}
        >
          <Tooltip sticky>{route.title}</Tooltip>
        </GlowLine>
      ))}
    </MapContainer>
  );
}
