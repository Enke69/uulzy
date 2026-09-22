"use client";

import { useRef, useState } from "react";

export type UploadedMedia = { url: string; kind: "IMAGE" | "VIDEO" };

/**
 * Uploads a file immediately and hands the caller back the stored URL, so the
 * parent form only ever submits a path string.
 */
export function MediaUploadField({
  value,
  onChange,
  accept = "image/*",
  label = "Photo",
}: {
  value: UploadedMedia | null;
  onChange: (media: UploadedMedia | null) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Upload failed.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const data = await res.json();
    onChange({ url: data.url, kind: data.kind });
  }

  function clear() {
    onChange(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <span className="label">{label}</span>
      {value ? (
        <div className="flex items-start gap-3">
          {value.kind === "IMAGE" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.url}
              alt="Upload preview"
              className="w-24 h-24 object-cover rounded-xl border border-black/10"
            />
          ) : (
            <video
              src={value.url}
              className="w-24 h-24 object-cover rounded-xl border border-black/10"
              muted
            />
          )}
          <button type="button" className="btn btn-ghost" onClick={clear}>
            Remove
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={pick}
          disabled={busy}
          className="input file:mr-3 file:rounded-full file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary"
        />
      )}
      {busy && <p className="text-sm text-ink-soft mt-1">Uploading…</p>}
      {error && <p className="text-sm text-danger mt-1">{error}</p>}
    </div>
  );
}
