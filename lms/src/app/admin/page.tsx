"use client";
import Link from "next/link";
import {
  BookOpen,
  Users,
  GraduationCap,
  Receipt,
  Mail,
  Sparkles,
} from "lucide-react";
import {
  AdminHeading,
  Badge,
  Empty,
  Loading,
  Notice,
  Panel,
  useAdminResource,
} from "@/components/admin/ui";
import { displayDate, money } from "@/components/admin/api";
import { useAdmin } from "@/components/admin/AdminShell";
interface Dashboard {
  counts: {
    courses: number;
    published_courses: number;
    learners: number;
    active_enrollments: number;
    pending_orders: number;
    unread_contacts: number;
  };
  recent_orders: {
    id: number;
    order_number: string;
    user_name: string;
    user_email: string;
    amount: string | number;
    currency: string;
    status: string;
    created_at: string;
  }[];
}
export default function AdminOverview() {
  const { user } = useAdmin();
  const { data, loading, error, refresh } =
    useAdminResource<Dashboard>("dashboard");
  return (
    <>
      <AdminHeading
        eyebrow="Centre overview"
        title={`A thoughtful space, ${user?.name?.split(" ")[0] || "welcome"}.`}
        description="A clear view of your courses, learners, and the things that need your attention."
        actions={
          <Link className="adm-btn" href="/instructor/my-course/add-course">
            Create a course
          </Link>
        }
      />
      <Notice>{error}</Notice>
      {error && (
        <button className="adm-btn adm-btn-secondary" onClick={refresh}>
          Try again
        </button>
      )}
      {loading ? (
        <Loading />
      ) : (
        data && (
          <>
            <div className="adm-stats">
              {[
                {
                  label: "Total courses",
                  value: data.counts.courses,
                  href: "/instructor/my-course",
                  icon: BookOpen,
                },
                {
                  label: "Published practices",
                  value: data.counts.published_courses,
                  href: "/instructor/my-course?status=publish",
                  icon: Sparkles,
                },
                {
                  label: "Learners",
                  value: data.counts.learners,
                  href: "/admin/users",
                  icon: Users,
                },
                {
                  label: "Active enrollments",
                  value: data.counts.active_enrollments,
                  href: "/admin/enrollments",
                  icon: GraduationCap,
                },
                {
                  label: "Payments to review",
                  value: data.counts.pending_orders,
                  href: "/admin/orders",
                  icon: Receipt,
                },
                {
                  label: "Unread enquiries",
                  value: data.counts.unread_contacts,
                  href: "/admin/content?tab=contacts",
                  icon: Mail,
                },
              ].map(({ label, value, href, icon: Icon }) => (
                <div className="adm-stat" key={label}>
                  <span>
                    <Icon size={16} />
                    {label}
                  </span>
                  <strong>{value ?? 0}</strong>
                  <Link href={href}>View details →</Link>
                </div>
              ))}
            </div>
            <Panel
              title="Recent orders"
              description="The latest activity from your learners."
              actions={
                <Link className="adm-quiet-link" href="/admin/orders">
                  View all orders →
                </Link>
              }
            >
              {data.recent_orders.length ? (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Learner</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <Link href={`/admin/orders?order=${order.id}`}>
                              {order.order_number || `#${order.id}`}
                            </Link>
                          </td>
                          <td>
                            <strong>{order.user_name}</strong>
                            <small>{order.user_email}</small>
                          </td>
                          <td>{money(order.amount, order.currency)}</td>
                          <td>
                            <Badge>{order.status}</Badge>
                          </td>
                          <td>{displayDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  title="No orders yet"
                  description="New orders and payment reviews will appear here as learners join your courses."
                />
              )}
            </Panel>
          </>
        )
      )}
    </>
  );
}
