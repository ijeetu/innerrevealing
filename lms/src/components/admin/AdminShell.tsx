"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Receipt,
  FileText,
  Plug,
  Settings,
  ScrollText,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { logoutLocalSession } from "@/utils/localAuth";
import { logoutSuccess } from "@/redux/reducers/userSlice";
import { errorMessage, type AdminUser } from "./api";
import { Loading, Notice } from "./ui";

const AdminContext = createContext<{ user: AdminUser | null }>({ user: null });
export const useAdmin = () => useContext(AdminContext);
const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/users", label: "People", icon: Users },
  { href: "/admin/enrollments", label: "Enrollments", icon: GraduationCap },
  { href: "/admin/orders", label: "Orders & payments", icon: Receipt },
  { href: "/admin/content", label: "Pages & content", icon: FileText },
  { href: "/admin/integrations", label: "Integrations", icon: Plug },
  { href: "/admin/settings", label: "Centre settings", icon: Settings },
  { href: "/admin/audit", label: "Activity log", icon: ScrollText },
];
export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const loginPage = pathname === "/admin/login";
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (loginPage) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        const current = result.data?.user as AdminUser | undefined;
        if (
          !response.ok ||
          !current ||
          !["admin", "superadmin"].includes(current.role)
        ) {
          router.replace("/admin/login");
          return;
        }
        setUser(current);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(errorMessage(failure));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [loginPage, router]);
  if (loginPage) return <div className="adm-root">{children}</div>;
  if (loading || !user)
    return (
      <div className="adm-root adm-gate">
        {error ? (
          <>
            <Notice>{error}</Notice>
            <button
              className="adm-btn"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </>
        ) : (
          <Loading />
        )}
      </div>
    );
  return (
    <AdminContext.Provider value={{ user }}>
      <div className="adm-root adm-workspace">
        {menuOpen && (
          <button
            className="adm-menu-scrim"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <aside className={`adm-sidebar ${menuOpen ? "is-open" : ""}`}>
          <Link
            href="/admin"
            className="adm-brand"
            aria-label="Inner Revealing admin home"
          >
            <img
              src="/inner-revealing-logo.png"
              width={1774}
              height={887}
              alt="Inner Revealing Meditation Centre"
            />
            <span>Centre workspace</span>
          </Link>
          <nav aria-label="Administration">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  (
                    href === "/admin"
                      ? pathname === href
                      : pathname.startsWith(href)
                  )
                    ? "page"
                    : undefined
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="adm-sidebar-bottom">
            <span className="adm-role">
              {user.role === "superadmin" ? "Superadmin" : "Administrator"}
            </span>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <Link href="/admin/account">Password & security</Link>
          </div>
        </aside>
        <div className="adm-main">
          <header className="adm-topbar">
            <div className="adm-topbar-label">
              <button
                className="adm-icon-btn adm-mobile-toggle"
                aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span>
                Inner Revealing{" "}
                <span className="adm-muted">/ Administration</span>
              </span>
            </div>
            <div className="adm-actions">
              <Link href="/" className="adm-quiet-link">
                View website <ExternalLink size={14} />
              </Link>
              <button
                className="adm-quiet-link"
                disabled={signingOut}
                onClick={async () => {
                  setSigningOut(true);
                  try {
                    await logoutLocalSession();
                    dispatch(logoutSuccess());
                    router.replace("/admin/login");
                  } catch (failure) {
                    setError(errorMessage(failure));
                  } finally {
                    setSigningOut(false);
                  }
                }}
              >
                <LogOut size={15} />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </header>
          <main className="adm-content">
            <Notice>{error}</Notice>
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
