"use client";
import { useState, type FormEvent } from "react";
import {
  adminApi,
  errorMessage,
  displayDate,
  type AdminList,
  type AdminUser,
  type Course,
} from "@/components/admin/api";
import {
  AdminDialog,
  AdminHeading,
  Badge,
  ConfirmButton,
  Empty,
  Field,
  Loading,
  Notice,
  Pager,
  Panel,
  useAdminResource,
} from "@/components/admin/ui";
interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  user_name: string;
  user_email: string;
  course_title: string;
  status: string;
  source: string;
  created_at: string;
}
export default function AdminEnrollments() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [learnerSearch, setLearnerSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const resource = useAdminResource<AdminList<Enrollment>>(
    `enrollments?page=${page}&per_page=20&status=${status}&search=${encodeURIComponent(query)}`,
  );
  const people = useAdminResource<AdminList<AdminUser>>(
    open
      ? `users?role=student&per_page=50&search=${encodeURIComponent(learnerSearch)}`
      : null,
  );
  const courses = useAdminResource<AdminList<Course>>(
    open
      ? `courses?per_page=50&status=published&search=${encodeURIComponent(courseSearch)}`
      : null,
  );
  const grant = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await adminApi("enrollments", {
        method: "POST",
        body: {
          user_id: Number(userId),
          course_id: Number(courseId),
          source: "admin",
        },
      });
      setOpen(false);
      setSuccess(result.message || "Course access granted.");
      resource.refresh();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <AdminHeading
        eyebrow="Learning access"
        title="Enrollments"
        description="See who is learning, grant a place on a course, or revoke access when needed."
        actions={
          <button
            className="adm-btn"
            onClick={() => {
              setError("");
              setUserId("");
              setCourseId("");
              setOpen(true);
            }}
          >
            + Grant course access
          </button>
        }
      />
      <Notice>{(!open && error) || resource.error}</Notice>
      <Notice tone="success">{success}</Notice>
      <Panel>
        <div className="adm-toolbar">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setQuery(search.trim());
            }}
          >
            <input
              type="search"
              placeholder="Search learner or course…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search enrollments"
            />
            <button className="adm-btn adm-btn-secondary">Search</button>
          </form>
          <select
            style={{ width: "auto" }}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter enrollment status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
        {resource.loading ? (
          <Loading />
        ) : !resource.data?.items.length ? (
          <Empty
            title="No enrollments yet"
            description="Course access will appear here after a free enrollment, a completed payment, or an admin grant."
          />
        ) : (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Learner</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Granted</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {resource.data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.user_name}</strong>
                        <small>{item.user_email}</small>
                      </td>
                      <td>{item.course_title}</td>
                      <td>
                        <Badge>{item.status}</Badge>
                      </td>
                      <td>{item.source || "—"}</td>
                      <td>{displayDate(item.created_at)}</td>
                      <td>
                        {item.status === "active" && (
                          <ConfirmButton
                            title="Revoke this course access?"
                            description={`${item.user_name} will no longer be able to access ${item.course_title}.`}
                            className="adm-btn adm-btn-danger adm-btn-small"
                            onConfirm={async () => {
                              await adminApi(`enrollments/${item.id}`, {
                                method: "DELETE",
                              });
                              resource.refresh();
                              setSuccess("Course access revoked.");
                            }}
                          >
                            Revoke
                          </ConfirmButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager list={resource.data} page={page} onChange={setPage} />
          </>
        )}
      </Panel>
      <AdminDialog
        open={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        title="Grant course access"
      >
        <form onSubmit={grant} className="adm-form-stack">
          <Field label="Find a learner">
            <input
              type="search"
              placeholder="Search by name or email"
              value={learnerSearch}
              onChange={(event) => setLearnerSearch(event.target.value)}
            />
          </Field>
          <Field label="Learner">
            <select
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
            >
              <option value="">Choose a learner</option>
              {people.data?.items
                .filter((person) => person.is_active)
                .map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} · {person.email}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Find a published course">
            <input
              type="search"
              placeholder="Search course title"
              value={courseSearch}
              onChange={(event) => setCourseSearch(event.target.value)}
            />
          </Field>
          <Field label="Course">
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              required
            >
              <option value="">Choose a published course</option>
              {courses.data?.items.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </Field>
          <Notice>{error || people.error || courses.error}</Notice>
          <p className="adm-section-note">
            This grants access directly. It does not create a payment or charge
            the learner.
          </p>
          <div className="adm-dialog-actions">
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button className="adm-btn" disabled={busy}>
              {busy ? "Granting…" : "Grant access"}
            </button>
          </div>
        </form>
      </AdminDialog>
    </>
  );
}
