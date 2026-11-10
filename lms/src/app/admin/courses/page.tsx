"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  AdminHeading,
  Badge,
  Empty,
  Loading,
  Notice,
  Pager,
  Panel,
  useAdminResource,
} from "@/components/admin/ui";
import {
  displayDate,
  money,
  type AdminList,
  type Course,
} from "@/components/admin/api";
export default function AdminCourses() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const { data, loading, error, refresh } = useAdminResource<AdminList<Course>>(
    `courses?page=${page}&per_page=20&search=${encodeURIComponent(query)}&status=${status}`,
  );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };
  return (
    <>
      <AdminHeading
        eyebrow="Learning library"
        title="Courses & practices"
        description="Build thoughtful learning journeys, from the first lesson to a complete practice."
        actions={
          <Link className="adm-btn" href="/admin/courses/new">
            + Create a course
          </Link>
        }
      />
      <Panel>
        <div className="adm-toolbar">
          <form onSubmit={submit}>
            <input
              type="search"
              placeholder="Search courses…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search courses"
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
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <Notice>{error}</Notice>
        {error && (
          <button className="adm-btn adm-btn-secondary" onClick={refresh}>
            Try again
          </button>
        )}
        {loading ? (
          <Loading />
        ) : !data?.items.length ? (
          <Empty
            title="Your library starts here"
            description="Create your first course, add a few lessons, and publish when it feels ready."
          >
            <Link className="adm-btn" href="/admin/courses/new">
              Create a course
            </Link>
          </Empty>
        ) : (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div className="adm-image-cell">
                          {course.image && <img src={course.image} alt="" />}
                          <div>
                            <strong>{course.title || "Untitled course"}</strong>
                            <small>
                              {course.instructor_name ||
                                "Instructor not assigned"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{course.category_name || "—"}</td>
                      <td>
                        {Number(course.price) ? money(course.price) : "Free"}
                      </td>
                      <td>
                        <Badge>{course.status}</Badge>
                      </td>
                      <td>
                        {displayDate(course.updated_at || course.created_at)}
                      </td>
                      <td>
                        <Link
                          className="adm-btn adm-btn-secondary adm-btn-small"
                          href={`/admin/courses/${course.id}`}
                        >
                          Edit course
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager list={data} page={page} onChange={setPage} />
          </>
        )}
      </Panel>
    </>
  );
}
