import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validate";
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
    const body = reviewSchema.parse(await req.json());
    const review = await db.review.upsert({
      where: { placeId_userId: { placeId: id, userId: user.id } },
      create: { ...body, placeId: id, userId: user.id },
      update: body,
    });
    return ok({ review }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
