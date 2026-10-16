"use client";

import "leaflet/dist/leaflet.css";
import L, { type LatLngExpression, type PathOptions } from "leaflet";
import { useEffect, useRef } from "react";
import { Polyline, TileLayer, useMap } from "react-leaflet";
import type { LatLng } from "@/lib/db/schema";

export const TBILISI: LatLng = [41.7151, 44.8271];

// Esri's Dark Gray Canvas: keyless and dark by design. Labels come as a separate layer on top.
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";

export function DarkTiles() {
  return (
    <>
      <TileLayer
        url={`${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`}
        attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
        maxZoom={16}
      />
      <TileLayer url={`${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`} maxZoom={16} className="nd-labels" />
    </>
  );
}

/** A dark casing under a bright neon core, so the route reads on any part of the map. */
export function GlowLine({
  positions,
  color = "#3ef0ff",
  dashed = false,
  eventHandlers,
  children,
}: {
  positions: LatLngExpression[];
  color?: string;
  dashed?: boolean;
  eventHandlers?: L.LeafletEventHandlerFnMap;
  children?: React.ReactNode;
}) {
  const core: PathOptions = { color, weight: 3.5, opacity: 0.95, className: "route-glow", dashArray: dashed ? "6 8" : undefined };
  return (
    <>
      {/* The wide casing doubles as the hover/click target when the line is interactive */}
      <Polyline
        positions={positions}
        pathOptions={{ color: "#000", weight: 9, opacity: 0.55, interactive: !!eventHandlers }}
        eventHandlers={eventHandlers}
      />
      <Polyline positions={positions} pathOptions={core} eventHandlers={eventHandlers}>
        {children}
      </Polyline>
    </>
  );
}

const icon = (html: string, size: number) =>
  L.divIcon({ html, className: "nd-marker", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

export const startIcon = icon('<span class="nd-start"></span>', 16);
export const endIcon = icon('<span class="nd-end"></span>', 18);
export const stopIcon = icon('<span class="nd-stop"></span>', 14);
export const waypointIcon = (n: number) => icon(`<span class="nd-waypoint">${n}</span>`, 22);

/**
 * Fits the view to the given points whenever the set of points changes.
 * With `once`, it only fits to the points present on mount (so adding points doesn't move the view).
 */
export function FitBounds({ points, padding = 40, once = false }: { points: LatLng[]; padding?: number; once?: boolean }) {
  const map = useMap();
  const fitted = useRef(false);
  const key = points.map((p) => p.join(",")).join(";");
  useEffect(() => {
    if (once && fitted.current) return;
    fitted.current = true;
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 13);
    else map.fitBounds(L.latLngBounds(points), { padding: [padding, padding] });
    // Only refit when the points really change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map, padding, once]);
  return null;
}
