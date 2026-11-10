export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin" | "superadmin";
  is_active?: number | boolean;
  must_change_password?: boolean;
}
export interface AdminList<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean | number;
}
export interface Course {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  image: string;
  category_id: number | null;
  language_id?: number | null;
  instructor_id?: number | null;
  level: string;
  price: number | string;
  status: "draft" | "published" | "archived";
  category_name?: string;
  instructor_name?: string;
  chapters?: Chapter[];
  created_at?: string;
  updated_at?: string;
}
export interface Chapter {
  id: number;
  course_id: number;
  title: string;
  position: number;
  lessons?: Lesson[];
}
export interface Lesson {
  id: number;
  chapter_id: number;
  title: string;
  type: "video" | "audio" | "pdf" | "text";
  content_text: string;
  source_url: string;
  media_id?: number | null;
  is_preview: boolean | number;
  is_published: boolean | number;
  position: number;
  duration_seconds: number;
}
export interface UploadResult {
  id: number;
  url: string;
  mime_type: string;
  size_bytes: number;
  original_name: string;
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function adminApi<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<{ data: T; message?: string }> {
  const multipart = options.body instanceof FormData;
  const response = await fetch(`/api/admin/${path}`, {
    method: options.method || "GET",
    credentials: "same-origin",
    cache: "no-store",
    signal: options.signal,
    headers: {
      Accept: "application/json",
      ...(options.body && !multipart
        ? { "Content-Type": "application/json" }
        : {}),
    },
    ...(options.body
      ? {
          body: multipart
            ? (options.body as FormData)
            : JSON.stringify(options.body),
        }
      : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || result.error)
    throw new AdminApiError(
      result?.message ||
        "The request could not be completed. Please try again.",
      response.status,
    );
  return result;
}
export async function uploadAdminFile(
  file: File,
  purpose: "image" | "course" = "course",
): Promise<UploadResult> {
  const body = new FormData();
  body.set("file", file);
  body.set("purpose", purpose);
  return (await adminApi<UploadResult>("media", { method: "POST", body })).data;
}
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}
export function recordDate(value: string) {
  return new Date(
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)
      ? value.replace(" ", "T") + "Z"
      : value,
  );
}
export function displayDate(value?: string | null) {
  if (!value) return "—";
  const date = recordDate(value);
  return Number.isNaN(date.valueOf())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}
export function money(
  value: number | string | null | undefined,
  currency = "INR",
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
