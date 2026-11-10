"use client";
import { useEffect, useState, type FormEvent } from "react";
import {
  adminApi,
  errorMessage,
  displayDate,
  uploadAdminFile,
  type AdminList,
  type Category,
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
  Pager,
  Panel,
  useAdminResource,
} from "./ui";
type Tab = "pages" | "faqs" | "categories" | "contacts";
interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  updated_at?: string;
}
interface Faq {
  id: number;
  question: string;
  answer: string;
  position: number;
  is_published: boolean | number;
}
interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: string;
  created_at: string;
}
export default function ContentManager() {
  const [tab, setTab] = useState<Tab>("pages");
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("tab");
    if (value && ["pages", "faqs", "categories", "contacts"].includes(value))
      setTab(value as Tab);
  }, []);
  return (
    <>
      <AdminHeading
        eyebrow="Your centre's voice"
        title="Pages & content"
        description="Keep your website helpful, current, and welcoming."
      />
      <div className="adm-tabs" role="tablist" aria-label="Content sections">
        {[
          { id: "pages", label: "Site pages" },
          { id: "faqs", label: "Frequently asked questions" },
          { id: "categories", label: "Practice categories" },
          { id: "contacts", label: "Contact enquiries" },
        ].map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id as Tab)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "contacts" ? (
        <Contacts />
      ) : (
        <ContentRecords key={tab} tab={tab} />
      )}
    </>
  );
}
function ContentRecords({ tab }: { tab: Exclude<Tab, "contacts"> }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const resource = useAdminResource<AdminList<Page | Faq | Category>>(
    `${tab}?page=${page}&per_page=20&search=${encodeURIComponent(query)}`,
  );
  const open = (item?: Page | Faq | Category) => {
    setError("");
    setEditing(
      item
        ? { ...item }
        : tab === "pages"
          ? { title: "", slug: "", content: "", status: "draft" }
          : {
              question: "",
              answer: "",
              position: (resource.data?.total || 0) + 1,
              is_published: false,
            },
    );
  };
  const update = (key: string, value: unknown) =>
    setEditing((current) => (current ? { ...current, [key]: value } : null));
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await adminApi(editing.id ? `${tab}/${editing.id}` : tab, {
        method: editing.id ? "PATCH" : "POST",
        body: editing,
      });
      setSuccess(result.message || "Content saved.");
      setEditing(null);
      resource.refresh();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Notice>{(!editing && error) || resource.error}</Notice>
      <Notice tone="success">{success}</Notice>
      <Panel
        title={
          tab === "pages"
            ? "Site pages"
            : tab === "faqs"
              ? "Frequently asked questions"
              : "Three focused practice categories"
        }
        description={
          tab === "categories"
            ? "Keep the library focused on your three core practices. Edit their names, introductions, or images here."
            : undefined
        }
        actions={
          tab !== "categories" && (
            <button className="adm-btn" onClick={() => open()}>
              + Add {tab === "pages" ? "page" : "question"}
            </button>
          )
        }
      >
        {tab !== "categories" && (
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
                aria-label="Search content"
                placeholder="Search content…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button className="adm-btn adm-btn-secondary">Search</button>
            </form>
          </div>
        )}
        {resource.loading ? (
          <Loading />
        ) : !resource.data?.items.length ? (
          <Empty
            title="Nothing here yet"
            description={
              tab === "categories"
                ? "The centre categories will appear after the database is initialised."
                : "Add your first piece of content when you are ready."
            }
          />
        ) : (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>
                      {tab === "faqs"
                        ? "Question"
                        : tab === "categories"
                          ? "Category"
                          : "Page"}
                    </th>
                    <th>Status</th>
                    <th>{tab === "faqs" ? "Position" : "URL slug"}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {resource.data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>
                          {"title" in item
                            ? item.title
                            : "question" in item
                              ? item.question
                              : item.name}
                        </strong>
                        {"description" in item && (
                          <small>{item.description?.slice(0, 100)}</small>
                        )}
                      </td>
                      <td>
                        <Badge>
                          {"status" in item
                            ? item.status
                            : "is_published" in item
                              ? item.is_published
                                ? "Published"
                                : "Draft"
                              : item.is_active
                                ? "Active"
                                : "Inactive"}
                        </Badge>
                      </td>
                      <td>{"position" in item ? item.position : item.slug}</td>
                      <td>
                        <div className="adm-row-actions">
                          <button
                            className="adm-btn adm-btn-secondary adm-btn-small"
                            onClick={() => open(item)}
                          >
                            Edit
                          </button>
                          {tab !== "categories" && (
                            <ConfirmButton
                              title={`Delete this ${tab === "pages" ? "page" : "question"}?`}
                              description="This permanently removes this content from the website."
                              className="adm-btn adm-btn-danger adm-btn-small"
                              onConfirm={async () => {
                                await adminApi(`${tab}/${item.id}`, {
                                  method: "DELETE",
                                });
                                resource.refresh();
                              }}
                            >
                              Delete
                            </ConfirmButton>
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
      <AdminDialog
        open={Boolean(editing)}
        onClose={() => {
          if (!busy && !uploading) setEditing(null);
        }}
        title={
          tab === "categories"
            ? "Edit practice category"
            : `${editing?.id ? "Edit" : "Add"} ${tab === "pages" ? "site page" : "question"}`
        }
      >
        {editing && (
          <form onSubmit={save}>
            <div className="adm-form-stack">
              {tab === "pages" ? (
                <>
                  <Field label="Page title">
                    <input
                      value={String(editing.title || "")}
                      onChange={(event) => update("title", event.target.value)}
                      required
                      maxLength={255}
                    />
                  </Field>
                  <Field
                    label="URL slug"
                    hint="For example: privacy-policy or about-our-centre."
                  >
                    <input
                      value={String(editing.slug || "")}
                      onChange={(event) => update("slug", event.target.value)}
                      required
                      maxLength={255}
                    />
                  </Field>
                  <Field label="Page content">
                    <textarea
                      rows={12}
                      value={String(editing.content || "")}
                      onChange={(event) =>
                        update("content", event.target.value)
                      }
                      required
                    />
                  </Field>
                  <Field label="Visibility">
                    <select
                      value={String(editing.status || "draft")}
                      onChange={(event) => update("status", event.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </Field>
                </>
              ) : tab === "faqs" ? (
                <>
                  <Field label="Question">
                    <input
                      value={String(editing.question || "")}
                      onChange={(event) =>
                        update("question", event.target.value)
                      }
                      required
                      maxLength={300}
                    />
                  </Field>
                  <Field label="Answer">
                    <textarea
                      rows={7}
                      value={String(editing.answer || "")}
                      onChange={(event) => update("answer", event.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Display position">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={Number(editing.position || 0)}
                      onChange={(event) =>
                        update("position", Number(event.target.value))
                      }
                    />
                  </Field>
                  <label className="adm-check">
                    <input
                      type="checkbox"
                      checked={Boolean(editing.is_published)}
                      onChange={(event) =>
                        update("is_published", event.target.checked)
                      }
                    />
                    Publish this question
                  </label>
                </>
              ) : (
                <>
                  <Field label="Category name">
                    <input
                      value={String(editing.name || "")}
                      onChange={(event) => update("name", event.target.value)}
                      required
                      maxLength={255}
                    />
                  </Field>
                  <Field label="URL slug">
                    <input
                      value={String(editing.slug || "")}
                      onChange={(event) => update("slug", event.target.value)}
                      required
                      maxLength={255}
                    />
                  </Field>
                  <Field label="Introduction">
                    <textarea
                      rows={4}
                      value={String(editing.description || "")}
                      onChange={(event) =>
                        update("description", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Image URL">
                    <input
                      value={String(editing.image || "")}
                      onChange={(event) => update("image", event.target.value)}
                    />
                  </Field>
                  <div className="adm-upload">
                    {editing.image ? (
                      <img src={String(editing.image)} alt="Category preview" />
                    ) : null}
                    <label>
                      {uploading ? "Uploading…" : "Upload a category image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploading}
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
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
                  <label className="adm-check">
                    <input
                      type="checkbox"
                      checked={Boolean(editing.is_active)}
                      onChange={(event) =>
                        update("is_active", event.target.checked)
                      }
                    />
                    Category is active
                  </label>
                </>
              )}
            </div>
            <div style={{ marginTop: 18 }}>
              <Notice>{error}</Notice>
            </div>
            <div className="adm-dialog-actions">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                disabled={busy || uploading}
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="adm-btn" disabled={busy || uploading}>
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </AdminDialog>
    </>
  );
}
function Contacts() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [nextStatus, setNextStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const resource = useAdminResource<AdminList<Contact>>(
    `contacts?page=${page}&per_page=20&status=${status}`,
  );
  const save = async () => {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await adminApi(`contacts/${selected.id}`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setSelected(null);
      setSuccess("Enquiry status updated.");
      resource.refresh();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Notice>{(!selected && error) || resource.error}</Notice>
      <Notice tone="success">{success}</Notice>
      <Panel
        title="Contact enquiries"
        actions={
          <select
            style={{ width: "auto" }}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter enquiry status"
          >
            <option value="">All enquiries</option>
            {["new", "read", "replied", "archived"].map((value) => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </select>
        }
      >
        {resource.loading ? (
          <Loading />
        ) : !resource.data?.items.length ? (
          <Empty
            title="No enquiries yet"
            description="Messages sent through your centre's contact form will appear here."
          />
        ) : (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {resource.data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <small>{item.email}</small>
                      </td>
                      <td>{item.subject || item.message.slice(0, 90)}</td>
                      <td>
                        <Badge>{item.status}</Badge>
                      </td>
                      <td>{displayDate(item.created_at)}</td>
                      <td>
                        <button
                          className="adm-btn adm-btn-secondary adm-btn-small"
                          onClick={() => {
                            setSelected(item);
                            setNextStatus(
                              item.status === "new" ? "read" : item.status,
                            );
                            setError("");
                          }}
                        >
                          Read message
                        </button>
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
        open={Boolean(selected)}
        onClose={() => {
          if (!busy) setSelected(null);
        }}
        title="Contact enquiry"
      >
        {selected && (
          <div className="adm-form-stack">
            <div>
              <strong>{selected.name}</strong>
              <p className="adm-muted">
                {selected.email}
                {selected.phone ? ` · ${selected.phone}` : ""}
              </p>
              <small className="adm-muted">
                {displayDate(selected.created_at)}
              </small>
            </div>
            {selected.subject && <h3>{selected.subject}</h3>}
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {selected.message}
            </p>
            <a
              className="adm-quiet-link"
              href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(`Re: ${selected.subject || "Your Inner Revealing enquiry"}`)}`}
            >
              Reply in your email app ↗
            </a>
            <Field label="Enquiry status">
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
              >
                {["new", "read", "replied", "archived"].map((value) => (
                  <option value={value} key={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
            <Notice>{error}</Notice>
            <div className="adm-dialog-actions">
              <button
                className="adm-btn"
                disabled={busy}
                onClick={() => void save()}
              >
                {busy ? "Saving…" : "Save status"}
              </button>
            </div>
          </div>
        )}
      </AdminDialog>
    </>
  );
}
