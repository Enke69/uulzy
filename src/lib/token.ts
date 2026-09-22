import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_DAYS = 30;

function secret(): string {
  return process.env.SESSION_SECRET ?? "uulzy-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export { SESSION_DAYS };

export function createToken(userId: string, now = Date.now()): string {
  const expires = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string, now = Date.now()): string | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [userId, expiresStr] = payload.split(".");
  if (!userId || !expiresStr || Number(expiresStr) < now) return null;
  return userId;
}
