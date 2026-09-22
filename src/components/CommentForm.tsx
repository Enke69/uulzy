"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CommentForm({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError("");
    const res = await fetch(`/api/templates/${templateId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to post comment.");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-start">
      <textarea
        className="input min-h-11"
        placeholder="Share a tip or your experience…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        aria-label="Comment"
      />
      <button className="btn btn-primary shrink-0">Post</button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </form>
  );
}
