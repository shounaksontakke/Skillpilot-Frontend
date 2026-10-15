import type { Course, CourseInput, Enrollment, Role } from "@/lib/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Can’t reach SkillPilot. Check that the API is running and try again.", 0);
  }

  const text = await response.text();
  let body: unknown = text;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "string"
        ? body
        : isRecord(body) && typeof body.message === "string"
          ? body.message
          : `Request failed (${response.status}). Please try again.`;
    throw new ApiError(message, response.status);
  }
  return body as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCourse(value: unknown): Course {
  if (!isRecord(value) || typeof value.id !== "number" || typeof value.title !== "string") {
    throw new ApiError("The API returned a course in an unexpected format.", 502);
  }
  return {
    id: value.id,
    title: value.title,
    description: typeof value.description === "string" ? value.description : "",
    price: typeof value.price === "number" ? value.price : null,
    thumbnailUrl: typeof value.thumbnailUrl === "string" ? value.thumbnailUrl : null,
    videoUrl: typeof value.videoUrl === "string" ? value.videoUrl : null,
  };
}

function parseEnrollment(value: unknown): Enrollment {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.enrolledAt !== "string"
  ) {
    throw new ApiError("The API returned an enrollment in an unexpected format.", 502);
  }
  return {
    id: value.id,
    enrolledAt: value.enrolledAt,
    course: parseCourse(value.course),
  };
}

export async function getCourses(): Promise<Course[]> {
  const body = await request<unknown>("/api/courses");
  if (!Array.isArray(body)) throw new ApiError("The API returned an unexpected course list.", 502);
  return body.map(parseCourse);
}

export async function getCourse(id: string, token?: string): Promise<Course> {
  return parseCourse(await request<unknown>(`/api/courses/${encodeURIComponent(id)}`, {}, token));
}

export async function signIn(email: string, password: string): Promise<{ token: string; role: Role }> {
  const body: unknown = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (
    !isRecord(body) ||
    typeof body.token !== "string" ||
    (body.role !== "ADMIN" && body.role !== "STUDENT")
  ) {
    throw new ApiError("The API returned an unexpected sign-in response.", 502);
  }
  return { token: body.token, role: body.role };
}

export async function register(email: string, password: string): Promise<void> {
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getEnrollments(token: string): Promise<Enrollment[]> {
  const body = await request<unknown>("/api/enrollments/my", {}, token);
  if (!Array.isArray(body)) throw new ApiError("The API returned an unexpected enrollment list.", 502);
  return body.map(parseEnrollment);
}

export async function enroll(courseId: number, token: string): Promise<Enrollment> {
  return parseEnrollment(
    await request<unknown>(`/api/enrollments/${courseId}`, { method: "POST" }, token),
  );
}

export async function saveCourse(input: CourseInput, token: string, id?: number): Promise<Course> {
  const body = await request<unknown>(id ? `/api/courses/${id}` : "/api/courses", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  }, token);
  return parseCourse(body);
}

export async function deleteCourse(id: number, token: string): Promise<void> {
  await request(`/api/courses/${id}`, { method: "DELETE" }, token);
}
