"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { emojiPin, numberPin } from "@/components/map/mapSetup";
import {
  UB_CENTER,
  directionsUrl,
  formatDistance,
  formatRange,
  haversineKm,
  routeDistanceKm,
} from "@/lib/utils";

export type RouteStop = {
  order: number;
  activity: string;
  placeName: string;
  lat: number;
  lng: number;
  startTime: string;
  endTime: string;
  priceMin: number;
  priceMax: number;
  /** Set for a lone place so its pin shows the category emoji instead of "1". */
  category?: string;
};

type Line = [number, number][];

/**
 * Asks the public OSRM demo server for road geometry between the stops. It is
 * rate-limited and not for production traffic, so any failure just falls back
 * to straight lines between stops — the map still renders the trajectory.
 */
async function fetchRoadRoute(stops: RouteStop[], signal: AbortSignal): Promise<Line | null> {
  if (stops.length < 2) return null;
  const coords = stops.map((s) => `${s.lng},${s.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  const line = data?.routes?.[0]?.geometry?.coordinates;
  if (!Array.isArray(line)) return null;
  return line.map((c: [number, number]) => [c[1], c[0]]);
}

/**
 * Frames the whole route. MapContainer's `bounds` prop only applies on first
 * render and loses to `center`/`zoom`, so fit imperatively once the stops are known.
 */
function FitToStops({ points }: { points: Line }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(points, { padding: [45, 45], maxZoom: 16 });
  }, [map, points]);
  return null;
}

export function RouteMap({ stops }: { stops: RouteStop[] }) {
  const straightLine = useMemo<Line>(
    () => stops.map((s) => [s.lat, s.lng] as [number, number]),
    [stops]
  );
  const [roadLine, setRoadLine] = useState<Line | null>(null);
  const [routing, setRouting] = useState(stops.length >= 2);

  useEffect(() => {
    if (stops.length < 2) return;
    const controller = new AbortController();
    setRouting(true);
    fetchRoadRoute(stops, controller.signal)
      .then((line) => line && setRoadLine(line))
      .catch(() => {
        /* fall back to the straight line */
      })
      .finally(() => setRouting(false));
    return () => controller.abort();
  }, [stops]);

  const legs = useMemo(
    () =>
      stops.slice(1).map((stop, i) => ({
        from: stops[i].placeName,
        to: stop.placeName,
        km: haversineKm(stops[i], stop),
      })),
    [stops]
  );

  const totalKm = useMemo(() => routeDistanceKm(stops), [stops]);
  const mapsLink = useMemo(() => directionsUrl(stops), [stops]);

  if (stops.length === 0) return null;

  const center: [number, number] =
    stops.length > 0 ? [stops[0].lat, stops[0].lng] : UB_CENTER;

  return (
    <div className="flex flex-col gap-3">
      <div className="card overflow-hidden">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: "clamp(320px, 45vh, 480px)", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToStops points={roadLine ?? straightLine} />
          {straightLine.length > 1 && (
            <Polyline
              positions={roadLine ?? straightLine}
              pathOptions={{
                color: "#7c61d4",
                weight: 5,
                opacity: 0.85,
                dashArray: roadLine ? undefined : "8 10",
              }}
            />
          )}
          {stops.map((s) => (
            <Marker
              key={s.order}
              position={[s.lat, s.lng]}
              icon={
                stops.length === 1 && s.category
                  ? emojiPin(s.category, true)
                  : numberPin(s.order + 1)
              }
            >
              <Popup>
                <span className="block font-bold text-sm">
                  {stops.length > 1 && `${s.order + 1}. `}
                  {s.activity}
                </span>
                <span className="block text-xs opacity-70">{s.placeName}</span>
                <span className="block text-xs mt-1">
                  {s.startTime && `${s.startTime}–${s.endTime} · `}
                  {formatRange(s.priceMin, s.priceMax)}
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {stops.length > 1 && (
        <div className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p className="font-bold">
              🚗 Route · {formatDistance(totalKm)} total
              {routing && (
                <span className="font-normal text-ink-soft text-sm"> · routing…</span>
              )}
              {!routing && !roadLine && (
                <span className="font-normal text-ink-soft text-sm">
                  {" "}
                  · straight-line estimate
                </span>
              )}
            </p>
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Open in Google Maps
              </a>
            )}
          </div>
          <ol className="text-sm text-ink-soft flex flex-col gap-1">
            {legs.map((leg, i) => (
              <li key={i}>
                {i + 1} → {i + 2}: {leg.from} to {leg.to} ·{" "}
                <span className="font-semibold text-ink">
                  {formatDistance(leg.km)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
