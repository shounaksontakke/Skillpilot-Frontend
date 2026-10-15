export type Role = "ADMIN" | "STUDENT";

export interface Session {
  token: string;
  email: string;
  role: Role;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
}

export interface Enrollment {
  id: number;
  enrolledAt: string;
  course: Course;
}

export interface CourseInput {
  title: string;
  description: string;
  price: number;
  videoUrl: string;
  thumbnailUrl: string;
}
