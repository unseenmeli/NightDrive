"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` on import, so the maps only ever render in the browser.
function MapLoading() {
  return (
    <div className="grid h-full w-full place-items-center bg-asphalt/60 font-mono text-xs tracking-[0.25em] text-mist uppercase">
      Loading map…
    </div>
  );
}

export const RouteMap = dynamic(() => import("./RouteMapView"), { ssr: false, loading: MapLoading });
export const OverviewMap = dynamic(() => import("./OverviewMapView"), { ssr: false, loading: MapLoading });
export const EditorMap = dynamic(() => import("./EditorMapView"), { ssr: false, loading: MapLoading });
