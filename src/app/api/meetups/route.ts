import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { meetupSchema } from "@/lib/validate";
import { ok, fail, handleErrors } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = meetupSchema.parse(await req.json());
    if (!body.placeId && !body.location) {
      return fail("Pick a place or type a location.", 400);
    }
    if (body.dateTime.getTime() < Date.now()) {
      return fail("Meetup time must be in the future.", 400);
    }
    const meetup = await db.meetup.create({
      data: { ...body, hostId: user.id },
    });
    return ok({ meetup }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
