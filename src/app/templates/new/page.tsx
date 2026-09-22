import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { TemplateBuilder } from "@/components/TemplateBuilder";

export default async function NewTemplatePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const places = await db.place.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true, priceMin: true, priceMax: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="pt-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-1">Build a plan</h1>
      <p className="text-ink-soft mb-6">
        Add activities with times and price ranges — totals update live. Link
        places from the directory to auto-fill prices.
      </p>
      <TemplateBuilder places={places} />
    </div>
  );
}
