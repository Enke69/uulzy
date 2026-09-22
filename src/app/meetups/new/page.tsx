import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { MeetupForm } from "@/components/MeetupForm";

export default async function NewMeetupPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const places = await db.place.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="pt-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-1">Post a meetup</h1>
      <p className="text-ink-soft mb-6">
        Say what you&apos;re doing, when, and how many people can come.
      </p>
      <MeetupForm places={places} />
    </div>
  );
}
