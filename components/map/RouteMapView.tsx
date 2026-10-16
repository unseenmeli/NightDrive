"use client";

import { MapContainer, Marker, Tooltip } from "react-leaflet";
import type { LatLng, Stop } from "@/lib/db/schema";
import type { Track } from "@/lib/roads";
import { DarkTiles, endIcon, FitBounds, GlowLine, startIcon, stopIcon, TBILISI } from "./parts";

export default function RouteMapView({
  waypoints,
  track,
  stops,
  startName,
  endName,
}: {
  waypoints: LatLng[];
  track: Track | null;
  stops: Stop[];
  startName: string;
  endName: string;
}) {
  // Without a road trace (routing service down) fall back to dashed straight lines.
  const line = track?.line ?? waypoints;

  return (
    <MapContainer center={TBILISI} zoom={9} scrollWheelZoom={false} className="h-full w-full">
      <DarkTiles />
      <FitBounds points={line} />
      <GlowLine positions={line} dashed={!track} />
      <Marker position={line[0]} icon={startIcon}>
        <Tooltip direction="top">Start · {startName}</Tooltip>
      </Marker>
      <Marker position={line[line.length - 1]} icon={endIcon}>
        <Tooltip direction="top">Finish · {endName}</Tooltip>
      </Marker>
      {stops.map((stop) => (
        <Marker key={stop.name} position={[stop.lat, stop.lng]} icon={stopIcon}>
          <Tooltip direction="top">
            {stop.name} · {stop.type}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
