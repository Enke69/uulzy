"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({
  placeId,
  initialRating,
  initialComment,
}: {
  placeId: string;
  initialRating?: number;
  initialComment?: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 0);
  const [comment, setComment] = useState(initialComment ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rating < 1) {
      setError("Pick a star rating first.");
      return;
    }
    const res = await fetch(`/api/places/${placeId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save review.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card p-4 flex flex-col gap-3">
      <div
        className="flex gap-1"
        role="radiogroup"
        aria-label="Your star rating"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => {
              setRating(n);
              setSaved(false);
            }}
            className={`text-2xl transition-transform hover:scale-110 ${
              n <= rating ? "text-warning" : "text-black/15"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="input min-h-20"
        placeholder="What was it like? (optional)"
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          setSaved(false);
        }}
        maxLength={2000}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex items-center gap-3">
        <button className="btn btn-primary self-start">
          {initialRating ? "Update review" : "Post review"}
        </button>
        {saved && <span className="text-sm text-success font-medium">✓ Saved</span>}
      </div>
    </form>
  );
}
