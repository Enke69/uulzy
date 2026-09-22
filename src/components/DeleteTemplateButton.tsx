"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    const res = await fetch(`/api/templates/${templateId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/templates");
      router.refresh();
    }
  }

  if (!confirming) {
    return (
      <button className="btn btn-danger" onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }
  return (
    <span className="inline-flex gap-2">
      <button className="btn btn-danger" onClick={remove}>
        Really delete?
      </button>
      <button className="btn btn-ghost" onClick={() => setConfirming(false)}>
        Keep it
      </button>
    </span>
  );
}
