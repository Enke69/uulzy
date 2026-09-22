import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { voteSchema } from "@/lib/validate";
import { voteScore } from "@/lib/utils";
import { ok, fail, handleErrors } from "@/lib/api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const template = await db.template.findUnique({ where: { id } });
    if (!template || !template.isPublic) {
      return fail("Template not found or not public.", 404);
    }
    const { value } = voteSchema.parse(await req.json());
    const key = { templateId_userId: { templateId: id, userId: user.id } };
    if (value === 0) {
      await db.templateVote.deleteMany({
        where: { templateId: id, userId: user.id },
      });
    } else {
      await db.templateVote.upsert({
        where: key,
        create: { templateId: id, userId: user.id, value },
        update: { value },
      });
    }
    const votes = await db.templateVote.findMany({
      where: { templateId: id },
      select: { value: true },
    });
    return ok({ score: voteScore(votes), myVote: value });
  } catch (err) {
    return handleErrors(err);
  }
}
