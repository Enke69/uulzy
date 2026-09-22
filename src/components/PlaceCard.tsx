import Link from "next/link";
import { Stars } from "@/components/Stars";
import { PriceBadge } from "@/components/PriceBadge";
import { averageRating, categoryEmoji, categoryLabel } from "@/lib/utils";

type Props = {
  place: {
    slug: string;
    name: string;
    category: string;
    district: string;
    description: string;
    priceMin: number;
    priceMax: number;
    reviews: { rating: number }[];
  };
};

export function PlaceCard({ place }: Props) {
  const avg = averageRating(place.reviews);
  return (
    <Link
      href={`/places/${place.slug}`}
      className="card p-5 flex flex-col gap-2 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-lg leading-snug">{place.name}</h3>
        <span className="text-2xl" aria-hidden>
          {categoryEmoji(place.category)}
        </span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        {categoryLabel(place.category)} · {place.district}
      </p>
      {place.description && (
        <p className="text-sm text-ink-soft line-clamp-2">{place.description}</p>
      )}
      <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-2">
        <PriceBadge min={place.priceMin} max={place.priceMax} />
        <Stars rating={avg} count={place.reviews.length || undefined} />
      </div>
    </Link>
  );
}
