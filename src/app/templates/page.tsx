import Link from "next/link";
import { db } from "@/lib/db";
import { TemplateCard } from "@/components/TemplateCard";
import { voteScore } from "@/lib/utils";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const sortMode = sort === "new" ? "new" : "top";
  const templates = await db.template.findMany({
    where: { isPublic: true },
    include: {
      author: { select: { name: true } },
      items: true,
      votes: true,
      comments: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const sorted =
    sortMode === "top"
      ? [...templates].sort((a, b) => voteScore(b.votes) - voteScore(a.votes))
      : templates;

  return (
    <div className="pt-8 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-3xl font-extrabold">Date plans</h1>
        <Link href="/templates/new" className="btn btn-primary">
          + Build a plan
        </Link>
      </div>
      <div className="flex gap-2 mb-6">
        <Link
          href="/templates?sort=top"
          className={`chip ${sortMode === "top" ? "chip-active" : ""}`}
        >
          🏆 Leaderboard
        </Link>
        <Link
          href="/templates?sort=new"
          className={`chip ${sortMode === "new" ? "chip-active" : ""}`}
        >
          🆕 Newest
        </Link>
      </div>
      <div className="grid gap-4">
        {sorted.map((t, i) => (
          <TemplateCard
            key={t.id}
            template={t}
            rank={sortMode === "top" ? i + 1 : undefined}
          />
        ))}
        {sorted.length === 0 && (
          <p className="text-ink-soft text-center py-12">
            No public plans yet — be the first!
          </p>
        )}
      </div>
    </div>
  );
}
