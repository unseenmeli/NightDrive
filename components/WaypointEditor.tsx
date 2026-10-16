"use client";

import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/db/schema";
import { snapToRoads, type Track } from "@/lib/roads";
import { parsePath } from "@/lib/validation";
import { EditorMap } from "./map";

const toText = (points: LatLng[]) => points.map(([lat, lng]) => `${lat}, ${lng}`).join("\n");

// Map and textarea edit the same waypoint list: clicking the map rewrites the text,
// typing valid "lat, lng" lines moves the map. The textarea is what the form submits.
export function WaypointEditor({ id, name, defaultValue }: { id: string; name: string; defaultValue: string }) {
  const [text, setText] = useState(defaultValue);
  const [points, setPoints] = useState<LatLng[]>(() => parsePath(defaultValue) ?? []);
  const [snap, setSnap] = useState<{ key: string; track: Track | null } | null>(null);

  const key = toText(points);
  useEffect(() => {
    if (points.length < 2) return;
    // Debounced so dragging a point or typing doesn't fire a request per keystroke.
    const timer = setTimeout(async () => setSnap({ key, track: await snapToRoads(points) }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const track = snap?.key === key ? snap.track : null;
  const snapping = points.length > 1 && snap?.key !== key;

  function updatePoints(next: LatLng[]) {
    setPoints(next);
    setText(toText(next));
  }

  function updateText(value: string) {
    setText(value);
    const parsed = parsePath(value);
    if (parsed) setPoints(parsed);
  }

  // Distance and duration are plain uncontrolled inputs elsewhere in the form.
  function applyTrackStats() {
    if (!track) return;
    for (const [field, value] of [["distanceKm", track.distanceKm], ["durationMin", track.durationMin]] as const) {
      const input = document.getElementById(field) as HTMLInputElement | null;
      if (input) input.value = String(value);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative h-[380px] overflow-hidden border border-line">
        <EditorMap points={points} track={track} onChange={updatePoints} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-mist">
        <span>Click the map to add a waypoint · drag to move · click a point to remove it</span>
        <span className="ml-auto flex gap-3">
          <button
            type="button"
            className="cursor-pointer tracking-[0.2em] text-neon uppercase hover:text-white disabled:opacity-40"
            disabled={points.length === 0}
            onClick={() => updatePoints(points.slice(0, -1))}
          >
            Undo
          </button>
          <button
            type="button"
            className="cursor-pointer tracking-[0.2em] text-stop/80 uppercase hover:text-stop disabled:opacity-40"
            disabled={points.length === 0}
            onClick={() => updatePoints([])}
          >
            Clear
          </button>
        </span>
      </div>
      {points.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 border border-line bg-asphalt/60 px-4 py-2 font-mono text-xs">
          {snapping ? (
            <span className="text-mist">Snapping to roads…</span>
          ) : track ? (
            <>
              <span className="text-neon">
                Road trace: {track.distanceKm} km · {track.durationMin} min drive
              </span>
              <button
                type="button"
                onClick={applyTrackStats}
                className="ml-auto cursor-pointer tracking-[0.2em] text-sodium uppercase hover:text-white"
              >
                Use for distance &amp; duration
              </button>
            </>
          ) : (
            <span className="text-sodium">Couldn&apos;t reach the routing service · showing straight lines</span>
          )}
        </div>
      )}
      <textarea id={id} name={name} rows={4} value={text} onChange={(e) => updateText(e.target.value)} />
    </div>
  );
}
