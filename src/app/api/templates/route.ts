import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { templateSchema } from "@/lib/validate";
import { ok, handleErrors } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = templateSchema.parse(await req.json());
    const { items, ...data } = body;
    const template = await db.template.create({
      data: {
        ...data,
        authorId: user.id,
        items: {
          create: items.map((item, order) => ({ ...item, order })),
        },
      },
      include: { items: true },
    });
    return ok({ template }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
