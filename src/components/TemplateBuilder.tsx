"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  computeTotals,
  formatDuration,
  formatRange,
  itemDurationMin,
} from "@/lib/utils";

export type PlaceOption = {
  id: string;
  name: string;
  priceMin: number;
  priceMax: number;
};

type ItemDraft = {
  activity: string;
  placeId: string; // "" = none
  startTime: string;
  endTime: string;
  priceMin: number;
  priceMax: number;
};

type Props = {
  places: PlaceOption[];
  templateId?: string; // set = edit mode
  initial?: {
    title: string;
    description: string;
    isPublic: boolean;
    items: ItemDraft[];
  };
};

const emptyItem = (startTime = "18:00", endTime = "19:00"): ItemDraft => ({
  activity: "",
  placeId: "",
  startTime,
  endTime,
  priceMin: 0,
  priceMax: 0,
});

export function TemplateBuilder({ places, templateId, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);
  const [items, setItems] = useState<ItemDraft[]>(
    initial?.items?.length ? initial.items : [emptyItem()]
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => computeTotals(items), [items]);

  function update(index: number, patch: Partial<ItemDraft>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function pickPlace(index: number, placeId: string) {
    const place = places.find((p) => p.id === placeId);
    update(index, {
      placeId,
      ...(place
        ? {
            priceMin: place.priceMin,
            priceMax: place.priceMax,
            ...(items[index].activity ? {} : { activity: place.name }),
          }
        : {}),
    });
  }

  function addItem() {
    const last = items[items.length - 1];
    setItems((prev) => [...prev, emptyItem(last?.endTime ?? "18:00", last?.endTime ?? "19:00")]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  async function submit() {
    setError("");
    setBusy(true);
    const payload = {
      title,
      description,
      isPublic,
      items: items.map((item) => ({
        activity: item.activity,
        placeId: item.placeId || null,
        startTime: item.startTime,
        endTime: item.endTime,
        priceMin: Number(item.priceMin) || 0,
        priceMax: Number(item.priceMax) || 0,
      })),
    };
    const res = await fetch(
      templateId ? `/api/templates/${templateId}` : "/api/templates",
      {
        method: templateId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save.");
      return;
    }
    const data = await res.json();
    router.push(`/templates/${data.template.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-5 flex flex-col gap-4">
        <div>
          <label className="label" htmlFor="t-title">
            Plan title
          </label>
          <input
            id="t-title"
            className="input"
            placeholder="e.g. Rainy Day Date Downtown"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </div>
        <div>
          <label className="label" htmlFor="t-desc">
            Description
          </label>
          <textarea
            id="t-desc"
            className="input min-h-16"
            placeholder="Who is this plan for? Any tips?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 accent-[#7c61d4]"
          />
          Public — others can see, vote and comment
        </label>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-primary">Activity {i + 1}</span>
              <span className="flex gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  className="btn btn-ghost !px-2.5 !py-1"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  className="btn btn-ghost !px-2.5 !py-1"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Remove activity"
                  className="btn btn-danger !px-2.5 !py-1"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                >
                  ✕
                </button>
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">What</label>
                <input
                  className="input"
                  placeholder="e.g. Dinner, Karaoke, Walk"
                  value={item.activity}
                  onChange={(e) => update(i, { activity: e.target.value })}
                  maxLength={150}
                />
              </div>
              <div>
                <label className="label">Place (optional)</label>
                <select
                  className="input"
                  value={item.placeId}
                  onChange={(e) => pickPlace(i, e.target.value)}
                >
                  <option value="">— no linked place —</option>
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start</label>
                  <input
                    type="time"
                    className="input"
                    value={item.startTime}
                    onChange={(e) => update(i, { startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">End</label>
                  <input
                    type="time"
                    className="input"
                    value={item.endTime}
                    onChange={(e) => update(i, { endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">₮ from</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    className="input"
                    value={item.priceMin}
                    onChange={(e) =>
                      update(i, { priceMin: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="label">₮ to</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    className="input"
                    value={item.priceMax}
                    onChange={(e) =>
                      update(i, { priceMax: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-ink-soft mt-2">
              ⏱ {formatDuration(itemDurationMin(item))} ·{" "}
              {formatRange(item.priceMin || 0, item.priceMax || 0)}
            </p>
          </div>
        ))}
        <button type="button" className="btn btn-secondary self-start" onClick={addItem}>
          + Add activity
        </button>
      </div>

      {/* Totals + save */}
      <div className="card p-5 sticky bottom-4 flex flex-wrap items-center justify-between gap-3 border-primary/30">
        <div className="text-sm">
          <p className="font-extrabold text-lg text-success">
            {formatRange(totals.totalMin, totals.totalMax)}{" "}
            <span className="text-ink-soft font-medium text-sm">/ person</span>
          </p>
          <p className="text-ink-soft">
            ⏱ {formatDuration(totals.totalMinutes)} · {items.length}{" "}
            {items.length === 1 ? "activity" : "activities"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={busy || title.trim().length < 3 || items.some((i) => !i.activity.trim())}
          >
            {busy ? "Saving…" : templateId ? "Save changes" : "Create plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
