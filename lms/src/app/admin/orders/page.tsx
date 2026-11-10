"use client";
import { useEffect, useState } from "react";
import {
  adminApi,
  displayDate,
  errorMessage,
  money,
  type AdminList,
} from "@/components/admin/api";
import {
  AdminDialog,
  AdminHeading,
  Badge,
  ConfirmButton,
  Empty,
  Loading,
  Notice,
  Pager,
  Panel,
  useAdminResource,
} from "@/components/admin/ui";
interface Order {
  id: number;
  order_number: string;
  user_name: string;
  user_email: string;
  amount: number | string;
  currency: string;
  status: string;
  payment_method: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  proof_media_id?: number;
  payment_proof_id?: number;
  proof_url?: string;
  items?: {
    id?: number;
    course_title?: string;
    title?: string;
    amount?: number;
    price?: number;
    price_at_purchase?: number;
  }[];
}
export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const resource = useAdminResource<AdminList<Order>>(
    `orders?page=${page}&per_page=20&status=${status}&search=${encodeURIComponent(query)}`,
  );
  const detail = useAdminResource<Order>(
    selected ? `orders/${selected}` : null,
  );
  useEffect(() => {
    const value = Number(
      new URLSearchParams(window.location.search).get("order"),
    );
    if (value > 0) setSelected(value);
  }, []);
  const order =
    detail.data?.id === selected
      ? detail.data
      : resource.data?.items.find((item) => item.id === selected);
  const proof =
    order?.proof_url ||
    (order?.proof_media_id || order?.payment_proof_id
      ? `/api/media/${order.proof_media_id || order.payment_proof_id}`
      : "");
  const review = async (action: "approve" | "reject") => {
    if (!selected) return;
    setError("");
    const response = await adminApi(`orders/${selected}/${action}`, {
      method: "POST",
      body: { notes },
    });
    setNotice(
      response.message ||
        (action === "approve"
          ? "Payment approved and course access granted."
          : "Payment rejected."),
    );
    detail.refresh();
    resource.refresh();
  };
  return (
    <>
      <AdminHeading
        eyebrow="Payments & access"
        title="Orders"
        description="Review real payments, follow each order, and help learners begin their practice."
      />
      <Notice>{resource.error || error}</Notice>
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
              placeholder="Search order or learner…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search orders"
            />
            <button className="adm-btn adm-btn-secondary">Search</button>
          </form>
          <select
            value={status}
            style={{ width: "auto" }}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter order status"
          >
            <option value="">All statuses</option>
            {[
              "pending",
              "awaiting_review",
              "paid",
              "rejected",
              "cancelled",
              "refunded",
            ].map((value) => (
              <option value={value} key={value}>
                {value.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        {resource.loading ? (
          <Loading />
        ) : !resource.data?.items.length ? (
          <Empty
            title="No orders to show"
            description="Completed checkouts and manual payment submissions will appear here."
          />
        ) : (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Learner</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Placed</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {resource.data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.order_number || `#${item.id}`}</strong>
                      </td>
                      <td>
                        <strong>{item.user_name}</strong>
                        <small>{item.user_email}</small>
                      </td>
                      <td>{money(item.amount, item.currency)}</td>
                      <td>{item.payment_method}</td>
                      <td>
                        <Badge>{item.status.replace("_", " ")}</Badge>
                      </td>
                      <td>{displayDate(item.created_at)}</td>
                      <td>
                        <button
                          className="adm-btn adm-btn-secondary adm-btn-small"
                          onClick={() => {
                            setSelected(item.id);
                            setNotes("");
                          }}
                        >
                          Review
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
        onClose={() => setSelected(null)}
        title={
          order
            ? `Order ${order.order_number || `#${order.id}`}`
            : "Order details"
        }
      >
        <Notice>{detail.error}</Notice>
        {detail.loading && !order ? (
          <Loading />
        ) : (
          order && (
            <>
              <div className="adm-summary-row">
                <span>Learner</span>
                <strong>
                  {order.user_name}
                  <small className="adm-muted" style={{ display: "block" }}>
                    {order.user_email}
                  </small>
                </strong>
              </div>
              <div className="adm-summary-row">
                <span>Amount</span>
                <strong>{money(order.amount, order.currency)}</strong>
              </div>
              <div className="adm-summary-row">
                <span>Status</span>
                <Badge>{order.status.replace("_", " ")}</Badge>
              </div>
              <div className="adm-summary-row">
                <span>Payment method</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="adm-summary-row">
                <span>Reference</span>
                <span>{order.payment_reference || "Not submitted"}</span>
              </div>
              <div className="adm-summary-row">
                <span>Placed</span>
                <span>{displayDate(order.created_at)}</span>
              </div>
              {order.items?.length ? (
                <div style={{ marginTop: 20 }}>
                  <h3>Courses</h3>
                  {order.items.map((item, index) => (
                    <div className="adm-summary-row" key={item.id || index}>
                      <span>{item.course_title || item.title}</span>
                      <span>
                        {item.amount !== undefined ||
                        item.price !== undefined ||
                        item.price_at_purchase !== undefined
                          ? money(
                              item.amount ??
                                item.price ??
                                item.price_at_purchase,
                              order.currency,
                            )
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              {proof && (
                <p style={{ marginTop: 20 }}>
                  <a
                    className="adm-quiet-link"
                    href={proof}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open payment proof ↗
                  </a>
                </p>
              )}
              {order.notes && (
                <div style={{ marginTop: 20 }}>
                  <h3>Payment notes</h3>
                  <p
                    className="adm-muted"
                    style={{
                      whiteSpace: "pre-wrap",
                      marginTop: 8,
                      fontSize: 12,
                    }}
                  >
                    {order.notes}
                  </p>
                </div>
              )}
              {order.payment_method === "manual" &&
                ["pending", "awaiting_review"].includes(order.status) && (
                  <div style={{ marginTop: 24 }}>
                    <Notice tone="info">
                      Check the payment against your bank or UPI records before
                      approving. Approval grants the learner access to the
                      purchased courses.
                    </Notice>
                    <label className="adm-field">
                      <span>Review notes</span>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Payment checked, or reason for rejection…"
                        maxLength={2000}
                      />
                    </label>
                    <div className="adm-dialog-actions">
                      <ConfirmButton
                        title="Reject this manual payment?"
                        description="The order will be marked rejected. This does not issue a bank refund."
                        onConfirm={() => review("reject")}
                      >
                        Reject payment
                      </ConfirmButton>
                      <ConfirmButton
                        title="Approve this payment?"
                        description="Confirm that the full payment has reached your account. Course access will be granted automatically."
                        className="adm-btn"
                        onConfirm={() => review("approve")}
                      >
                        Approve payment
                      </ConfirmButton>
                    </div>
                  </div>
                )}
            </>
          )
        )}
      </AdminDialog>
    </>
  );
}
