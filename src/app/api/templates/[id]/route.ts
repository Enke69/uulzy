import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { templateSchema } from "@/lib/validate";
import { ok, fail, handleErrors } from "@/lib/api";

async function ownedTemplate(id: string, userId: string, role: string) {
  const template = await db.template.findUnique({ where: { id } });
  if (!template) return { error: fail("Template not found.", 404) };
  if (template.authorId !== userId && role !== "ADMIN") {
    return { error: fail("Not your template.", 403) };
  }
  return { template };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const owned = await ownedTemplate(id, user.id, user.role);
    if (owned.error) return owned.error;
    const body = templateSchema.parse(await req.json());
    const { items, ...data } = body;
    const template = await db.$transaction(async (tx) => {
      await tx.templateItem.deleteMany({ where: { templateId: id } });
      return tx.template.update({
        where: { id },
        data: {
          ...data,
          items: { create: items.map((item, order) => ({ ...item, order })) },
        },
        include: { items: true },
      });
    });
    return ok({ template });
  } catch (err) {
    return handleErrors(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const owned = await ownedTemplate(id, user.id, user.role);
    if (owned.error) return owned.error;
    await db.template.delete({ where: { id } });
    return ok({ ok: true });
  } catch (err) {
    return handleErrors(err);
  }
}
