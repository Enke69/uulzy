"use client";

import dynamic from "next/dynamic";

const loading = (height: string) => (
  <div
    className="card grid place-items-center text-ink-soft text-sm"
    style={{ height }}
  >
    Loading map…
  </div>
);

/** Leaflet touches `window` on import, so both maps are client-only. */
export const CityMapDynamic = dynamic(
  () => import("@/components/map/CityMap").then((m) => m.CityMap),
  { ssr: false, loading: () => loading("clamp(380px, 55vh, 620px)") }
);

export const RouteMapDynamic = dynamic(
  () => import("@/components/map/RouteMap").then((m) => m.RouteMap),
  { ssr: false, loading: () => loading("clamp(320px, 45vh, 480px)") }
);

export const LocationPickerDynamic = dynamic(
  () => import("@/components/map/LocationPicker").then((m) => m.LocationPicker),
  { ssr: false, loading: () => loading("300px") }
);
