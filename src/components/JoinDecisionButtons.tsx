"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinDecisionButtons({
  meetupId,
  joinId,
}: {
  meetupId: string;
  joinId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function decide(status: "ACCEPTED" | "DECLINED") {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/meetups/${meetupId}/joins/${joinId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed.");
      return;
    }
    router.refresh();
  }

  return (
    <span className="flex items-center gap-2">
      {error && <span className="text-xs text-danger">{error}</span>}
      <button
        className="btn btn-primary !px-3 !py-1.5"
        disabled={busy}
        onClick={() => decide("ACCEPTED")}
      >
        Accept
      </button>
      <button
        className="btn btn-danger !px-3 !py-1.5"
        disabled={busy}
        onClick={() => decide("DECLINED")}
      >
        Decline
      </button>
    </span>
  );
}
