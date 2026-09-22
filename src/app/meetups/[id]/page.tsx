import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { JoinMeetupButton } from "@/components/JoinMeetupButton";
import { JoinDecisionButtons } from "@/components/JoinDecisionButtons";

export default async function MeetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  const meetup = await db.meetup.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, name: true } },
      place: { select: { name: true, slug: true } },
      joins: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!meetup) notFound();

  const isHost = user?.id === meetup.host.id;
  const accepted = meetup.joins.filter((j) => j.status === "ACCEPTED");
  const myJoin = user
    ? meetup.joins.find((j) => j.userId === user.id)
    : undefined;
  const isFull = accepted.length + 1 >= meetup.capacity;

  return (
    <div className="pt-8 max-w-2xl mx-auto">
      <div className="card p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold">{meetup.title}</h1>
        <p className="text-ink-soft mt-2">
          🗓{" "}
          {meetup.dateTime.toLocaleString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-ink-soft mt-1">
          📍{" "}
          {meetup.place ? (
            <Link
              href={`/places/${meetup.place.slug}`}
              className="text-primary font-semibold"
            >
              {meetup.place.name}
            </Link>
          ) : (
            meetup.location || "Location TBD"
          )}
        </p>
        <p className="mt-1 text-ink-soft">
          Host <span className="font-semibold text-ink">{meetup.host.name}</span>{" "}
          · <span className="font-semibold text-primary">{accepted.length + 1}/{meetup.capacity}</span> going
          {isFull && " · FULL"}
        </p>
        {meetup.description && (
          <p className="mt-4 whitespace-pre-line">{meetup.description}</p>
        )}

        {!isHost && meetup.status === "OPEN" && !isFull && (
          <div className="mt-5">
            {user ? (
              myJoin ? (
                <p className="text-sm font-semibold">
                  {myJoin.status === "PENDING" && "⏳ Your request is pending."}
                  {myJoin.status === "ACCEPTED" && "✅ You're in! See you there."}
                  {myJoin.status === "DECLINED" && "❌ The host declined this time."}
                </p>
              ) : (
                <JoinMeetupButton meetupId={meetup.id} />
              )
            ) : (
              <Link href="/login" className="btn btn-primary">
                Log in to ask to join
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Participants / requests */}
      <section className="mt-8">
        <h2 className="text-xl font-extrabold mb-3">
          {isHost ? "Join requests" : "Who's coming"}
        </h2>
        <div className="flex flex-col gap-3">
          <div className="card p-4 flex items-center justify-between">
            <span className="font-semibold">{meetup.host.name}</span>
            <span className="text-xs font-bold rounded-full bg-primary-soft text-primary px-2.5 py-1">
              HOST
            </span>
          </div>
          {(isHost ? meetup.joins : accepted).map((join) => (
            <div key={join.id} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{join.user.name}</span>
                {isHost && join.status === "PENDING" ? (
                  <JoinDecisionButtons meetupId={meetup.id} joinId={join.id} />
                ) : (
                  <span
                    className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                      join.status === "ACCEPTED"
                        ? "bg-primary-soft text-success"
                        : join.status === "PENDING"
                          ? "bg-secondary-soft text-warning"
                          : "bg-black/5 text-ink-soft"
                    }`}
                  >
                    {join.status}
                  </span>
                )}
              </div>
              {isHost && join.message && (
                <p className="text-sm text-ink-soft mt-1.5">“{join.message}”</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
