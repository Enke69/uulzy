import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { joinSchema } from "@/lib/validate";
import { ok, fail, handleErrors } from "@/lib/api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const meetup = await db.meetup.findUnique({
      where: { id },
      include: { joins: { where: { status: "ACCEPTED" } } },
    });
    if (!meetup) return fail("Meetup not found.", 404);
    if (meetup.hostId === user.id) return fail("You are the host.", 400);
    if (meetup.status !== "OPEN") return fail("This meetup is not open.", 400);
    if (meetup.joins.length + 1 >= meetup.capacity) {
      return fail("This meetup is already full.", 400);
    }
    const { message } = joinSchema.parse(await req.json());
    const existing = await db.meetupJoin.findUnique({
      where: { meetupId_userId: { meetupId: id, userId: user.id } },
    });
    if (existing) return fail("You already asked to join.", 409);
    const join = await db.meetupJoin.create({
      data: { meetupId: id, userId: user.id, message },
    });
    return ok({ join }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
