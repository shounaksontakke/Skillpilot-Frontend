"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CourseForm } from "@/components/course-form";
import { useAuth } from "@/lib/auth";
import { getCourse, saveCourse } from "@/lib/api";
import type { Course } from "@/lib/types";

export default function EditCoursePage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");

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
    getCourse(params.id, session.token)
      .then((item) => { if (active) setCourse(item); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Course could not be loaded."); });
    return () => { active = false; };
  }, [params.id, router, session]);

  if (!session || session.role !== "ADMIN") return <div className="page-shell"><div className="loading-state">Opening course editor…</div></div>;

  return (
    <div className="page-shell narrow-shell">
      <Link className="back-link" href="/admin/courses">← Manage courses</Link>
      <section className="page-heading editor-heading">
        <p className="eyebrow">Admin workspace</p>
        <h1>Edit course.</h1>
        <p>Update the details students see.</p>
      </section>
      {course ? <CourseForm initial={course} submitLabel="Save changes" onSubmit={async (input) => {
        await saveCourse(input, session.token, course.id);
        router.push("/admin/courses");
      }} /> : <div className={error ? "message-panel" : "loading-state"} role={error ? "alert" : "status"}>{error || "Loading course…"}</div>}
    </div>
  );
}
