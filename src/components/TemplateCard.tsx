import Link from "next/link";
import {
  computeTotals,
  formatDuration,
  formatRange,
  voteScore,
} from "@/lib/utils";

type Props = {
  template: {
    id: string;
    title: string;
    description: string;
    author: { name: string };
    items: {
      startTime: string;
      endTime: string;
      priceMin: number;
      priceMax: number;
      activity: string;
    }[];
    votes: { value: number }[];
    comments?: { id: string }[];
  };
  rank?: number;
};

export function TemplateCard({ template, rank }: Props) {
  const totals = computeTotals(template.items);
  const score = voteScore(template.votes);
  return (
    <Link
      href={`/templates/${template.id}`}
      className="card p-5 flex gap-4 hover:border-primary/40 transition-colors"
    >
      {rank !== undefined && (
        <div
          className={`shrink-0 w-10 h-10 rounded-full grid place-items-center font-bold ${
            rank <= 3 ? "bg-secondary-soft text-warning" : "bg-primary-soft text-primary"
          }`}
        >
          {rank}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg leading-snug">{template.title}</h3>
        <p className="text-sm text-ink-soft">
          by {template.author.name} · {template.items.length} activities
        </p>
        {template.description && (
          <p className="text-sm text-ink-soft mt-1 line-clamp-2">
            {template.description}
          </p>
        )}
        <p className="text-sm mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-semibold text-success">
            {formatRange(totals.totalMin, totals.totalMax)}
          </span>
          <span className="text-ink-soft">⏱ {formatDuration(totals.totalMinutes)}</span>
          {template.comments && (
            <span className="text-ink-soft">💬 {template.comments.length}</span>
          )}
        </p>
      </div>
      <div className="shrink-0 self-center text-center">
        <p className="text-2xl font-extrabold text-primary">
          {score > 0 ? `+${score}` : score}
        </p>
        <p className="text-xs text-ink-soft">votes</p>
      </div>
    </Link>
  );
}
