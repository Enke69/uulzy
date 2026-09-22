import { clearSessionCookie } from "@/lib/auth";
import { ok, handleErrors } from "@/lib/api";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ ok: true });
  } catch (err) {
    return handleErrors(err);
  }
}
