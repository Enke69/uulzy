import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validate";
import { ok, fail, handleErrors } from "@/lib/api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const template = await db.template.findUnique({ where: { id } });
    if (!template || (!template.isPublic && template.authorId !== user.id)) {
      return fail("Template not found.", 404);
    }
    const { body } = commentSchema.parse(await req.json());
    const comment = await db.templateComment.create({
      data: { templateId: id, userId: user.id, body },
      include: { user: { select: { name: true } } },
    });
    return ok({ comment }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
