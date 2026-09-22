"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(form.get("email")),
      password: String(form.get("password")),
    };
    if (mode === "register") body.name = String(form.get("name"));
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto card p-8 mt-14">
      <h1 className="font-display text-3xl text-primary text-center mb-1">
        Uulzy
      </h1>
      <p className="text-center text-ink-soft mb-6">
        {mode === "login" ? "Welcome back!" : "Create your account"}
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {mode === "register" && (
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input id="name" name="name" className="input" required minLength={2} />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            required
            minLength={mode === "register" ? 8 : 1}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-center text-ink-soft mt-4">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="text-primary font-semibold">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
