import Link from "next/link";
import { db } from "@/lib/db";
import { TemplateCard } from "@/components/TemplateCard";
import { MeetupCard } from "@/components/MeetupCard";
import { CityMapDynamic } from "@/components/map/DynamicMaps";
import type { MapPlace } from "@/components/map/CityMap";
import { averageRating, voteScore } from "@/lib/utils";

export default async function HomePage() {
  const [places, templates, meetups] = await Promise.all([
    db.place.findMany({
      where: { status: "APPROVED", lat: { not: null }, lng: { not: null } },
      include: { reviews: { select: { rating: true } } },
    }),
    db.template.findMany({
      where: { isPublic: true },
      include: {
        author: { select: { name: true } },
        items: true,
        votes: true,
        comments: { select: { id: true } },
      },
    }),
    db.meetup.findMany({
      where: { status: "OPEN", dateTime: { gte: new Date() } },
      include: {
        host: { select: { name: true } },
        place: { select: { name: true } },
        joins: { select: { status: true } },
      },
      orderBy: { dateTime: "asc" },
      take: 3,
    }),
  ]);

  const mapPlaces: MapPlace[] = places.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    district: p.district,
    lat: p.lat!,
    lng: p.lng!,
    priceMin: p.priceMin,
    priceMax: p.priceMax,
    avgRating: averageRating(p.reviews),
    reviewCount: p.reviews.length,
  }));

  const topTemplates = [...templates]
    .sort((a, b) => voteScore(b.votes) - voteScore(a.votes))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-12 pt-8">
      {/* Hero + map */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h1 className="font-display text-4xl sm:text-5xl text-primary">Uulzy</h1>
          <p className="mt-3 text-lg font-semibold">
            What are you in the mood for?
          </p>
          <p className="mt-1 text-ink-soft">
            Pick a vibe and see it on the map — every place with real community
            prices in ₮.
          </p>
          <form action="/places" className="mt-5 flex gap-2 max-w-md mx-auto">
            <input
              name="q"
              className="input"
              placeholder="Or search by name… e.g. hot pot"
              aria-label="Search places"
            />
            <button className="btn btn-primary shrink-0">Search</button>
          </form>
        </div>
        <CityMapDynamic places={mapPlaces} />
        <p className="text-center text-sm text-ink-soft mt-3">
          Prefer a list?{" "}
          <Link href="/places" className="text-primary font-semibold">
            Browse all places
          </Link>
        </p>
      </section>

      {/* Top plans */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold">🏆 Top date plans</h2>
          <Link href="/templates" className="btn btn-secondary">
            Leaderboard
          </Link>
        </div>
        <div className="grid gap-4">
          {topTemplates.map((t, i) => (
            <TemplateCard key={t.id} template={t} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* Meetups */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold">👋 Looking for company</h2>
          <Link href="/meetups" className="btn btn-secondary">
            All meetups
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetups.map((m) => (
            <MeetupCard key={m.id} meetup={m} />
          ))}
          {meetups.length === 0 && (
            <p className="text-ink-soft">
              No open meetups —{" "}
              <Link href="/meetups/new" className="text-primary font-semibold">
                start one
              </Link>
              !
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
