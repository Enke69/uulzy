import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { moderationSchema } from "@/lib/validate";
import { ok, fail, handleErrors } from "@/lib/api";

const APPROVAL_POINTS = 10;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = moderationSchema.parse(await req.json());
    const existing = await db.place.findUnique({ where: { id } });
    if (!existing) return fail("Place not found.", 404);
    const place = await db.place.update({ where: { id }, data: { status } });
    if (status === "APPROVED" && existing.status !== "APPROVED" && existing.createdById) {
      await db.user.update({
        where: { id: existing.createdById },
        data: { points: { increment: APPROVAL_POINTS } },
      });
    }
    return ok({ place });
  } catch (err) {
    return handleErrors(err);
  }
}
