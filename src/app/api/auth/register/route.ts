import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validate";
import { ok, fail, handleErrors } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());
    const email = body.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return fail("An account with this email already exists.", 409);
    const user = await db.user.create({
      data: {
        email,
        name: body.name,
        passwordHash: await hashPassword(body.password),
      },
      select: { id: true, email: true, name: true, role: true },
    });
    await setSessionCookie(user.id);
    return ok({ user }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
