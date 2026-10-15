"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { enroll, getCourse, ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Course } from "@/lib/types";

export default function CoursePage() {
  const params = useParams<{ id: string }>();
  const { session } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCourse(params.id, session?.token)
      .then((item) => { if (active) setCourse(item); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "This course couldn’t be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id, session?.token]);

  async function handleEnroll() {
    if (!session || !course) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await enroll(course.id, session.token);
      const unlockedCourse = await getCourse(String(course.id), session.token);
      setCourse(unlockedCourse);
      setMessage("You’re enrolled. Your course is ready.");
    } catch (cause) {
      if (cause instanceof ApiError && /already enrolled/i.test(cause.message)) {
        try {
          setCourse(await getCourse(String(course.id), session.token));
          setMessage("You’re already enrolled in this course.");
        } catch (refreshError) {
          setError(refreshError instanceof Error ? refreshError.message : "Your course access couldn’t be refreshed.");
        }
      } else {
        setError(cause instanceof Error ? cause.message : "Enrollment couldn’t be completed.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="page-shell"><div className="loading-state">Loading course…</div></div>;
  if (error && !course) return <div className="page-shell"><div className="message-panel" role="alert"><h2>Course unavailable</h2><p>{error}</p><Link className="quiet-link" href="/">Back to courses</Link></div></div>;
  if (!course) return null;

  return (
    <div className="page-shell course-detail-page">
      <Link className="back-link" href="/">← All courses</Link>
      <div className="detail-layout">
        <section className="detail-copy">
          <p className="eyebrow">Course details</p>
          <h1>{course.title}</h1>
          <p className="detail-description">{course.description}</p>
          <div className="detail-price">{formatPrice(course.price)}</div>
          {message && <p className="form-success" role="status">{message}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {course.videoUrl ? (
            <div className="video-access">
              <span className="access-icon" aria-hidden="true">✓</span>
              <div><strong>You’re all set</strong><p>This course is unlocked for your account.</p></div>
              <a className="button button-primary" href={course.videoUrl} rel="noreferrer" target="_blank">Open course video</a>
            </div>
          ) : session?.role === "STUDENT" ? (
            <button className="button button-primary" disabled={busy} onClick={handleEnroll} type="button">
              {busy ? "Enrolling…" : `Enroll for ${formatPrice(course.price)}`}
            </button>
          ) : session?.role === "ADMIN" ? (
            <Link className="button button-primary" href="/admin/courses">Manage courses</Link>
          ) : (
            <div className="locked-panel">
              <span className="lock-icon" aria-hidden="true">⌑</span>
              <div><strong>Enroll to watch</strong><p>Sign in or create a student account to join this course.</p></div>
              <Link className="button button-primary" href="/login">Sign in to enroll</Link>
            </div>
          )}
        </section>
        <aside className="detail-art" aria-label="Course preview">
          {course.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnailUrl} alt="" />
          ) : <div className="detail-art-placeholder"><span>SP</span><i>Make it<br />your next.</i></div>}
        </aside>
      </div>
    </div>
  );
}
