import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { moderationSchema } from "@/lib/validate";
import { ok, fail, handleErrors } from "@/lib/api";

const APPROVAL_POINTS = 5;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = moderationSchema.parse(await req.json());
    const existing = await db.priceItem.findUnique({ where: { id } });
    if (!existing) return fail("Price item not found.", 404);
    const item = await db.priceItem.update({ where: { id }, data: { status } });
    if (status === "APPROVED" && existing.status !== "APPROVED") {
      await db.user.update({
        where: { id: existing.submittedById },
        data: { points: { increment: APPROVAL_POINTS } },
      });
    }
    return ok({ item });
  } catch (err) {
    return handleErrors(err);
  }
}
