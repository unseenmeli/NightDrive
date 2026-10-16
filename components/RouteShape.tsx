import { useId } from "react";
import type { LatLng, Stop } from "@/lib/db/schema";

const W = 320;
const H = 180;
const PAD = 24;

// Equirectangular projection fitted into the viewBox, keeping the route's real proportions.
function project(points: LatLng[]) {
  const lat0 = (points.reduce((sum, [lat]) => sum + lat, 0) / points.length) * (Math.PI / 180);
  const raw = points.map(([lat, lng]) => [lng * Math.cos(lat0), -lat] as const);
  const xs = raw.map(([x]) => x);
  const ys = raw.map(([, y]) => y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min((W - PAD * 2) / (maxX - minX || 1), (H - PAD * 2) / (maxY - minY || 1));
  const offX = (W - (maxX - minX) * scale) / 2;
  const offY = (H - (maxY - minY) * scale) / 2;
  return (lat: number, lng: number) => {
    const [x, y] = [lng * Math.cos(lat0), -lat];
    return [offX + (x - minX) * scale, offY + (y - minY) * scale] as const;
  };
}

// Catmull-Rom spline through the waypoints so hand-placed points read as a road, not a zigzag.
function smoothPath(pts: (readonly [number, number])[]) {
  if (pts.length < 3) return `M${pts.map((p) => p.join(",")).join("L")}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1.join(",")} ${c2.join(",")} ${p2.join(",")}`;
  }
  return d;
}

export function RouteShape({
  path,
  stops = [],
  showStops = false,
  className = "",
}: {
  path: LatLng[];
  stops?: Stop[];
  showStops?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  if (path.length < 2) return null;

  const toXY = project(path);
  const pts = path.map(([lat, lng]) => toXY(lat, lng));
  const d = smoothPath(pts);
  const [start, end] = [pts[0], pts[pts.length - 1]];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Route shape">
      <defs>
        <pattern id={`grid-${id}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="#1f2a4a" strokeWidth="0.5" />
        </pattern>
        <linearGradient id={`line-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-neon)" />
          <stop offset="100%" stopColor="var(--color-violet)" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#grid-${id})`} opacity="0.7" />

      <path d={d} fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="7" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={`url(#line-${id})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="route-glow"
      />

      {showStops &&
        stops.map((stop) => {
          const [x, y] = toXY(stop.lat, stop.lng);
          return (
            <g key={stop.name}>
              <rect x={x - 4} y={y - 4} width="8" height="8" transform={`rotate(45 ${x} ${y})`} fill="var(--color-violet)" />
              <text x={x + 9} y={y + 3} fill="#c9d2ee" fontSize="8" fontFamily="var(--font-mono)">
                {stop.name}
              </text>
            </g>
          );
        })}

      <circle cx={start[0]} cy={start[1]} r="4.5" fill="var(--color-night)" stroke="var(--color-neon)" strokeWidth="2" />
      <circle cx={end[0]} cy={end[1]} r="9" fill="var(--color-sodium)" opacity="0.25">
        <animate attributeName="r" values="5;11;5" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.45;0;0.45" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx={end[0]} cy={end[1]} r="4" fill="var(--color-sodium)" />
    </svg>
  );
}
