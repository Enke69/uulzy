"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { emojiPin } from "@/components/map/mapSetup";
import {
  CATEGORY_GROUPS,
  CATEGORIES,
  UB_CENTER,
  UB_DEFAULT_ZOOM,
  categoriesInGroup,
  categoryLabel,
  formatRange,
} from "@/lib/utils";

export type MapPlace = {
  id: string;
  slug: string;
  name: string;
  category: string;
  district: string;
  lat: number;
  lng: number;
  priceMin: number;
  priceMax: number;
  avgRating: number | null;
  reviewCount: number;
};

export function CityMap({ places }: { places: MapPlace[] }) {
  const [group, setGroup] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const groupCategories = useMemo(() => categoriesInGroup(group), [group]);

  const visible = useMemo(() => {
    return places.filter((p) => {
      if (category) return p.category === category;
      if (groupCategories.length) return groupCategories.includes(p.category);
      return true;
    });
  }, [places, category, groupCategories]);

  function pickGroup(value: string) {
    setGroup((prev) => (prev === value ? "" : value));
    setCategory("");
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mood picker */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`chip ${!group ? "chip-active" : ""}`}
          onClick={() => {
            setGroup("");
            setCategory("");
          }}
        >
          🗺️ Everything
        </button>
        {CATEGORY_GROUPS.map((g) => (
          <button
            key={g.value}
            className={`chip ${group === g.value ? "chip-active" : ""}`}
            onClick={() => pickGroup(g.value)}
          >
            <span aria-hidden>{g.emoji}</span> {g.label}
          </button>
        ))}
      </div>

      {/* Sub-categories, once a mood is chosen */}
      {groupCategories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            className={`chip ${!category ? "chip-active" : ""}`}
            onClick={() => setCategory("")}
          >
            All
          </button>
          {CATEGORIES.filter((c) => groupCategories.includes(c.value)).map((c) => (
            <button
              key={c.value}
              className={`chip ${category === c.value ? "chip-active" : ""}`}
              onClick={() => setCategory((prev) => (prev === c.value ? "" : c.value))}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-ink-soft" aria-live="polite">
        Showing <span className="font-semibold text-ink">{visible.length}</span>{" "}
        {visible.length === 1 ? "place" : "places"} on the map
      </p>

      <div className="card overflow-hidden">
        <MapContainer
          center={UB_CENTER}
          zoom={UB_DEFAULT_ZOOM}
          scrollWheelZoom
          style={{ height: "clamp(380px, 55vh, 620px)", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visible.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={emojiPin(p.category)}>
              <Popup>
                <span className="block font-bold text-sm">{p.name}</span>
                <span className="block text-xs opacity-70">
                  {categoryLabel(p.category)} · {p.district}
                </span>
                <span className="block text-xs font-semibold mt-1">
                  {formatRange(p.priceMin, p.priceMax)}
                  {p.avgRating !== null && ` · ★ ${p.avgRating} (${p.reviewCount})`}
                </span>
                <Link
                  href={`/places/${p.slug}`}
                  className="block mt-1.5 font-semibold text-[#7c61d4]"
                >
                  View place →
                </Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
