"use client";

import { MapContainer, Marker, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/lib/db/schema";
import type { Track } from "@/lib/roads";
import { DarkTiles, FitBounds, GlowLine, TBILISI, waypointIcon } from "./parts";

const round = (n: number) => Math.round(n * 1e5) / 1e5;

function AddOnClick({ onAdd }: { onAdd: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onAdd([round(e.latlng.lat), round(e.latlng.lng)]) });
  return null;
}

export default function EditorMapView({
  points,
  track,
  onChange,
}: {
  points: LatLng[];
  track: Track | null;
  onChange: (points: LatLng[]) => void;
}) {
  return (
    <MapContainer center={TBILISI} zoom={8} doubleClickZoom={false} className="nd-editor h-full w-full">
      <DarkTiles />
      <FitBounds points={points} once />
      <AddOnClick onAdd={(p) => onChange([...points, p])} />
      {points.length > 1 && <GlowLine positions={track?.line ?? points} dashed={!track} />}
      {points.map((point, i) => (
        <Marker
          key={i}
          position={point}
          icon={waypointIcon(i + 1)}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onChange(points.map((p, j) => (j === i ? [round(lat), round(lng)] : p)));
            },
            click: () => onChange(points.filter((_, j) => j !== i)),
          }}
        />
      ))}
    </MapContainer>
  );
}
