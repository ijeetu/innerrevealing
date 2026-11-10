"use client";
import { useState } from "react";
import {
  recordDate,
  displayDate,
  type AdminList,
} from "@/components/admin/api";
import {
  AdminHeading,
  Empty,
  Loading,
  Notice,
  Pager,
  Panel,
  useAdminResource,
} from "@/components/admin/ui";
interface Audit {
  id: number;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: number | string;
  details: unknown;
  created_at: string;
}
export default function AdminAudit() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const resource = useAdminResource<AdminList<Audit>>(
    `audit?page=${page}&per_page=30&search=${encodeURIComponent(query)}`,
  );
  return (
    <>
      <AdminHeading
        eyebrow="Accountability"
        title="Activity log"
        description="A server-recorded history of changes across your centre workspace."
      />
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
              placeholder="Search activity…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search activity"
            />
            <button className="adm-btn adm-btn-secondary">Search</button>
          </form>
        </div>
        <Notice>{resource.error}</Notice>
        {resource.loading ? (
          <Loading />
        ) : !resource.data?.items.length ? (
          <Empty
            title="No activity to show"
            description="Course, access, and settings changes will be recorded here."
          />
        ) : (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Who</th>
                    <th>Action</th>
                    <th>Record</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {resource.data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {displayDate(item.created_at)}
                        <small>
                          {recordDate(item.created_at).toLocaleTimeString(
                            "en-IN",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </small>
                      </td>
                      <td>{item.actor_name || "System"}</td>
                      <td>{item.action.replace(/[._]/g, " ")}</td>
                      <td>
                        {item.entity_type}
                        {item.entity_id ? ` #${item.entity_id}` : ""}
                      </td>
                      <td>
                        {item.details ? (
                          <details>
                            <summary>View details</summary>
                            <pre className="adm-code">
                              {typeof item.details === "string"
                                ? item.details
                                : JSON.stringify(item.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          "—"
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
    </>
  );
}
