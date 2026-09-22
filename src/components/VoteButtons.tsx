"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VoteButtons({
  templateId,
  initialScore,
  initialMyVote,
  loggedIn,
}: {
  templateId: string;
  initialScore: number;
  initialMyVote: number;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState(initialMyVote);
  const [busy, setBusy] = useState(false);

  async function vote(value: 1 | -1) {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    const next = myVote === value ? 0 : value;
    setBusy(true);
    const res = await fetch(`/api/templates/${templateId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: next }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setScore(data.score);
      setMyVote(next);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <button
        aria-label="Upvote"
        disabled={busy}
        onClick={() => vote(1)}
        className={`w-10 h-10 rounded-full grid place-items-center text-lg font-bold transition-colors ${
          myVote === 1
            ? "bg-primary text-white"
            : "bg-primary-soft text-primary hover:bg-primary/20"
        }`}
      >
        ▲
      </button>
      <span className="font-extrabold text-lg" aria-live="polite">
        {score > 0 ? `+${score}` : score}
      </span>
      <button
        aria-label="Downvote"
        disabled={busy}
        onClick={() => vote(-1)}
        className={`w-10 h-10 rounded-full grid place-items-center text-lg font-bold transition-colors ${
          myVote === -1
            ? "bg-danger text-white"
            : "bg-black/5 text-ink-soft hover:bg-black/10"
        }`}
      >
        ▼
      </button>
    </div>
  );
}
