"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUploadField, type UploadedMedia } from "@/components/MediaUploadField";

export type MediaPost = {
  id: string;
  url: string;
  kind: string;
  caption: string;
  userId: string;
  user: { name: string };
};

export function ActivityMediaGallery({
  placeId,
  placeName,
  media,
  currentUserId,
  isAdmin,
  loggedIn,
}: {
  placeId: string;
  placeName: string;
  media: MediaPost[];
  currentUserId?: string;
  isAdmin: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [upload, setUpload] = useState<UploadedMedia | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!upload) {
      setError("Choose a photo or video first.");
      return;
    }
    setError("");
    setBusy(true);
    const res = await fetch(`/api/places/${placeId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: upload.url, kind: upload.kind, caption }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to post.");
      return;
    }
    setUpload(null);
    setCaption("");
    setOpen(false);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {media.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No moments yet — be the first to share what you did at {placeName}.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {media.map((m) => (
            <figure key={m.id} className="card overflow-hidden group relative">
              {m.kind === "VIDEO" ? (
                <video
                  src={m.url}
                  controls
                  playsInline
                  className="w-full aspect-square object-cover bg-black"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt={m.caption || `Activity at ${placeName}`}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
              )}
              <figcaption className="p-2.5 text-xs">
                {m.caption && <p className="mb-1">{m.caption}</p>}
                <p className="text-ink-soft">by {m.user.name}</p>
              </figcaption>
              {(isAdmin || m.userId === currentUserId) && (
                <button
                  onClick={() => remove(m.id)}
                  aria-label="Delete this post"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-danger font-bold opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              )}
            </figure>
          ))}
        </div>
      )}

      {loggedIn ? (
        open ? (
          <form onSubmit={post} className="card p-4 flex flex-col gap-3 max-w-md">
            <MediaUploadField
              value={upload}
              onChange={setUpload}
              accept="image/*,video/*"
              label="Your photo or video"
            />
            <div>
              <label className="label" htmlFor="am-caption">
                Caption (optional)
              </label>
              <input
                id="am-caption"
                className="input"
                placeholder="e.g. Finally won a round of billiards 🎱"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={300}
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2">
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Posting…" : "Share it"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="btn btn-secondary self-start" onClick={() => setOpen(true)}>
            📸 Share a moment here
          </button>
        )
      ) : (
        <p className="text-sm text-ink-soft">
          <a href="/login" className="text-primary font-semibold">
            Log in
          </a>{" "}
          to share your own photos and videos.
        </p>
      )}
    </div>
  );
}
