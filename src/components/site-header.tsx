"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { session, signOut } = useAuth();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label="SkillPilot home">
          <span className="wordmark-mark" aria-hidden="true">S</span>
          SkillPilot
        </Link>
        <nav className="primary-nav" aria-label="Main navigation">
          <Link href="/">Explore</Link>
          {session?.role === "STUDENT" && <Link href="/my-enrollments">My learning</Link>}
          {session?.role === "ADMIN" && <Link href="/admin/courses">Manage courses</Link>}
        </nav>
        <div className="header-account">
          {session ? (
            <>
              <span className="account-email">{session.email}</span>
              <button className="text-button" onClick={signOut} type="button">Sign out</button>
            </>
          ) : (
            <>
              <Link className="text-button" href="/login">Sign in</Link>
              <Link className="button button-small" href="/register">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
