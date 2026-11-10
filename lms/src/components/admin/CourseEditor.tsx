"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, File, Plus, Upload } from "lucide-react";
import {
  adminApi,
  errorMessage,
  uploadAdminFile,
  type AdminList,
  type AdminUser,
  type Category,
  type Chapter,
  type Course,
  type Lesson,
} from "./api";
import {
  AdminDialog,
  AdminHeading,
  Badge,
  ConfirmButton,
  Empty,
  Field,
  Loading,
  Notice,
  Panel,
  useAdminResource,
} from "./ui";

type CourseForm = {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  image: string;
  category_id: string;
  language_id: string;
  instructor_id: string;
  level: string;
  price: string;
  status: Course["status"];
};
const emptyCourse: CourseForm = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  image: "",
  category_id: "",
  language_id: "",
  instructor_id: "",
  level: "beginner",
  price: "0",
  status: "draft",
};
type LessonForm = {
  id?: number;
  chapter_id: number;
  title: string;
  type: Lesson["type"];
  content_text: string;
  source_url: string;
  media_id: number | null;
  is_preview: boolean;
  is_published: boolean;
  position: number;
  duration_seconds: number;
};
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export default function CourseEditor({
  courseId,
}: {
  courseId: string | null;
}) {
  const router = useRouter();
  const resource = useAdminResource<Course>(
    courseId ? `courses/${courseId}` : null,
  );
  const categories = useAdminResource<AdminList<Category>>(
    "categories?per_page=100",
  );
  const languages = useAdminResource<AdminList<{ id: number; name: string }>>(
    "languages?per_page=100",
  );
  const people = useAdminResource<AdminList<AdminUser>>("users?per_page=100");
  const [form, setForm] = useState<CourseForm>(emptyCourse);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const initialId = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [editingChapter, setEditingChapter] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [lesson, setLesson] = useState<LessonForm | null>(null);
  const [lessonError, setLessonError] = useState("");
  useEffect(() => {
    if (!resource.data) return;
    const course = resource.data;
    setChapters(
      (course.chapters || [])
        .map((chapter) => ({
          ...chapter,
          lessons: (chapter.lessons || [])
            .slice()
            .sort((a, b) => a.position - b.position),
        }))
        .sort((a, b) => a.position - b.position),
    );
    if (initialId.current !== String(course.id)) {
      setForm({
        title: course.title || "",
        slug: course.slug || "",
        short_description: course.short_description || "",
        description: course.description || "",
        image: course.image || "",
        category_id: String(course.category_id || ""),
        language_id: String(course.language_id || ""),
        instructor_id: String(course.instructor_id || ""),
        level: course.level || "beginner",
        price: String(course.price ?? 0),
        status: course.status,
      });
      initialId.current = String(course.id);
    }
  }, [resource.data]);
  const update = (key: keyof CourseForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const saveCourse = async (status = form.status, throwOnError = false) => {
    if (busy || uploading) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        slug: form.slug.trim() || slugify(form.title),
        category_id: form.category_id ? Number(form.category_id) : null,
        language_id: form.language_id ? Number(form.language_id) : null,
        instructor_id: form.instructor_id ? Number(form.instructor_id) : null,
        price: Number(form.price || 0),
        status,
      };
      const response = await adminApi<Course>(
        courseId ? `courses/${courseId}` : "courses",
        { method: courseId ? "PATCH" : "POST", body: payload },
      );
      setForm((current) => ({
        ...current,
        status: response.data.status || status,
        slug: response.data.slug || current.slug,
        instructor_id: String(response.data.instructor_id || ""),
        price: String(response.data.price ?? current.price),
      }));
      setSuccess(response.message || "Course saved.");
      if (!courseId) router.replace(`/admin/courses/${response.data.id}`);
      else resource.refresh();
    } catch (failure) {
      setError(errorMessage(failure));
      if (throwOnError) throw failure;
    } finally {
      setBusy(false);
    }
  };
  const mutate = async (path: string, method: string, body?: unknown) => {
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      await adminApi(path, { method, body });
      resource.refresh();
    } catch (failure) {
      setError(errorMessage(failure));
      throw failure;
    } finally {
      setBusy(false);
    }
  };
  const order = async (next: Chapter[]) => {
    if (!courseId || busy) return;
    try {
      await mutate(`courses/${courseId}/order`, "POST", {
        chapter_ids: next.map((chapter) => chapter.id),
        lessons: next.map((chapter) => ({
          chapter_id: chapter.id,
          lesson_ids: (chapter.lessons || []).map((item) => item.id),
        })),
      });
      setChapters(next);
    } catch {}
  };
  const moveChapter = (index: number, direction: number) => {
    const next = chapters.slice();
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    void order(next);
  };
  const moveLesson = (
    chapterIndex: number,
    index: number,
    direction: number,
  ) => {
    const next = chapters.map((chapter) => ({
      ...chapter,
      lessons: (chapter.lessons || []).slice(),
    }));
    const rows = next[chapterIndex].lessons;
    [rows[index], rows[index + direction]] = [
      rows[index + direction],
      rows[index],
    ];
    void order(next);
  };
  const openLesson = (chapter: Chapter, item?: Lesson) => {
    setLessonError("");
    setLesson(
      item
        ? {
            ...item,
            chapter_id: chapter.id,
            content_text: item.content_text || "",
            source_url: item.source_url || "",
            media_id: item.media_id || null,
            is_preview: Boolean(item.is_preview),
            is_published: Boolean(item.is_published),
            duration_seconds: Number(item.duration_seconds || 0),
          }
        : {
            chapter_id: chapter.id,
            title: "",
            type: "video",
            content_text: "",
            source_url: "",
            media_id: null,
            is_preview: false,
            is_published: false,
            position: (chapter.lessons?.length || 0) + 1,
            duration_seconds: 0,
          },
    );
  };
  const saveLesson = async (event: FormEvent) => {
    event.preventDefault();
    if (!lesson || busy || uploading) return;
    setBusy(true);
    setLessonError("");
    try {
      await adminApi(
        lesson.id
          ? `lessons/${lesson.id}`
          : `chapters/${lesson.chapter_id}/lessons`,
        { method: lesson.id ? "PATCH" : "POST", body: lesson },
      );
      setLesson(null);
      resource.refresh();
    } catch (failure) {
      setLessonError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  if (courseId && resource.loading && !resource.data) return <Loading />;
  if (courseId && resource.error && !resource.data)
    return (
      <>
        <Notice>{resource.error}</Notice>
        <button className="adm-btn" onClick={resource.refresh}>
          Try again
        </button>
      </>
    );
  return (
    <>
      <AdminHeading
        eyebrow="Learning library"
        title={courseId ? "Shape your course" : "Create a new course"}
        description="Start with the essentials, then bring your practice to life one lesson at a time."
        actions={
          <>
            <Link className="adm-btn adm-btn-secondary" href="/admin/courses">
              ← All courses
            </Link>
            {courseId && <Badge>{form.status}</Badge>}
          </>
        }
      />
      <Notice>{error || resource.error}</Notice>
      <Notice tone="success">{success}</Notice>
      <Notice>{categories.error || languages.error || people.error}</Notice>
      <div className="adm-editor-columns">
        <div>
          <Panel
            title="Course details"
            description="Help learners understand what they will practise and why it matters."
          >
            <form
              id="course-details"
              onSubmit={(event) => {
                event.preventDefault();
                void saveCourse();
              }}
            >
              <div className="adm-form-grid">
                <Field label="Course title" wide>
                  <input
                    value={form.title}
                    onChange={(event) => update("title", event.target.value)}
                    maxLength={200}
                    required
                  />
                </Field>
                <Field
                  label="URL slug"
                  hint="Used in the public course link. A blank slug is generated from the title."
                  wide
                >
                  <input
                    value={form.slug}
                    onChange={(event) => update("slug", event.target.value)}
                    maxLength={200}
                    placeholder="a-gentle-beginning"
                  />
                </Field>
                <Field
                  label="Short introduction"
                  hint="A concise summary for the course card."
                  wide
                >
                  <textarea
                    rows={3}
                    style={{ minHeight: 90 }}
                    value={form.short_description}
                    onChange={(event) =>
                      update("short_description", event.target.value)
                    }
                    maxLength={600}
                  />
                </Field>
                <Field label="Full description" wide>
                  <textarea
                    rows={10}
                    value={form.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                  />
                </Field>
                <Field label="Practice category">
                  <select
                    value={form.category_id}
                    onChange={(event) =>
                      update("category_id", event.target.value)
                    }
                  >
                    <option value="">Choose a category</option>
                    {categories.data?.items.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Teaching language">
                  <select
                    value={form.language_id}
                    onChange={(event) =>
                      update("language_id", event.target.value)
                    }
                  >
                    <option value="">Choose a language</option>
                    {languages.data?.items.map((language) => (
                      <option key={language.id} value={language.id}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Instructor">
                  <select
                    value={form.instructor_id}
                    onChange={(event) =>
                      update("instructor_id", event.target.value)
                    }
                  >
                    <option value="">Not assigned</option>
                    {people.data?.items
                      .filter(
                        (person) =>
                          ["admin", "superadmin"].includes(person.role) &&
                          Boolean(person.is_active),
                      )
                      .map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Level">
                  <select
                    value={form.level}
                    onChange={(event) => update("level", event.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </Field>
                <Field label="Price (INR)" hint="Set 0 for a free practice.">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => update("price", event.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="adm-form-actions">
                <button className="adm-btn" disabled={busy || uploading}>
                  {busy
                    ? "Saving…"
                    : courseId
                      ? "Save course details"
                      : "Save draft & add lessons"}
                </button>
              </div>
            </form>
          </Panel>
          <Panel
            title="Curriculum"
            description="Organise chapters and lessons in a natural learning sequence."
          >
            {!courseId ? (
              <Empty
                title="Your next step: the first lesson"
                description="Save this course as a draft to start building its curriculum."
              />
            ) : (
              <>
                {chapters.map((chapter, chapterIndex) => (
                  <div className="adm-chapter" key={chapter.id}>
                    <div className="adm-chapter-heading">
                      <div>
                        <small className="adm-muted">
                          Chapter {chapterIndex + 1}
                        </small>
                        <h3>{chapter.title}</h3>
                      </div>
                      <div className="adm-actions">
                        <button
                          className="adm-icon-btn"
                          disabled={busy || chapterIndex === 0}
                          onClick={() => moveChapter(chapterIndex, -1)}
                          aria-label="Move chapter up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          className="adm-icon-btn"
                          disabled={
                            busy || chapterIndex === chapters.length - 1
                          }
                          onClick={() => moveChapter(chapterIndex, 1)}
                          aria-label="Move chapter down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          className="adm-btn adm-btn-secondary adm-btn-small"
                          onClick={() =>
                            setEditingChapter({
                              id: chapter.id,
                              title: chapter.title,
                            })
                          }
                        >
                          Rename
                        </button>
                        <ConfirmButton
                          title="Delete this chapter?"
                          description="This permanently removes the chapter and every lesson inside it."
                          className="adm-btn adm-btn-danger adm-btn-small"
                          onConfirm={() =>
                            mutate(`chapters/${chapter.id}`, "DELETE")
                          }
                        >
                          Delete
                        </ConfirmButton>
                      </div>
                    </div>
                    <div className="adm-chapter-body">
                      {(chapter.lessons || []).map((item, index) => (
                        <div className="adm-lesson-row" key={item.id}>
                          <div>
                            <strong>
                              {index + 1}. {item.title}
                            </strong>
                            <small>
                              {item.type} ·{" "}
                              {Math.round(
                                Number(item.duration_seconds || 0) / 60,
                              )}{" "}
                              min{" "}
                              <Badge>
                                {item.is_published ? "Published" : "Draft"}
                              </Badge>
                              {Boolean(item.is_preview) && (
                                <Badge>Preview</Badge>
                              )}
                            </small>
                          </div>
                          <div className="adm-actions">
                            <button
                              className="adm-icon-btn"
                              disabled={busy || index === 0}
                              onClick={() =>
                                moveLesson(chapterIndex, index, -1)
                              }
                              aria-label="Move lesson up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              className="adm-icon-btn"
                              disabled={
                                busy ||
                                index === (chapter.lessons?.length || 0) - 1
                              }
                              onClick={() => moveLesson(chapterIndex, index, 1)}
                              aria-label="Move lesson down"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              className="adm-btn adm-btn-secondary adm-btn-small"
                              onClick={() => openLesson(chapter, item)}
                            >
                              Edit
                            </button>
                            <ConfirmButton
                              title="Delete this lesson?"
                              description="This permanently removes this lesson from the course."
                              className="adm-btn adm-btn-danger adm-btn-small"
                              onConfirm={() =>
                                mutate(`lessons/${item.id}`, "DELETE")
                              }
                            >
                              Delete
                            </ConfirmButton>
                          </div>
                        </div>
                      ))}
                      {!chapter.lessons?.length && (
                        <p
                          className="adm-section-note"
                          style={{ padding: "6px 0 15px" }}
                        >
                          No lessons yet. Add a video, audio practice, document,
                          or written lesson.
                        </p>
                      )}
                      <button
                        className="adm-btn adm-btn-secondary adm-btn-small"
                        onClick={() => openLesson(chapter)}
                      >
                        <Plus size={13} /> Add lesson
                      </button>
                    </div>
                  </div>
                ))}
                <form
                  className="adm-actions"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (!chapterTitle.trim() || busy) return;
                    try {
                      await mutate(`courses/${courseId}/chapters`, "POST", {
                        title: chapterTitle.trim(),
                        position: chapters.length + 1,
                      });
                      setChapterTitle("");
                    } catch {}
                  }}
                >
                  <input
                    placeholder="New chapter title"
                    value={chapterTitle}
                    onChange={(event) => setChapterTitle(event.target.value)}
                    required
                    maxLength={200}
                    style={{ flex: 1, minWidth: 170 }}
                  />
                  <button className="adm-btn adm-btn-secondary" disabled={busy}>
                    <Plus size={14} /> Add chapter
                  </button>
                </form>
              </>
            )}
          </Panel>
        </div>
        <div>
          <Panel title="Course image">
            <div className="adm-upload">
              {form.image ? (
                <img src={form.image} alt="Course thumbnail preview" />
              ) : (
                <p>
                  A peaceful, clear image gives your course a welcoming first
                  impression.
                </p>
              )}
              <label>
                <span>
                  <Upload
                    size={13}
                    style={{ display: "inline", marginRight: 5 }}
                  />
                  {uploading ? "Uploading…" : "Upload an image"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading || busy}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setError("");
                    try {
                      const result = await uploadAdminFile(file, "image");
                      update("image", result.url);
                    } catch (failure) {
                      setError(errorMessage(failure));
                    } finally {
                      setUploading(false);
                      event.target.value = "";
                    }
                  }}
                />
              </label>
            </div>
            <div style={{ marginTop: 15 }}>
              <Field label="Or image URL">
                <input
                  value={form.image}
                  onChange={(event) => update("image", event.target.value)}
                  placeholder="https://…"
                />
              </Field>
            </div>
          </Panel>
          <Panel title="Publication">
            <div className="adm-form-stack">
              <p className="adm-side-info">
                Drafts stay private. Publishing requires a summary, description,
                image, category, language, instructor, and at least one
                published lesson.
              </p>
              {courseId ? (
                <>
                  <button
                    className="adm-btn"
                    disabled={busy || uploading}
                    onClick={() => void saveCourse("published")}
                  >
                    {form.status === "published"
                      ? "Save & keep published"
                      : "Publish course"}
                  </button>
                  {form.status !== "draft" && (
                    <button
                      className="adm-btn adm-btn-secondary"
                      disabled={busy || uploading}
                      onClick={() => void saveCourse("draft")}
                    >
                      Return to draft
                    </button>
                  )}
                  {form.status !== "archived" && (
                    <ConfirmButton
                      title="Archive this course?"
                      description="This hides the course from the public catalogue. Existing learner access follows the course access rules."
                      onConfirm={() => saveCourse("archived", true)}
                    >
                      Archive course
                    </ConfirmButton>
                  )}
                  <Link
                    className="adm-quiet-link"
                    href={`/course-details/${form.slug}`}
                    target="_blank"
                  >
                    Open public course ↗
                  </Link>
                  <ConfirmButton
                    title="Permanently delete this course?"
                    description="This removes the course and its curriculum. Courses with orders or enrollments must be archived to preserve history."
                    className="adm-btn adm-btn-danger"
                    onConfirm={async () => {
                      await adminApi(`courses/${courseId}`, {
                        method: "DELETE",
                      });
                      router.replace("/admin/courses");
                    }}
                  >
                    Delete course
                  </ConfirmButton>
                </>
              ) : (
                <p className="adm-section-note">
                  Save your first draft before adding lessons or publishing.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>
      <AdminDialog
        open={Boolean(editingChapter)}
        onClose={() => {
          if (!busy) setEditingChapter(null);
        }}
        title="Rename chapter"
      >
        {editingChapter && (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await mutate(`chapters/${editingChapter.id}`, "PATCH", {
                  title: editingChapter.title,
                });
                setEditingChapter(null);
              } catch {}
            }}
          >
            <Field label="Chapter title">
              <input
                value={editingChapter.title}
                onChange={(event) =>
                  setEditingChapter({
                    ...editingChapter,
                    title: event.target.value,
                  })
                }
                required
                maxLength={200}
              />
            </Field>
            <div style={{ marginTop: 18 }}>
              <Notice>{error}</Notice>
            </div>
            <div className="adm-dialog-actions">
              <button className="adm-btn" disabled={busy}>
                Save chapter
              </button>
            </div>
          </form>
        )}
      </AdminDialog>
      <AdminDialog
        open={Boolean(lesson)}
        onClose={() => {
          if (!busy && !uploading) setLesson(null);
        }}
        title={lesson?.id ? "Edit lesson" : "Add a lesson"}
      >
        {lesson && (
          <form onSubmit={saveLesson}>
            <div className="adm-form-grid">
              <Field label="Lesson title" wide>
                <input
                  value={lesson.title}
                  onChange={(event) =>
                    setLesson({ ...lesson, title: event.target.value })
                  }
                  required
                  maxLength={200}
                />
              </Field>
              <Field label="Lesson format">
                <select
                  value={lesson.type}
                  onChange={(event) =>
                    setLesson({
                      ...lesson,
                      type: event.target.value as Lesson["type"],
                    })
                  }
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio practice</option>
                  <option value="pdf">PDF document</option>
                  <option value="text">Written lesson</option>
                </select>
              </Field>
              <Field label="Duration (seconds)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={lesson.duration_seconds}
                  onChange={(event) =>
                    setLesson({
                      ...lesson,
                      duration_seconds: Number(event.target.value),
                    })
                  }
                />
              </Field>
              <Field
                label={
                  lesson.type === "text" ? "Lesson content" : "Lesson notes"
                }
                wide
              >
                <textarea
                  rows={7}
                  value={lesson.content_text}
                  onChange={(event) =>
                    setLesson({ ...lesson, content_text: event.target.value })
                  }
                  required={lesson.type === "text"}
                />
              </Field>
              {lesson.type !== "text" && (
                <>
                  <Field
                    label="External media URL"
                    hint="Use an HTTPS link, or upload a file below."
                    wide
                  >
                    <input
                      type="url"
                      value={lesson.source_url}
                      onChange={(event) =>
                        setLesson({ ...lesson, source_url: event.target.value })
                      }
                      placeholder="https://…"
                      pattern="https://.*"
                    />
                  </Field>
                  <div className="adm-field-wide adm-upload">
                    {lesson.media_id && (
                      <div className="adm-actions">
                        <File size={14} />
                        <a
                          href={`/api/media/${lesson.media_id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Attached media #{lesson.media_id} ↗
                        </a>
                        <button
                          type="button"
                          className="adm-quiet-link"
                          onClick={() =>
                            setLesson({ ...lesson, media_id: null })
                          }
                        >
                          Remove attachment
                        </button>
                      </div>
                    )}
                    <label>
                      <span>
                        {uploading
                          ? "Uploading your file…"
                          : "Upload lesson media"}
                      </span>
                      <input
                        type="file"
                        accept={
                          lesson.type === "video"
                            ? "video/mp4,video/webm"
                            : lesson.type === "audio"
                              ? "audio/mpeg,audio/mp4,audio/wav,audio/ogg"
                              : "application/pdf"
                        }
                        disabled={uploading || busy}
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          setLessonError("");
                          try {
                            const result = await uploadAdminFile(file);
                            setLesson((current) =>
                              current
                                ? {
                                    ...current,
                                    media_id: result.id,
                                    source_url: "",
                                  }
                                : null,
                            );
                          } catch (failure) {
                            setLessonError(errorMessage(failure));
                          } finally {
                            setUploading(false);
                            event.target.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>
                </>
              )}
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={lesson.is_published}
                  onChange={(event) =>
                    setLesson({ ...lesson, is_published: event.target.checked })
                  }
                />
                Publish this lesson
              </label>
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={lesson.is_preview}
                  onChange={(event) =>
                    setLesson({ ...lesson, is_preview: event.target.checked })
                  }
                />
                Offer as a free preview
              </label>
            </div>
            <div style={{ marginTop: 18 }}>
              <Notice>{lessonError}</Notice>
            </div>
            <div className="adm-dialog-actions">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                disabled={busy || uploading}
                onClick={() => setLesson(null)}
              >
                Cancel
              </button>
              <button className="adm-btn" disabled={busy || uploading}>
                {busy ? "Saving…" : "Save lesson"}
              </button>
            </div>
          </form>
        )}
      </AdminDialog>
    </>
  );
}
