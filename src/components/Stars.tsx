export function Stars({ rating, count }: { rating: number | null; count?: number }) {
  if (rating === null) {
    return <span className="text-sm text-ink-soft">No ratings yet</span>;
  }
  const full = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-1 text-sm"
      aria-label={`Rated ${rating} out of 5`}
    >
      <span className="text-warning" aria-hidden>
        {"★".repeat(full)}
        <span className="opacity-25">{"★".repeat(5 - full)}</span>
      </span>
      <span className="font-semibold">{rating}</span>
      {count !== undefined && (
        <span className="text-ink-soft">({count})</span>
      )}
    </span>
  );
}
