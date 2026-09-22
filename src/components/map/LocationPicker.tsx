"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { emojiPin } from "@/components/map/mapSetup";
import { UB_CENTER, UB_DEFAULT_ZOOM } from "@/lib/utils";

function ClickCatcher({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Click the map to drop a pin; the parent form submits lat/lng with the place. */
export function LocationPicker({
  category,
  value,
  onChange,
}: {
  category: string;
  value: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number } | null) => void;
}) {
  const [zoom] = useState(UB_DEFAULT_ZOOM);
  return (
    <div>
      <span className="label">Location — click the map to drop a pin</span>
      <div className="card overflow-hidden">
        <MapContainer
          center={UB_CENTER}
          zoom={zoom}
          style={{ height: 300, width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCatcher onPick={(lat, lng) => onChange({ lat, lng })} />
          {value && (
            <Marker position={[value.lat, value.lng]} icon={emojiPin(category, true)} />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-ink-soft mt-1.5">
        {value ? (
          <>
            Pinned at {value.lat.toFixed(5)}, {value.lng.toFixed(5)} ·{" "}
            <button
              type="button"
              className="text-primary font-semibold"
              onClick={() => onChange(null)}
            >
              clear
            </button>
          </>
        ) : (
          "Optional, but places with a pin show up on the map."
        )}
      </p>
    </div>
  );
}
