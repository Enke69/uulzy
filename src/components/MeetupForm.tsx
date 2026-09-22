"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MeetupForm({ places }: { places: { id: string; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/meetups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(form.get("title")),
        description: String(form.get("description") ?? ""),
        placeId: String(form.get("placeId")) || null,
        location: String(form.get("location") ?? ""),
        dateTime: String(form.get("dateTime")),
        capacity: Number(form.get("capacity")),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to post.");
      return;
    }
    const data = await res.json();
    router.push(`/meetups/${data.meetup.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card p-6 flex flex-col gap-4">
      <div>
        <label className="label" htmlFor="m-title">
          Title
        </label>
        <input
          id="m-title"
          name="title"
          className="input"
          placeholder="e.g. Sunday hike group to Bogd Khan"
          required
          minLength={3}
        />
      </div>
      <div>
        <label className="label" htmlFor="m-desc">
          Details
        </label>
        <textarea
          id="m-desc"
          name="description"
          className="input min-h-20"
          placeholder="What's the plan? What should people bring or know?"
          maxLength={2000}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="m-place">
            Place (optional)
          </label>
          <select id="m-place" name="placeId" className="input" defaultValue="">
            <option value="">— pick from directory —</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="m-loc">
            …or type a location
          </label>
          <input
            id="m-loc"
            name="location"
            className="input"
            placeholder="e.g. Zaisan hill parking lot"
          />
        </div>
        <div>
          <label className="label" htmlFor="m-dt">
            When
          </label>
          <input
            id="m-dt"
            name="dateTime"
            type="datetime-local"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="m-cap">
            Max people (incl. you)
          </label>
          <input
            id="m-cap"
            name="capacity"
            type="number"
            min={2}
            max={100}
            defaultValue={4}
            className="input"
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Posting…" : "Post meetup"}
      </button>
    </form>
  );
}
