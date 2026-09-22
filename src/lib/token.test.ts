import { describe, expect, it } from "vitest";
import { createToken, verifyToken } from "./token";

describe("session tokens", () => {
  it("round-trips a user id", () => {
    const token = createToken("user123");
    expect(verifyToken(token)).toBe("user123");
  });
  it("rejects a tampered token", () => {
    const token = createToken("user123");
    expect(verifyToken(token.replace("user123", "user999"))).toBeNull();
  });
  it("rejects an expired token", () => {
    const past = Date.now() - 40 * 24 * 60 * 60 * 1000;
    const token = createToken("user123", past);
    expect(verifyToken(token)).toBeNull();
  });
  it("rejects garbage", () => {
    expect(verifyToken("not-a-token")).toBeNull();
    expect(verifyToken("")).toBeNull();
  });
});
