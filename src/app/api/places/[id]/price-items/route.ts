import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { priceItemSchema } from "@/lib/validate";
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
    const body = priceItemSchema.parse(await req.json());
    const item = await db.priceItem.create({
      data: { ...body, placeId: id, submittedById: user.id, status: "PENDING" },
    });
    return ok({ item }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
