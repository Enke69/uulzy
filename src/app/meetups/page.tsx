import Link from "next/link";
import { db } from "@/lib/db";
import { MeetupCard } from "@/components/MeetupCard";

export default async function MeetupsPage() {
  const meetups = await db.meetup.findMany({
    where: { dateTime: { gte: new Date() } },
    include: {
      host: { select: { name: true } },
      place: { select: { name: true } },
      joins: { select: { status: true } },
    },
    orderBy: { dateTime: "asc" },
  });
  return (
    <div className="pt-8 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-3xl font-extrabold">Meetups</h1>
        <Link href="/meetups/new" className="btn btn-primary">
          + Post a meetup
        </Link>
      </div>
      <p className="text-ink-soft mb-6">
        Doing something fun and want company? Post it — people ask to join, you
        pick who comes.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {meetups.map((m) => (
          <MeetupCard key={m.id} meetup={m} />
        ))}
        {meetups.length === 0 && (
          <p className="text-ink-soft col-span-full text-center py-12">
            No upcoming meetups — start one!
          </p>
        )}
      </div>
    </div>
  );
}
