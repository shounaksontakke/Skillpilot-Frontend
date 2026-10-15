"use client";

import { useEffect, useMemo, useState } from "react";
import { CourseTile } from "@/components/course-tile";
import { getCourses } from "@/lib/api";
import type { Course } from "@/lib/types";

export default function CatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCourses()
      .then((items) => { if (active) setCourses(items); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Courses could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter((course) =>
      `${course.title} ${course.description}`.toLowerCase().includes(needle),
    );
  }, [courses, query]);

  return (
    <div className="page-shell">
      <section className="catalog-intro">
        <div className="intro-copy">
          <p className="eyebrow">The course collection</p>
          <h1>Learn something<br />that moves you forward.</h1>
          <p className="intro-description">
            Practical courses for curious minds. Pick a subject, find your pace, and get started.
          </p>
        </div>
        <div className="intro-illustration" aria-hidden="true">
          <span className="intro-ring ring-large" />
          <span className="intro-ring ring-small" />
          <span className="intro-spark">✳</span>
          <span className="intro-note">Keep<br />curious.</span>
        </div>
      </section>
      <section className="catalog-section" aria-labelledby="catalog-heading">
        <div className="catalog-heading-row">
          <div>
            <p className="eyebrow">Find your next lesson</p>
            <h2 id="catalog-heading">Explore courses</h2>
          </div>
          <label className="search-field">
            <span className="sr-only">Search courses</span>
            <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
            <input onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" value={query} />
          </label>
        </div>
        {loading ? (
          <div className="loading-state" role="status">Loading courses…</div>
        ) : error ? (
          <div className="message-panel" role="alert">
            <h3>Courses aren’t available right now.</h3>
            <p>{error}</p>
            <p>Check that the LMS API is running at your configured API address, then refresh.</p>
          </div>
        ) : filtered.length ? (
          <div className="course-grid">
            {filtered.map((course, index) => <CourseTile course={course} index={index} key={course.id} />)}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-mark" aria-hidden="true">⌕</span>
            <h3>{courses.length ? "No courses match that search." : "Your next skill starts here."}</h3>
            <p>{courses.length ? "Try another title or clear your search." : "There are no courses yet. Check back soon."}</p>
          </div>
        )}
      </section>
    </div>
  );
}
