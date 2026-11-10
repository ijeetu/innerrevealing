"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginLocalAccount, logoutLocalSession } from "@/utils/localAuth";
import {
  setToken,
  setUserData,
  logoutSuccess,
} from "@/redux/reducers/userSlice";
import { type AdminUser, errorMessage } from "@/components/admin/api";
import { Notice } from "@/components/admin/ui";
export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((result) => {
        if (["admin", "superadmin"].includes(result.data?.user?.role))
          router.replace("/admin");
      })
      .catch(() => {});
    return () => controller.abort();
  }, [router]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await loginLocalAccount(email.trim(), password);
      const user = result.data.user as typeof result.data.user & AdminUser;
      if (!["admin", "superadmin"].includes(user.role)) {
        await logoutLocalSession();
        dispatch(logoutSuccess());
        throw new Error(
          "This account does not have administrator access. Please use the learner sign-in on the website.",
        );
      }
      dispatch(setToken("web-session"));
      dispatch(setUserData(result.data.user));
      setPassword("");
      router.replace("/admin");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  return (
    <main className="adm-login">
      <section className="adm-login-story">
        <p className="adm-eyebrow">A space for meaningful learning</p>
        <h1>
          Care for the practice.
          <br />
          Support every learner.
        </h1>
        <p>
          Your private workspace for courses, people, and the everyday running
          of Inner Revealing.
        </p>
        <span>Inner Revealing Meditation Centre</span>
      </section>
      <section className="adm-login-card">
        <Link href="/" className="adm-login-logo">
          <img
            src="/inner-revealing-logo.png"
            width={1774}
            height={887}
            alt="Inner Revealing Meditation Centre"
          />
        </Link>
        <p className="adm-eyebrow">Centre administration</p>
        <h2>Welcome back</h2>
        <p className="adm-muted">Sign in with your administrator account.</p>
        <form onSubmit={submit}>
          <label className="adm-field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
              disabled={pending}
            />
          </label>
          <label className="adm-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={128}
              disabled={pending}
            />
          </label>
          <Notice>{error}</Notice>
          <button className="adm-btn" disabled={pending}>
            {pending ? "Signing in…" : "Sign in to your workspace"}
          </button>
        </form>
        <Link href="/" className="adm-quiet-link">
          ← Back to the website
        </Link>
      </section>
    </main>
  );
}
