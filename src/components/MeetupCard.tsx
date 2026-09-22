import Link from "next/link";

type Props = {
  meetup: {
    id: string;
    title: string;
    description: string;
    dateTime: Date;
    capacity: number;
    status: string;
    location: string;
    host: { name: string };
    place: { name: string } | null;
    joins: { status: string }[];
  };
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-primary-soft text-primary",
  FULL: "bg-secondary-soft text-warning",
  CLOSED: "bg-black/5 text-ink-soft",
};

export function MeetupCard({ meetup }: Props) {
  const accepted = meetup.joins.filter((j) => j.status === "ACCEPTED").length;
  const where = meetup.place?.name ?? meetup.location ?? "TBD";
  return (
    <Link
      href={`/meetups/${meetup.id}`}
      className="card p-5 flex flex-col gap-2 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-lg leading-snug">{meetup.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[meetup.status] ?? STATUS_STYLES.CLOSED}`}
        >
          {meetup.status}
        </span>
      </div>
      <p className="text-sm text-ink-soft">
        📍 {where} · 🗓{" "}
        {meetup.dateTime.toLocaleString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      {meetup.description && (
        <p className="text-sm text-ink-soft line-clamp-2">{meetup.description}</p>
      )}
      <p className="text-sm mt-auto pt-1">
        Host <span className="font-semibold">{meetup.host.name}</span> ·{" "}
        <span className="font-semibold text-primary">
          {accepted + 1}/{meetup.capacity}
        </span>{" "}
        going
      </p>
    </Link>
  );
}
