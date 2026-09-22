import { getSessionUser } from "@/lib/auth";
import { ok, handleErrors } from "@/lib/api";

export async function GET() {
  try {
    const user = await getSessionUser();
    return ok({ user });
  } catch (err) {
    return handleErrors(err);
  }
}
