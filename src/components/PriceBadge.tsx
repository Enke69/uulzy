import { formatRange, priceTier } from "@/lib/utils";

export function PriceBadge({ min, max }: { min: number; max: number }) {
  const tier = priceTier(min, max);
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span
        className="font-bold text-success"
        aria-label={`Price tier ${tier} of 4`}
      >
        {"₮".repeat(tier)}
        <span className="opacity-25">{"₮".repeat(4 - tier)}</span>
      </span>
      <span className="text-ink-soft">{formatRange(min, max)}</span>
    </span>
  );
}
