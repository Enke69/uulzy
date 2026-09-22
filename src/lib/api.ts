import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Wrap a route handler: zod + auth errors become clean JSON responses. */
export function handleErrors(err: unknown) {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const where = first?.path?.join(".") ?? "";
    return fail(`${where ? where + ": " : ""}${first?.message ?? "Invalid input"}`, 400);
  }
  if (err instanceof AuthError) return fail(err.message, err.status);
  console.error(err);
  return fail("Something went wrong.", 500);
}
