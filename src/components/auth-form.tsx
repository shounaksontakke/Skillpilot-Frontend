"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { getEmailFromToken, useAuth } from "@/lib/auth";
import { register, signIn } from "@/lib/api";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { setSession } = useAuth();
  const router = useRouter();
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    try {
      if (isRegister) {
        await register(email, password);
        router.push("/login?registered=1");
      } else {
        const result = await signIn(email, password);
        const sessionEmail = getEmailFromToken(result.token) || email;
        setSession({ ...result, email: sessionEmail });
        router.push(result.role === "ADMIN" ? "/admin/courses" : "/my-enrollments");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your request couldn’t be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field">
        <span>Email address</span>
        <input autoComplete="email" autoFocus name="email" required type="email" />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={isRegister ? 8 : undefined}
          name="password"
          required
          type="password"
        />
        {isRegister && <small>Use at least 8 characters.</small>}
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary button-full" disabled={busy} type="submit">
        {busy ? "Please wait…" : isRegister ? "Create student account" : "Sign in"}
      </button>
      <p className="form-switch">
        {isRegister ? "Already have an account?" : "New to SkillPilot?"}{" "}
        <Link href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
