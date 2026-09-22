"use client";

import { useState } from "react";
import { MediaUploadField, type UploadedMedia } from "@/components/MediaUploadField";

export function PriceItemForm({ placeId }: { placeId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [photo, setPhoto] = useState<UploadedMedia | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/places/${placeId}/price-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name")),
        price: Number(form.get("price")),
        note: String(form.get("note") ?? ""),
        photoUrl: photo?.url ?? "",
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to submit.");
      return;
    }
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return (
      <p className="text-sm text-success font-medium">
        ✓ Thanks! Your price is waiting for admin approval.
      </p>
    );
  }
  if (!open) {
    return (
      <button className="btn btn-secondary" onClick={() => setOpen(true)}>
        + Add a menu item / price
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="card p-4 flex flex-col gap-3 max-w-md">
      <div>
        <label className="label" htmlFor="pi-name">
          Item
        </label>
        <input
          id="pi-name"
          name="name"
          className="input"
          placeholder="e.g. Buuz (8 pcs), Room 1hr weekday"
          required
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="label" htmlFor="pi-price">
            Price (₮)
          </label>
          <input
            id="pi-price"
            name="price"
            type="number"
            min={0}
            step={100}
            className="input"
            required
          />
        </div>
        <div className="flex-1">
          <label className="label" htmlFor="pi-note">
            Note (optional)
          </label>
          <input id="pi-note" name="note" className="input" placeholder="per room" />
        </div>
      </div>
      <MediaUploadField
        value={photo}
        onChange={setPhoto}
        accept="image/*"
        label="Photo of the item or menu (optional)"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button className="btn btn-primary">Submit for review</button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
