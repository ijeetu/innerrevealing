import AdminShell from "@/components/admin/AdminShell";
import "@/components/admin/admin.css";
export const metadata = {
  title: "Centre administration | Inner Revealing",
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
