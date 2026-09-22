"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinMeetupButton({ meetupId }: { meetupId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch(`/api/meetups/${meetupId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to send request.");
      return;
    }
    router.refresh();
  }

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        🙋 Ask to join
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 max-w-md">
      <textarea
        className="input min-h-16"
        placeholder="Say hi to the host (optional)…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={500}
        aria-label="Message to the host"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Sending…" : "Send request"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
