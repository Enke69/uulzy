import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { TemplateCard } from "@/components/TemplateCard";
import { MeetupCard } from "@/components/MeetupCard";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-secondary-soft text-warning",
  APPROVED: "bg-primary-soft text-success",
  REJECTED: "bg-black/5 text-danger",
};

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [templates, submissions, priceItems, meetups, joins] =
    await Promise.all([
      db.template.findMany({
        where: { authorId: user.id },
        include: {
          author: { select: { name: true } },
          items: true,
          votes: true,
          comments: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.place.findMany({
        where: { createdById: user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.priceItem.findMany({
        where: { submittedById: user.id },
        include: { place: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.meetup.findMany({
        where: { hostId: user.id },
        include: {
          host: { select: { name: true } },
          place: { select: { name: true } },
          joins: { select: { status: true } },
        },
        orderBy: { dateTime: "desc" },
      }),
      db.meetupJoin.findMany({
        where: { userId: user.id },
        include: { meetup: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="pt-8 max-w-3xl mx-auto flex flex-col gap-10">
      <div className="card p-6 flex items-center gap-4">
        <span className="w-16 h-16 rounded-full bg-primary-soft text-primary grid place-items-center text-2xl font-extrabold">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">{user.name}</h1>
          <p className="text-ink-soft text-sm">{user.email}</p>
          <p className="text-sm font-semibold text-primary mt-1">
            ⭐ {user.points} contribution points
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-extrabold mb-3">My plans ({templates.length})</h2>
        <div className="grid gap-3">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
          {templates.length === 0 && (
            <p className="text-ink-soft text-sm">
              None yet —{" "}
              <Link href="/templates/new" className="text-primary font-semibold">
                build your first plan
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-extrabold mb-3">My meetups ({meetups.length})</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {meetups.map((m) => (
            <MeetupCard key={m.id} meetup={m} />
          ))}
        </div>
        {joins.length > 0 && (
          <div className="mt-3 text-sm text-ink-soft">
            Joined:{" "}
            {joins.map((j, i) => (
              <span key={j.id}>
                {i > 0 && " · "}
                <Link
                  href={`/meetups/${j.meetup.id}`}
                  className="text-primary font-semibold"
                >
                  {j.meetup.title}
                </Link>{" "}
                ({j.status.toLowerCase()})
              </span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-extrabold mb-3">My submissions</h2>
        <div className="card divide-y divide-black/5">
          {submissions.map((p) => (
            <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <span className="font-medium">🏠 {p.name}</span>
              <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${STATUS_BADGE[p.status]}`}>
                {p.status}
              </span>
            </div>
          ))}
          {priceItems.map((item) => (
            <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <span className="font-medium">
                🏷 {item.name}{" "}
                <span className="text-ink-soft font-normal">at {item.place.name}</span>
              </span>
              <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${STATUS_BADGE[item.status]}`}>
                {item.status}
              </span>
            </div>
          ))}
          {submissions.length === 0 && priceItems.length === 0 && (
            <p className="px-5 py-4 text-sm text-ink-soft">
              No submissions yet. Add prices to places you know — approved ones
              earn points!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
