import Link from "next/link";
import { db } from "@/lib/db";
import { PlaceCard } from "@/components/PlaceCard";
import { CATEGORIES, DISTRICTS } from "@/lib/utils";

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; district?: string; q?: string }>;
}) {
  const { category, district, q } = await searchParams;
  const places = await db.place.findMany({
    where: {
      status: "APPROVED",
      ...(category ? { category } : {}),
      ...(district ? { district } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { reviews: { select: { rating: true } } },
    orderBy: { name: "asc" },
  });

  const linkFor = (params: Record<string, string | undefined>) => {
    const merged = { category, district, q, ...params };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const s = sp.toString();
    return `/places${s ? `?${s}` : ""}`;
  };

  return (
    <div className="pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-3xl font-extrabold">Places</h1>
        <Link href="/places/new" className="btn btn-primary">
          + Suggest a place
        </Link>
      </div>

      <form action="/places" className="flex gap-2 max-w-md mb-4">
        {category && <input type="hidden" name="category" value={category} />}
        {district && <input type="hidden" name="district" value={district} />}
        <input
          name="q"
          defaultValue={q ?? ""}
          className="input"
          placeholder="Search by name…"
          aria-label="Search places"
        />
        <button className="btn btn-secondary shrink-0">Search</button>
      </form>

      <div className="flex flex-wrap gap-2 mb-3">
        <Link
          href={linkFor({ category: undefined })}
          className={`chip ${!category ? "chip-active" : ""}`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={linkFor({ category: c.value })}
            className={`chip ${category === c.value ? "chip-active" : ""}`}
          >
            <span aria-hidden>{c.emoji}</span> {c.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={linkFor({ district: undefined })}
          className={`chip ${!district ? "chip-active" : ""}`}
        >
          All districts
        </Link>
        {DISTRICTS.map((d) => (
          <Link
            key={d}
            href={linkFor({ district: d })}
            className={`chip ${district === d ? "chip-active" : ""}`}
          >
            {d}
          </Link>
        ))}
      </div>

      {places.length === 0 ? (
        <p className="text-ink-soft py-12 text-center">
          Nothing found. Try different filters, or{" "}
          <Link href="/places/new" className="text-primary font-semibold">
            suggest this place
          </Link>
          .
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((p) => (
            <PlaceCard key={p.slug} place={p} />
          ))}
        </div>
      )}
    </div>
  );
}
