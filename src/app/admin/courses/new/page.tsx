"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CourseForm } from "@/components/course-form";
import { useAuth } from "@/lib/auth";
import { saveCourse } from "@/lib/api";

export default function NewCoursePage() {
  const { session } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!session) router.replace("/login");
    else if (session.role !== "ADMIN") router.replace("/");
  }, [router, session]);

  if (!session || session.role !== "ADMIN") return <div className="page-shell"><div className="loading-state">Opening course editor…</div></div>;

  return (
    <div className="page-shell narrow-shell">
      <Link className="back-link" href="/admin/courses">← Manage courses</Link>
      <section className="page-heading editor-heading">
        <p className="eyebrow">Admin workspace</p>
        <h1>Add a course.</h1>
        <p>Share the details students need to get started.</p>
      </section>
      <CourseForm submitLabel="Publish course" onSubmit={async (input) => {
        await saveCourse(input, session.token);
        router.push("/admin/courses");
      }} />
    </div>
  );
}
