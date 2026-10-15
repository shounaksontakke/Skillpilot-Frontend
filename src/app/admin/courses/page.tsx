"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { deleteCourse, getCourses } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Course } from "@/lib/types";

export default function AdminCoursesPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "ADMIN") {
      router.replace("/");
      return;
    }
    let active = true;
    getCourses()
      .then((data) => { if (active) setCourses(data); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Courses couldn’t be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router, session]);

  async function handleDelete(id: number) {
    if (!session || !window.confirm("Delete this course? This action can’t be undone.")) return;
    setDeleting(id);
    setError("");
    try {
      await deleteCourse(id, session.token);
      setCourses((current) => current.filter((course) => course.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The course couldn’t be deleted.");
    } finally {
      setDeleting(null);
    }
  }

  if (!session || session.role !== "ADMIN") return <div className="page-shell"><div className="loading-state">Opening course management…</div></div>;

  return (
    <div className="page-shell">
      <section className="admin-heading">
        <div className="page-heading">
          <p className="eyebrow">Admin workspace</p>
          <h1>Manage courses.</h1>
          <p>Keep your course collection clear and up to date.</p>
        </div>
        <Link className="button button-primary" href="/admin/courses/new">Add a course</Link>
      </section>
      {error && <div className="message-panel compact-panel" role="alert"><p>{error}</p></div>}
      {loading ? <div className="loading-state">Loading courses…</div> : courses.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th scope="col">Course</th><th scope="col">Price</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td><strong>{course.title}</strong><span>{course.description}</span></td>
                  <td>{formatPrice(course.price)}</td>
                  <td className="table-actions">
                    <Link className="quiet-link" href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                    <button className="text-button danger-text" disabled={deleting === course.id} onClick={() => handleDelete(course.id)} type="button">
                      {deleting === course.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !error ? (
        <div className="empty-state">
          <h2>No courses yet.</h2><p>Add a first course to open the collection to students.</p>
          <Link className="button button-primary" href="/admin/courses/new">Add a course</Link>
        </div>
      ) : null}
    </div>
  );
}
