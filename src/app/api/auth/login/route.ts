import { db } from "@/lib/db";
import { checkPassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validate";
import { ok, fail, handleErrors } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());
    const user = await db.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (!user || !(await checkPassword(body.password, user.passwordHash))) {
      return fail("Invalid email or password.", 401);
    }
    await setSessionCookie(user.id);
    return ok({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    return handleErrors(err);
  }
}
