"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, DISTRICTS } from "@/lib/utils";
import { LocationPickerDynamic } from "@/components/map/DynamicMaps";

export function PlaceForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [category, setCategory] = useState<string>(CATEGORIES[0].value);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name")),
        category: String(form.get("category")),
        district: String(form.get("district")),
        address: String(form.get("address")),
        description: String(form.get("description") ?? ""),
        imageUrl: "",
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        priceMin: Number(form.get("priceMin")),
        priceMax: Number(form.get("priceMax")),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to submit.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <p className="text-3xl mb-2">🎉</p>
        <p className="font-bold text-lg">Thanks — submitted for review!</p>
        <p className="text-ink-soft text-sm mt-1">
          You&apos;ll earn points when an admin approves it.
        </p>
        <button className="btn btn-primary mt-4" onClick={() => router.push("/places")}>
          Back to places
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 flex flex-col gap-4">
      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input id="name" name="name" className="input" required minLength={2} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="input"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="district">
            District
          </label>
          <select id="district" name="district" className="input" required>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="address">
          Address
        </label>
        <input
          id="address"
          name="address"
          className="input"
          placeholder="Street, landmark…"
          required
          minLength={3}
        />
      </div>
      <LocationPickerDynamic
        category={category}
        value={coords}
        onChange={setCoords}
      />
      <div>
        <label className="label" htmlFor="description">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          className="input min-h-20"
          maxLength={2000}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="priceMin">
            Price from (₮ / person)
          </label>
          <input
            id="priceMin"
            name="priceMin"
            type="number"
            min={0}
            step={1000}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="priceMax">
            Price to (₮ / person)
          </label>
          <input
            id="priceMax"
            name="priceMax"
            type="number"
            min={0}
            step={1000}
            className="input"
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
