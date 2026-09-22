import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { TemplateBuilder } from "@/components/TemplateBuilder";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const template = await db.template.findUnique({
    where: { id },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (!template) notFound();
  if (template.authorId !== user.id && user.role !== "ADMIN") notFound();

  const places = await db.place.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true, priceMin: true, priceMax: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="pt-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">Edit plan</h1>
      <TemplateBuilder
        places={places}
        templateId={template.id}
        initial={{
          title: template.title,
          description: template.description,
          isPublic: template.isPublic,
          items: template.items.map((item) => ({
            activity: item.activity,
            placeId: item.placeId ?? "",
            startTime: item.startTime,
            endTime: item.endTime,
            priceMin: item.priceMin,
            priceMax: item.priceMax,
          })),
        }}
      />
    </div>
  );
}
