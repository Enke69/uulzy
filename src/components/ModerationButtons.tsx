"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ModerationButtons({
  kind,
  id,
}: {
  kind: "places" | "price-items";
  id: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function decide(status: "APPROVED" | "REJECTED") {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/${kind}/${id}`, {
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
        className="btn btn-primary"
        disabled={busy}
        onClick={() => decide("APPROVED")}
      >
        Approve
      </button>
      <button
        className="btn btn-danger"
        disabled={busy}
        onClick={() => decide("REJECTED")}
      >
        Reject
      </button>
    </span>
  );
}
