"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CourseTile } from "@/components/course-tile";
import { useAuth } from "@/lib/auth";
import { getEnrollments } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Enrollment } from "@/lib/types";

export default function EnrollmentsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "STUDENT") {
      router.replace("/admin/courses");
      return;
    }
    let active = true;
    getEnrollments(session.token)
      .then((data) => { if (active) setItems(data); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Your courses couldn’t be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router, session]);

  if (!session || session.role !== "STUDENT") return <div className="page-shell"><div className="loading-state">Opening your learning…</div></div>;

  return (
    <div className="page-shell">
      <section className="page-heading">
        <p className="eyebrow">Your learning</p>
        <h1>Keep your momentum.</h1>
        <p>Everything you’ve joined, all in one place.</p>
      </section>
      {loading ? <div className="loading-state">Loading your courses…</div> : error ? (
        <div className="message-panel" role="alert"><h2>Your courses couldn’t be loaded.</h2><p>{error}</p></div>
      ) : items.length ? (
        <div className="enrollment-list">
          {items.map((item, index) => (
            <div className="enrollment-item" key={item.id}>
              <CourseTile course={item.course} index={index} />
              <p className="enrolled-date">Joined {formatDate(item.enrolledAt)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-mark" aria-hidden="true">↗</span>
          <h2>Your learning list is ready.</h2>
          <p>When you enroll in a course, you’ll find it here.</p>
          <Link className="button button-primary" href="/">Explore courses</Link>
        </div>
      )}
    </div>
  );
}
