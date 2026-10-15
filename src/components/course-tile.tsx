import Link from "next/link";
import type { Course } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const artStyles = ["art-blue", "art-lilac", "art-coral", "art-green"];

export function CourseTile({ course, index = 0 }: { course: Course; index?: number }) {
  return (
    <article className="course-tile">
      <Link className="course-art-link" href={`/courses/${course.id}`} aria-label={`View ${course.title}`}>
        {course.thumbnailUrl ? (
          // Remote thumbnails are user-provided API data; use a regular img to avoid host-specific Next image config.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="course-art-image" src={course.thumbnailUrl} alt="" />
        ) : (
          <div className={`course-art ${artStyles[index % artStyles.length]}`} aria-hidden="true">
            <span className="art-orbit orbit-one" />
            <span className="art-orbit orbit-two" />
            <span className="art-glyph">{String(index + 1).padStart(2, "0")}</span>
            <span className="art-caption">A new skill, in focus</span>
          </div>
        )}
      </Link>
      <div className="course-tile-copy">
        <div>
          <h2><Link href={`/courses/${course.id}`}>{course.title}</Link></h2>
          <p>{course.description || "A practical course to help you take your next step."}</p>
        </div>
        <div className="course-tile-foot">
          <span>{formatPrice(course.price)}</span>
          <Link className="quiet-link" href={`/courses/${course.id}`}>View course</Link>
        </div>
      </div>
    </article>
  );
}
