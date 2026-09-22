import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleErrors } from "@/lib/api";
import { z } from "zod";

const decisionSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; joinId: string }> }
) {
  try {
    const user = await requireUser();
    const { id, joinId } = await params;
    const meetup = await db.meetup.findUnique({
      where: { id },
      include: { joins: { where: { status: "ACCEPTED" } } },
    });
    if (!meetup) return fail("Meetup not found.", 404);
    if (meetup.hostId !== user.id && user.role !== "ADMIN") {
      return fail("Only the host can manage requests.", 403);
    }
    const { status } = decisionSchema.parse(await req.json());
    if (
      status === "ACCEPTED" &&
      meetup.joins.length + 1 >= meetup.capacity
    ) {
      return fail("Meetup is full — cannot accept more people.", 400);
    }
    const join = await db.meetupJoin.update({
      where: { id: joinId },
      data: { status },
    });
    const accepted = await db.meetupJoin.count({
      where: { meetupId: id, status: "ACCEPTED" },
    });
    if (accepted + 1 >= meetup.capacity) {
      await db.meetup.update({ where: { id }, data: { status: "FULL" } });
    }
    return ok({ join });
  } catch (err) {
    return handleErrors(err);
  }
}
