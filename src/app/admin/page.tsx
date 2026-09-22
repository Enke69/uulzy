import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ModerationButtons } from "@/components/ModerationButtons";
import { categoryLabel, formatMNT, formatRange } from "@/lib/utils";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const [pendingPlaces, pendingItems] = await Promise.all([
    db.place.findMany({
      where: { status: "PENDING" },
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.priceItem.findMany({
      where: { status: "PENDING" },
      include: {
        place: { select: { name: true } },
        submittedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="pt-8 max-w-3xl mx-auto flex flex-col gap-10">
      <h1 className="text-3xl font-extrabold">Admin — approval queue</h1>

      <section>
        <h2 className="text-xl font-extrabold mb-3">
          Suggested places ({pendingPlaces.length})
        </h2>
        <div className="flex flex-col gap-3">
          {pendingPlaces.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-sm text-ink-soft">
                    {categoryLabel(p.category)} · {p.district} · {p.address}
                  </p>
                  <p className="text-sm text-success font-semibold mt-1">
                    {formatRange(p.priceMin, p.priceMax)} / person
                  </p>
                  {p.description && (
                    <p className="text-sm text-ink-soft mt-1">{p.description}</p>
                  )}
                  <p className="text-xs text-ink-soft mt-2">
                    Suggested by {p.createdBy?.name ?? "unknown"}
                  </p>
                </div>
                <ModerationButtons kind="places" id={p.id} />
              </div>
            </div>
          ))}
          {pendingPlaces.length === 0 && (
            <p className="text-sm text-ink-soft">Queue is empty 🎉</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-extrabold mb-3">
          Submitted prices ({pendingItems.length})
        </h2>
        <div className="flex flex-col gap-3">
          {pendingItems.map((item) => (
            <div key={item.id} className="card p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">
                  {item.name} — {formatMNT(item.price)}
                </p>
                <p className="text-sm text-ink-soft">
                  at {item.place.name}
                  {item.note && ` · ${item.note}`} · by {item.submittedBy.name}
                </p>
              </div>
              <ModerationButtons kind="price-items" id={item.id} />
            </div>
          ))}
          {pendingItems.length === 0 && (
            <p className="text-sm text-ink-soft">Queue is empty 🎉</p>
          )}
        </div>
      </section>
    </div>
  );
}
