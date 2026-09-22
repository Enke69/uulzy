import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { activityMediaSchema } from "@/lib/validate";
import { ok, fail, handleErrors } from "@/lib/api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const place = await db.place.findUnique({ where: { id } });
    if (!place) return fail("Place not found.", 404);
    const body = activityMediaSchema.parse(await req.json());
    const media = await db.activityMedia.create({
      data: { ...body, placeId: id, userId: user.id },
      include: { user: { select: { name: true } } },
    });
    return ok({ media }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
