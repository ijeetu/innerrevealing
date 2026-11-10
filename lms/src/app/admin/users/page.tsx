"use client";
import { useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import {
  adminApi,
  errorMessage,
  displayDate,
  type AdminList,
  type AdminUser,
} from "@/components/admin/api";
import {
  AdminDialog,
  AdminHeading,
  Badge,
  Empty,
  Field,
  Loading,
  Notice,
  Pager,
  Panel,
  useAdminResource,
} from "@/components/admin/ui";
interface UserRow extends AdminUser {
  created_at?: string;
}
interface ResetLink {
  url: string;
  expiresAt: string;
  email_sent?: boolean;
}
export default function AdminUsers() {
  const { user } = useAdmin();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const resource = useAdminResource<AdminList<UserRow>>(
    `users?page=${page}&per_page=20&search=${encodeURIComponent(query)}&role=${role}`,
  );
  const [editing, setEditing] = useState<{
    id?: number;
    name: string;
    email: string;
    password: string;
    role: AdminUser["role"];
    is_active: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetLink, setResetLink] = useState<ResetLink | null>(null);
  const open = (person?: UserRow) => {
    setError("");
    setEditing(
      person
        ? {
            id: person.id,
            name: person.name,
            email: person.email,
            password: "",
            role: person.role,
            is_active: Boolean(person.is_active),
          }
        : {
            name: "",
            email: "",
            password: "",
            role: "student",
            is_active: true,
          },
    );
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    setError("");
    try {
      const { id, password, ...details } = editing;
      const result = await adminApi<{ user: UserRow; reset_link?: ResetLink }>(
        id ? `users/${id}` : "users",
        {
          method: id ? "PATCH" : "POST",
          body: { ...details, ...(!id && password ? { password } : {}) },
        },
      );
      setEditing(null);
      setNotice(result.message || "Account saved.");
      if (result.data.reset_link) setResetLink(result.data.reset_link);
      resource.refresh();
      if (
        user &&
        id === user.id &&
        (editing.role !== user.role ||
          editing.email !== user.email ||
          !editing.is_active)
      )
        window.location.assign("/admin/login");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  const reset = async (person: UserRow, send_email = false) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await adminApi<ResetLink>(
        `users/${person.id}/reset-link`,
        { method: "POST", body: { send_email } },
      );
      setResetLink(result.data);
      setNotice(
        send_email
          ? result.data.email_sent
            ? `A password reset email was sent to ${person.email}.`
            : "A reset link was created. Email was not sent; check your SMTP settings."
          : "A private password reset link has been created.",
      );
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <AdminHeading
        eyebrow="Your community"
        title="People & access"
        description="Welcome learners, manage your team, and give each person the right level of access."
        actions={
          <button className="adm-btn" onClick={() => open()}>
            + Add a person
          </button>
        }
      />
      <Notice>{(!editing && error) || resource.error}</Notice>
      <Notice tone="success">{notice}</Notice>
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
              placeholder="Search name or email…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search people"
            />
            <button className="adm-btn adm-btn-secondary">Search</button>
          </form>
          <select
            style={{ width: "auto" }}
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            aria-label="Filter role"
          >
            <option value="">All roles</option>
            <option value="student">Learners</option>
            <option value="admin">Administrators</option>
            <option value="superadmin">Superadmins</option>
          </select>
        </div>
        {resource.loading ? (
          <Loading />
        ) : !resource.data?.items.length ? (
          <Empty
            title="No people found"
            description="New learners will appear when they register, or you can add an account here."
          />
        ) : (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {resource.data.items.map((person) => (
                    <tr key={person.id}>
                      <td>
                        <strong>
                          {person.name}
                          {person.id === user?.id ? " · You" : ""}
                        </strong>
                        <small>{person.email}</small>
                      </td>
                      <td>
                        <Badge>{person.role}</Badge>
                      </td>
                      <td>
                        <Badge>
                          {person.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>{displayDate(person.created_at)}</td>
                      <td>
                        <div className="adm-row-actions">
                          {user?.role === "superadmin" ||
                          person.role !== "superadmin" ? (
                            <>
                              <button
                                className="adm-btn adm-btn-secondary adm-btn-small"
                                onClick={() => open(person)}
                              >
                                Edit
                              </button>
                              <button
                                className="adm-btn adm-btn-secondary adm-btn-small"
                                disabled={busy}
                                onClick={() => void reset(person)}
                              >
                                Reset link
                              </button>
                              <button
                                className="adm-btn adm-btn-secondary adm-btn-small"
                                disabled={busy}
                                onClick={() => void reset(person, true)}
                              >
                                Email reset
                              </button>
                            </>
                          ) : (
                            <small>Superadmin managed</small>
                          )}
                        </div>
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
      <Panel title="A clear boundary of access">
        <p className="adm-section-note">
          Learners can access their own learning. Administrators manage courses
          and day-to-day operations. Superadmins also manage superadmin access
          and private integrations. The server checks permissions for every
          action.
        </p>
      </Panel>
      <AdminDialog
        open={Boolean(editing)}
        onClose={() => {
          if (!busy) setEditing(null);
        }}
        title={editing?.id ? "Edit account" : "Add a person"}
      >
        {editing && (
          <form onSubmit={save}>
            <div className="adm-form-grid">
              <Field label="Full name" wide>
                <input
                  value={editing.name}
                  onChange={(event) =>
                    setEditing({ ...editing, name: event.target.value })
                  }
                  required
                  maxLength={100}
                />
              </Field>
              <Field label="Email address" wide>
                <input
                  type="email"
                  value={editing.email}
                  onChange={(event) =>
                    setEditing({ ...editing, email: event.target.value })
                  }
                  required
                  maxLength={254}
                />
              </Field>
              <Field label="Access role">
                <select
                  value={editing.role}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      role: event.target.value as AdminUser["role"],
                    })
                  }
                >
                  <option value="student">Learner</option>
                  <option value="admin">Administrator</option>
                  {user?.role === "superadmin" && (
                    <option value="superadmin">Superadmin</option>
                  )}
                </select>
              </Field>
              <label className="adm-check" style={{ alignSelf: "center" }}>
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(event) =>
                    setEditing({ ...editing, is_active: event.target.checked })
                  }
                />
                Account is active
              </label>
              {!editing.id && (
                <Field
                  label="Initial password (optional)"
                  hint="Leave blank to generate a private password setup link. Share the link with the account holder."
                  wide
                >
                  <input
                    type="password"
                    value={editing.password}
                    onChange={(event) =>
                      setEditing({ ...editing, password: event.target.value })
                    }
                    minLength={10}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </Field>
              )}
            </div>
            <div style={{ marginTop: 18 }}>
              <Notice>{error}</Notice>
            </div>
            <div className="adm-dialog-actions">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="adm-btn" disabled={busy}>
                {busy ? "Saving…" : "Save account"}
              </button>
            </div>
          </form>
        )}
      </AdminDialog>
      <AdminDialog
        open={Boolean(resetLink)}
        onClose={() => setResetLink(null)}
        title="Private password reset link"
      >
        {resetLink && (
          <>
            <p className="adm-muted">
              Share this link only with the account holder. It expires{" "}
              {new Date(resetLink.expiresAt).toLocaleString("en-IN")} and can be
              used once.
            </p>
            <div className="adm-code">{resetLink.url}</div>
            <div className="adm-dialog-actions">
              <button
                className="adm-btn adm-btn-secondary"
                onClick={() => setResetLink(null)}
              >
                Done
              </button>
              <button
                className="adm-btn"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(resetLink.url);
                    setNotice("Reset link copied.");
                  } catch {
                    setNotice("Select the link above to copy it.");
                  }
                }}
              >
                Copy link
              </button>
            </div>
          </>
        )}
      </AdminDialog>
    </>
  );
}
