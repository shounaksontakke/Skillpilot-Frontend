"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

function LoginContent() {
  const searchParams = useSearchParams();
  return (
    <div className="auth-layout">
      <section className="auth-aside">
        <Link className="wordmark wordmark-light" href="/"><span className="wordmark-mark">S</span>SkillPilot</Link>
        <p>Good to have you back.</p>
        <h1>Pick up where<br />you left off.</h1>
        <span className="aside-line" />
        <p className="aside-small">Your next idea is closer than you think.</p>
      </section>
      <section className="auth-main">
        <div className="auth-panel">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in</h2>
          <p className="auth-description">Use your account details to continue learning.</p>
          {searchParams.get("registered") && <p className="form-success" role="status">Account created. Sign in to get started.</p>}
          <AuthForm mode="login" />
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="loading-state">Loading…</div>}><LoginContent /></Suspense>;
}
