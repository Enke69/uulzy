export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9Ѐ-ӿ]+/g, "-")
      .replace(/^-+|-+$/g, "") || "place"
  );
}

/** Format an MNT amount: 25000 -> "25,000₮" */
export function formatMNT(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-US")}₮`;
}

/** Format a price range: "25,000–40,000₮" (collapses equal ends). */
export function formatRange(min: number, max: number): string {
  if (min === max) return formatMNT(min);
  return `${Math.round(min).toLocaleString("en-US")}–${formatMNT(max)}`;
}

/** Cheap 1-4 tier from an average per-person spend in MNT, for ₮/₮₮₮₮ badges. */
export function priceTier(min: number, max: number): number {
  const avg = (min + max) / 2;
  if (avg < 15000) return 1;
  if (avg < 40000) return 2;
  if (avg < 90000) return 3;
  return 4;
}

export type ItemLike = {
  startTime: string; // "HH:MM"
  endTime: string;
  priceMin: number;
  priceMax: number;
};

/** Minutes since midnight; null when malformed. */
export function parseHM(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Duration in minutes; end before start is treated as crossing midnight. */
export function itemDurationMin(item: ItemLike): number {
  const start = parseHM(item.startTime);
  const end = parseHM(item.endTime);
  if (start === null || end === null) return 0;
  const d = end - start;
  return d >= 0 ? d : d + 24 * 60;
}

export type TemplateTotals = {
  totalMin: number; // MNT
  totalMax: number; // MNT
  totalMinutes: number;
};

export function computeTotals(items: ItemLike[]): TemplateTotals {
  return items.reduce<TemplateTotals>(
    (acc, item) => ({
      totalMin: acc.totalMin + item.priceMin,
      totalMax: acc.totalMax + item.priceMax,
      totalMinutes: acc.totalMinutes + itemDurationMin(item),
    }),
    { totalMin: 0, totalMax: 0, totalMinutes: 0 }
  );
}

export function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/** Template score = sum of vote values (+1/-1). */
export function voteScore(votes: { value: number }[]): number {
  return votes.reduce((s, v) => s + v.value, 0);
}

export function averageRating(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  return (
    Math.round(
      (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
    ) / 10
  );
}

export const CATEGORIES = [
  { value: "RESTAURANT", label: "Restaurants", emoji: "🍽️" },
  { value: "CAFE", label: "Cafes", emoji: "☕" },
  { value: "BAR_PUB", label: "Bars & Pubs", emoji: "🍺" },
  { value: "KARAOKE", label: "Karaoke", emoji: "🎤" },
  { value: "SHOP", label: "Shops", emoji: "🛍️" },
  { value: "CINEMA", label: "Cinemas", emoji: "🎬" },
  { value: "ENTERTAINMENT", label: "Entertainment", emoji: "🎳" },
  { value: "BEAUTY_SPA", label: "Beauty & Spa", emoji: "💆" },
  { value: "SPORT", label: "Sport", emoji: "🏂" },
  { value: "CULTURE", label: "Culture", emoji: "🏛️" },
  { value: "OTHER", label: "Other", emoji: "📍" },
] as const;

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function categoryEmoji(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.emoji ?? "📍";
}

/**
 * Coarse "what are you in the mood for?" groups shown on the map. Each maps to
 * one or more Place categories — this is the top-level filter on the home page.
 */
export const CATEGORY_GROUPS = [
  {
    value: "FOOD",
    label: "Food & Drink",
    emoji: "🍽️",
    categories: ["RESTAURANT", "CAFE", "BAR_PUB"],
  },
  {
    value: "FUN",
    label: "Fun",
    emoji: "🎉",
    categories: ["KARAOKE", "CINEMA", "ENTERTAINMENT", "SPORT"],
  },
  {
    value: "SHOPPING",
    label: "Shopping",
    emoji: "🛍️",
    categories: ["SHOP"],
  },
  {
    value: "CULTURE",
    label: "Culture",
    emoji: "🏛️",
    categories: ["CULTURE"],
  },
  {
    value: "WELLNESS",
    label: "Wellness",
    emoji: "💆",
    categories: ["BEAUTY_SPA"],
  },
] as const;

export type CategoryGroupValue = (typeof CATEGORY_GROUPS)[number]["value"];

/** Categories belonging to a group; empty array = "everything". */
export function categoriesInGroup(group: string | undefined): string[] {
  if (!group) return [];
  return [...(CATEGORY_GROUPS.find((g) => g.value === group)?.categories ?? [])];
}

/** Ulaanbaatar city center — default map view. */
export const UB_CENTER: [number, number] = [47.9188, 106.9176];
export const UB_DEFAULT_ZOOM = 12;

export type LatLng = { lat: number; lng: number };

/** Great-circle distance in kilometres between two points. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

/** Total straight-line travel distance across an ordered list of stops. */
export function routeDistanceKm(stops: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < stops.length; i++) {
    total += haversineKm(stops[i - 1], stops[i]);
  }
  return total;
}

/**
 * Google Maps directions deep link through every stop in order, so people can
 * hand the route to their phone's navigation.
 */
export function directionsUrl(stops: LatLng[]): string | null {
  if (stops.length < 2) return null;
  const origin = `${stops[0].lat},${stops[0].lng}`;
  const last = stops[stops.length - 1];
  const destination = `${last.lat},${last.lng}`;
  const waypoints = stops
    .slice(1, -1)
    .map((s) => `${s.lat},${s.lng}`)
    .join("|");
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export const DISTRICTS = [
  "Sukhbaatar",
  "Chingeltei",
  "Bayangol",
  "Bayanzurkh",
  "Khan-Uul",
  "Songino Khairkhan",
  "Nalaikh",
  "Baganuur",
  "Other",
] as const;
