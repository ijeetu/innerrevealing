"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { adminApi, errorMessage } from "@/components/admin/api";
import {
  AdminHeading,
  Empty,
  Field,
  Loading,
  Notice,
  Panel,
  useAdminResource,
} from "@/components/admin/ui";
interface Integrations {
  manual_enabled: boolean;
  manual_instructions: string;
  upi_id: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  razorpay_enabled: boolean;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  razorpay_webhook_secret: string;
  smtp_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_username: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  razorpay_key_secret_set: boolean;
  razorpay_webhook_secret_set: boolean;
  smtp_password_set: boolean;
  [key: string]: unknown;
}
export default function AdminIntegrations() {
  const { user } = useAdmin();
  const allowed = user?.role === "superadmin";
  const resource = useAdminResource<Integrations>(
    allowed ? "integrations" : null,
  );
  const [form, setForm] = useState<Integrations | null>(null);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  useEffect(() => {
    if (resource.data)
      setForm({
        ...resource.data,
        razorpay_key_secret: "",
        razorpay_webhook_secret: "",
        smtp_password: "",
      });
  }, [resource.data]);
  const set = (key: string, value: unknown) =>
    setForm((current) => (current ? { ...current, [key]: value } : null));
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || busy) return;
    setBusy(true);
    setError("");
    setSuccess("");
    setTestResult(null);
    try {
      const body = Object.fromEntries(
        Object.entries(form).filter(([key]) => !key.endsWith("_set")),
      );
      const result = await adminApi<Integrations>("integrations", {
        method: "PUT",
        body,
      });
      setForm({
        ...result.data,
        razorpay_key_secret: "",
        razorpay_webhook_secret: "",
        smtp_password: "",
      });
      setSuccess("Integration settings saved. Private secrets remain hidden.");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  const test = async (service: "smtp" | "razorpay") => {
    if (testing || busy) return;
    setTesting(service);
    setTestResult(null);
    setError("");
    try {
      const result = await adminApi<{ ok: boolean; message: string }>(
        "integrations/test",
        { method: "POST", body: { service } },
      );
      setTestResult(result.data);
    } catch (failure) {
      setTestResult({ ok: false, message: errorMessage(failure) });
    } finally {
      setTesting("");
    }
  };
  if (!allowed)
    return (
      <>
        <AdminHeading
          title="Private integrations"
          description="Payment and email credentials are managed by the superadmin."
        />
        <Panel>
          <Empty
            title="Superadmin access required"
            description="Ask your centre's superadmin to manage payment methods and email delivery."
          />
        </Panel>
      </>
    );
  if (resource.loading) return <Loading />;
  const text = (key: string, label: string, hint?: string, type = "text") => (
    <Field label={label} hint={hint}>
      <input
        type={type}
        value={String(form?.[key] || "")}
        onChange={(event) => set(key, event.target.value)}
        maxLength={255}
      />
    </Field>
  );
  const secret = (key: string, label: string) => (
    <Field
      label={label}
      hint={
        form?.[`${key}_set`]
          ? "A secret is saved. Leave blank to keep it, or enter a new value to replace it."
          : "No secret has been saved yet."
      }
    >
      <input
        type="password"
        value={String(form?.[key] || "")}
        onChange={(event) => set(key, event.target.value)}
        autoComplete="new-password"
        maxLength={2048}
        placeholder={
          form?.[`${key}_set`]
            ? "Saved securely · enter a replacement"
            : "Enter the private secret"
        }
      />
      {Boolean(form?.[`${key}_set`]) && (
        <label className="adm-check">
          <input
            type="checkbox"
            checked={Boolean(form?.[`clear_${key}`])}
            onChange={(event) => set(`clear_${key}`, event.target.checked)}
          />
          Remove the saved secret on save
        </label>
      )}
    </Field>
  );
  return (
    <>
      <AdminHeading
        eyebrow="Connected with care"
        title="Payments & email"
        description="Set up the services your centre uses. Secrets are saved privately and are never displayed back to you."
      />
      <Notice>{error || resource.error}</Notice>
      <Notice tone="success">{success}</Notice>
      {testResult && (
        <Notice tone={testResult.ok ? "success" : "error"}>
          {testResult.message}
        </Notice>
      )}
      {form && (
        <form onSubmit={save}>
          <Panel
            title="Manual bank & UPI payments"
            description="Let learners submit a payment reference for your team to review."
          >
            <div className="adm-form-stack">
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={form.manual_enabled}
                  onChange={(event) =>
                    set("manual_enabled", event.target.checked)
                  }
                />
                Offer manual payments at checkout
              </label>
              <div className="adm-form-grid">
                {text("upi_id", "UPI ID")}
                {text("bank_account_name", "Bank account name")}
                {text("bank_account_number", "Bank account number")}
                {text("bank_ifsc", "IFSC code")}
                <Field
                  label="Payment instructions"
                  wide
                  hint="Shown to learners before they submit a payment reference."
                >
                  <textarea
                    rows={4}
                    value={form.manual_instructions}
                    onChange={(event) =>
                      set("manual_instructions", event.target.value)
                    }
                    maxLength={3000}
                  />
                </Field>
              </div>
            </div>
          </Panel>
          <Panel
            title="Razorpay"
            description="Accept online payments using your centre's own Razorpay account."
            actions={
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                disabled={busy || Boolean(testing)}
                onClick={() => void test("razorpay")}
              >
                {testing === "razorpay"
                  ? "Verifying…"
                  : "Test saved connection"}
              </button>
            }
          >
            <div className="adm-form-stack">
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={form.razorpay_enabled}
                  onChange={(event) =>
                    set("razorpay_enabled", event.target.checked)
                  }
                />
                Offer Razorpay at checkout
              </label>
              <div className="adm-form-grid">
                {text(
                  "razorpay_key_id",
                  "Razorpay key ID",
                  "Use your test keys for testing and live keys for live payments.",
                )}
                {secret("razorpay_key_secret", "Razorpay key secret")}
                {secret("razorpay_webhook_secret", "Webhook secret")}
              </div>
              <p className="adm-section-note">
                Save changes before testing. The connection test checks
                credentials and does not create a payment.
              </p>
            </div>
          </Panel>
          <Panel
            title="Email delivery · SMTP"
            description="Send account and learning emails from your centre's email service."
            actions={
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                disabled={busy || Boolean(testing)}
                onClick={() => void test("smtp")}
              >
                {testing === "smtp" ? "Verifying…" : "Test saved connection"}
              </button>
            }
          >
            <div className="adm-form-stack">
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={form.smtp_enabled}
                  onChange={(event) =>
                    set("smtp_enabled", event.target.checked)
                  }
                />
                Enable email delivery
              </label>
              <div className="adm-form-grid">
                {text("smtp_host", "SMTP host")}
                <Field label="SMTP port">
                  <input
                    type="number"
                    min="1"
                    max="65535"
                    value={form.smtp_port}
                    onChange={(event) =>
                      set("smtp_port", Number(event.target.value))
                    }
                    required
                  />
                </Field>
                {text("smtp_username", "SMTP username")}
                {secret("smtp_password", "SMTP password")}
                {text("smtp_from_email", "Sender email", undefined, "email")}
                {text("smtp_from_name", "Sender name")}
              </div>
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={form.smtp_secure}
                  onChange={(event) => set("smtp_secure", event.target.checked)}
                />
                Use direct TLS (commonly port 465)
              </label>
              <p className="adm-section-note">
                When direct TLS is off, the server requires STARTTLS. Save
                changes before testing. The test verifies the connection and
                does not send an email.
              </p>
            </div>
          </Panel>
          <div className="adm-form-actions">
            <button className="adm-btn" disabled={busy || Boolean(testing)}>
              {busy ? "Saving…" : "Save integration settings"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
