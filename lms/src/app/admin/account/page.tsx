"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { changeLocalPassword } from "@/utils/localAuth";
import { logoutSuccess } from "@/redux/reducers/userSlice";
import { AdminHeading, Field, Notice, Panel } from "@/components/admin/ui";
import { errorMessage } from "@/components/admin/api";
export default function AdminAccount() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (password !== confirmation) {
      setError("Your new passwords do not match.");
      return;
    }
    setPending(true);
    try {
      await changeLocalPassword(current, password, confirmation);
      dispatch(logoutSuccess());
      router.replace("/admin/login");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  return (
    <>
      <AdminHeading
        title="Password & security"
        description="Choose a unique password for your centre workspace. This change signs you out of every device."
      />
      <Panel title="Change your password">
        <form
          onSubmit={submit}
          className="adm-form-stack"
          style={{ maxWidth: 520 }}
        >
          <Field label="Current password">
            <input
              type="password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              required
              maxLength={128}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password" hint="Use at least 10 characters.">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={10}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              minLength={10}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </Field>
          <Notice>{error}</Notice>
          <div>
            <button className="adm-btn" disabled={pending}>
              {pending ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </Panel>
    </>
  );
}
