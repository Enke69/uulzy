import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { VoteButtons } from "@/components/VoteButtons";
import { CommentForm } from "@/components/CommentForm";
import { DeleteTemplateButton } from "@/components/DeleteTemplateButton";
import { RouteMapDynamic } from "@/components/map/DynamicMaps";
import type { RouteStop } from "@/components/map/RouteMap";
import {
  computeTotals,
  formatDuration,
  formatRange,
  voteScore,
} from "@/lib/utils";

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  const template = await db.template.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      items: {
        include: {
          place: { select: { name: true, slug: true, lat: true, lng: true } },
        },
        orderBy: { order: "asc" },
      },
      votes: true,
      comments: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!template) notFound();
  const isOwner = user?.id === template.author.id || user?.role === "ADMIN";
  if (!template.isPublic && !isOwner) notFound();

  const totals = computeTotals(template.items);
  const score = voteScore(template.votes);
  // Only stops with a mapped place can appear on the route.
  const routeStops: RouteStop[] = template.items
    .filter((item) => item.place?.lat != null && item.place?.lng != null)
    .map((item, i) => ({
      order: i,
      activity: item.activity,
      placeName: item.place!.name,
      lat: item.place!.lat!,
      lng: item.place!.lng!,
      startTime: item.startTime,
      endTime: item.endTime,
      priceMin: item.priceMin,
      priceMax: item.priceMax,
    }));
  const myVote = user
    ? template.votes.find((v) => v.userId === user.id)?.value ?? 0
    : 0;

  return (
    <div className="pt-8 max-w-3xl mx-auto">
      <div className="card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            {!template.isPublic && (
              <span className="inline-block rounded-full bg-black/5 text-ink-soft text-xs font-bold px-2.5 py-1 mb-2">
                🔒 Private
              </span>
            )}
            <h1 className="text-3xl font-extrabold">{template.title}</h1>
            <p className="text-ink-soft mt-1">by {template.author.name}</p>
          </div>
          {template.isPublic && (
            <VoteButtons
              templateId={template.id}
              initialScore={score}
              initialMyVote={myVote}
              loggedIn={!!user}
            />
          )}
        </div>
        {template.description && (
          <p className="mt-3 text-ink-soft">{template.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <span className="text-success">
            💸 {formatRange(totals.totalMin, totals.totalMax)} / person
          </span>
          <span>⏱ {formatDuration(totals.totalMinutes)} total</span>
          <span>📋 {template.items.length} activities</span>
        </div>
        {isOwner && (
          <div className="mt-4 flex gap-2">
            <Link
              href={`/templates/${template.id}/edit`}
              className="btn btn-secondary"
            >
              Edit
            </Link>
            <DeleteTemplateButton templateId={template.id} />
          </div>
        )}
      </div>

      {/* Route map */}
      {routeStops.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-extrabold mb-4">The route</h2>
          <RouteMapDynamic stops={routeStops} />
          {routeStops.length < template.items.length && (
            <p className="text-sm text-ink-soft mt-2">
              {template.items.length - routeStops.length} activity without a
              mapped place {routeStops.length === 1 ? "is" : "are"} not shown on
              the map.
            </p>
          )}
        </section>
      )}

      {/* Timeline */}
      <section className="mt-8">
        <h2 className="text-xl font-extrabold mb-4">The plan</h2>
        <ol className="relative border-l-2 border-primary-soft ml-3 flex flex-col gap-5">
          {template.items.map((item, i) => (
            <li key={item.id} className="ml-6 relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-primary-soft" />
              <div className="card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-bold">
                    {i + 1}. {item.activity}
                  </h3>
                  <span className="text-sm text-ink-soft">
                    {item.startTime}–{item.endTime}
                  </span>
                </div>
                <p className="text-sm mt-1 flex flex-wrap gap-x-4">
                  {item.place && (
                    <Link
                      href={`/places/${item.place.slug}`}
                      className="text-primary font-semibold"
                    >
                      📍 {item.place.name}
                    </Link>
                  )}
                  <span className="text-success font-semibold">
                    {formatRange(item.priceMin, item.priceMax)}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Comments */}
      <section className="mt-8">
        <h2 className="text-xl font-extrabold mb-3">
          Comments ({template.comments.length})
        </h2>
        {user ? (
          <CommentForm templateId={template.id} />
        ) : (
          <p className="text-sm text-ink-soft mb-3">
            <Link href="/login" className="text-primary font-semibold">
              Log in
            </Link>{" "}
            to comment.
          </p>
        )}
        <div className="flex flex-col gap-3 mt-4">
          {template.comments.map((c) => (
            <div key={c.id} className="card p-4">
              <p className="font-semibold text-sm">{c.user.name}</p>
              <p className="text-sm text-ink-soft mt-1">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
