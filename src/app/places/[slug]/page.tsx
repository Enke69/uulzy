import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Stars } from "@/components/Stars";
import { PriceBadge } from "@/components/PriceBadge";
import { PriceItemForm } from "@/components/PriceItemForm";
import { ReviewForm } from "@/components/ReviewForm";
import { ActivityMediaGallery } from "@/components/ActivityMedia";
import { RouteMapDynamic } from "@/components/map/DynamicMaps";
import {
  averageRating,
  categoryEmoji,
  categoryLabel,
  formatMNT,
} from "@/lib/utils";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getSessionUser();
  const place = await db.place.findUnique({
    where: { slug },
    include: {
      priceItems: {
        where: { status: "APPROVED" },
        orderBy: { price: "asc" },
      },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      activityMedia: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!place || place.status !== "APPROVED") notFound();

  const avg = averageRating(place.reviews);
  const myReview = user
    ? place.reviews.find((r) => r.userId === user.id)
    : undefined;

  return (
    <div className="pt-8 max-w-3xl mx-auto">
      <div className="card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
          {categoryEmoji(place.category)} {categoryLabel(place.category)} ·{" "}
          {place.district}
        </p>
        <h1 className="text-3xl font-extrabold">{place.name}</h1>
        <p className="text-ink-soft mt-1">📍 {place.address}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <PriceBadge min={place.priceMin} max={place.priceMax} />
          <Stars rating={avg} count={place.reviews.length || undefined} />
        </div>
        {place.description && (
          <p className="mt-4 text-ink-soft">{place.description}</p>
        )}
      </div>

      {place.lat !== null && place.lng !== null && (
        <section className="mt-6">
          <RouteMapDynamic
            stops={[
              {
                order: 0,
                activity: place.name,
                placeName: place.address,
                lat: place.lat,
                lng: place.lng,
                category: place.category,
                startTime: "",
                endTime: "",
                priceMin: place.priceMin,
                priceMax: place.priceMax,
              },
            ]}
          />
        </section>
      )}

      {/* Menu / prices */}
      <section className="mt-8">
        <h2 className="text-xl font-extrabold mb-3">Menu & prices</h2>
        {place.priceItems.length === 0 ? (
          <p className="text-ink-soft text-sm mb-3">
            No prices recorded yet — be the first to add one!
          </p>
        ) : (
          <div className="card divide-y divide-black/5 mb-3">
            {place.priceItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      loading="lazy"
                      className="w-12 h-12 rounded-lg object-cover border border-black/10 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="font-medium">{item.name}</span>
                    {item.note && (
                      <span className="text-xs text-ink-soft ml-2">{item.note}</span>
                    )}
                  </div>
                </div>
                <span className="font-bold text-success shrink-0">
                  {formatMNT(item.price)}
                </span>
              </div>
            ))}
          </div>
        )}
        {user ? (
          <PriceItemForm placeId={place.id} />
        ) : (
          <p className="text-sm text-ink-soft">
            <a href="/login" className="text-primary font-semibold">
              Log in
            </a>{" "}
            to submit prices (admin-reviewed before publishing).
          </p>
        )}
      </section>

      {/* Activity media */}
      <section className="mt-8">
        <h2 className="text-xl font-extrabold mb-3">
          Moments here ({place.activityMedia.length})
        </h2>
        <ActivityMediaGallery
          placeId={place.id}
          placeName={place.name}
          media={place.activityMedia}
          currentUserId={user?.id}
          isAdmin={user?.role === "ADMIN"}
          loggedIn={!!user}
        />
      </section>

      {/* Reviews */}
      <section className="mt-8">
        <h2 className="text-xl font-extrabold mb-3">
          Reviews ({place.reviews.length})
        </h2>
        {user ? (
          <ReviewForm
            placeId={place.id}
            initialRating={myReview?.rating}
            initialComment={myReview?.comment}
          />
        ) : (
          <p className="text-sm text-ink-soft mb-3">
            <a href="/login" className="text-primary font-semibold">
              Log in
            </a>{" "}
            to leave a review.
          </p>
        )}
        <div className="flex flex-col gap-3 mt-4">
          {place.reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{r.user.name}</span>
                <Stars rating={r.rating} />
              </div>
              {r.comment && (
                <p className="text-sm text-ink-soft mt-1.5">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
