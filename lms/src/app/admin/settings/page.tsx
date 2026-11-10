"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import {
  adminApi,
  errorMessage,
  uploadAdminFile,
} from "@/components/admin/api";
import {
  AdminHeading,
  Field,
  Loading,
  Notice,
  Panel,
  useAdminResource,
} from "@/components/admin/ui";
import { setSettings } from "@/redux/reducers/settingsSlice";
import {useAdmin} from "@/components/admin/AdminShell";
import type { WebSettings } from "@/utils/api/general/getSettings";
type Settings = WebSettings & { [key: string]: unknown };
export default function AdminSettings() {
  const {user}=useAdmin();
  const isOwner=user?.role==='superadmin';
  const resource = useAdminResource<Settings>("settings");
  const [form, setForm] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dispatch = useDispatch();
  useEffect(() => {
    if (resource.data) setForm(resource.data);
  }, [resource.data]);
  const set = (key: string, value: unknown) =>
    setForm((current) => (current ? { ...current, [key]: value } : null));
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || busy) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const body:Record<string,unknown>={...form};
      if(!isOwner){delete body.refund_enabled;delete body.refund_period_days;}
      const result = await adminApi<Settings>("settings", {
        method: "PATCH",
        body,
      });
      setForm({ ...form, ...result.data });
      dispatch(setSettings({ ...form, ...result.data }));
      setSuccess("Centre settings saved.");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  if (resource.loading) return <Loading />;
  return (
    <>
      <AdminHeading
        eyebrow="Make it your own"
        title="Centre settings"
        description="The details and visual touches that make your website feel like Inner Revealing."
      />
      <Notice>{error || resource.error}</Notice>
      <Notice tone="success">{success}</Notice>
      {form && (
        <form onSubmit={save}>
          <div className="adm-editor-columns">
            <div>
              <Panel title="Centre details">
                <div className="adm-form-grid">
                  <Field label="Centre name" wide>
                    <input
                      value={String(form.app_name || "")}
                      onChange={(event) => {
                        set("app_name", event.target.value);
                        set("web_name", event.target.value);
                      }}
                      required
                      maxLength={100}
                    />
                  </Field>
                  <Field label="Contact email">
                    <input
                      type="email"
                      value={String(form.contact_email || "")}
                      onChange={(event) =>
                        set("contact_email", event.target.value)
                      }
                      required
                      maxLength={254}
                    />
                  </Field>
                  <Field label="Contact phone">
                    <input
                      type="tel"
                      value={String(form.contact_phone || "")}
                      onChange={(event) =>
                        set("contact_phone", event.target.value)
                      }
                      required
                      maxLength={30}
                    />
                  </Field>
                  <Field label="Centre address" wide>
                    <textarea
                      rows={3}
                      value={String(form.contact_address || "")}
                      onChange={(event) =>
                        set("contact_address", event.target.value)
                      }
                      maxLength={1000}
                    />
                  </Field>
                  <Field
                    label="Website address"
                    hint="The live site address is managed by the server configuration."
                    wide
                  >
                    <input value={String(form.website_url || "")} readOnly />
                  </Field>
                </div>
              </Panel>
              <Panel title="Refund policy" description="Configure the actual policy offered to learners. Only the centre owner can change these controls.">
                <div className="adm-form-stack">
                  <label className="adm-check"><input type="checkbox" disabled={!isOwner} checked={String(form.refund_enabled)==='1'} onChange={event=>set('refund_enabled',event.target.checked?'1':'0')}/>Allow learners to request refunds for paid courses</label>
                  <Field label="Request period (days)" hint="Counted from purchase. Set 0 for no automatic time limit."><input type="number" min={0} max={3650} disabled={!isOwner} value={String(form.refund_period_days||'0')} onChange={event=>set('refund_period_days',event.target.value)} required/></Field>
                  <p className="adm-section-note">Approval records a recommendation. A refund is complete only after the owner records the actual bank transfer or the gateway confirms it.</p>
                </div>
              </Panel>
              <Panel title="Website copy">
                <div className="adm-form-stack">
                  <Field label="Footer introduction">
                    <textarea
                      rows={4}
                      value={String(form.footer_description || "")}
                      onChange={(event) =>
                        set("footer_description", event.target.value)
                      }
                      maxLength={2000}
                    />
                  </Field>
                  <Field label="Copyright line">
                    <input
                      value={String(form.website_copyright || "")}
                      onChange={(event) =>
                        set("website_copyright", event.target.value)
                      }
                      maxLength={500}
                    />
                  </Field>
                  <Field
                    label="Announcement bar"
                    hint="Leave blank to hide the announcement."
                  >
                    <input
                      value={String(form.announcement_bar || "")}
                      onChange={(event) =>
                        set("announcement_bar", event.target.value)
                      }
                      maxLength={1000}
                    />
                  </Field>
                </div>
              </Panel>
              <Panel
                title="Social links"
                description="Add only the profiles you want to share publicly."
              >
                <div className="adm-form-stack">
                  {(form.social_media || []).map((social, index) => (
                    <div className="adm-actions" key={index}>
                      <input
                        style={{ flex: 1, minWidth: 120 }}
                        aria-label={`Social profile ${index + 1} name`}
                        placeholder="Profile name"
                        value={social.name}
                        onChange={(event) =>
                          set(
                            "social_media",
                            form.social_media.map((item, i) =>
                              i === index
                                ? { ...item, name: event.target.value }
                                : item,
                            ),
                          )
                        }
                        required
                        maxLength={40}
                      />
                      <input
                        style={{ flex: 2, minWidth: 180 }}
                        type="url"
                        pattern="https://.*"
                        aria-label={`Social profile ${index + 1} link`}
                        placeholder="https://…"
                        value={social.url || ""}
                        onChange={(event) =>
                          set(
                            "social_media",
                            form.social_media.map((item, i) =>
                              i === index
                                ? { ...item, url: event.target.value }
                                : item,
                            ),
                          )
                        }
                        required
                      />
                      <button
                        type="button"
                        className="adm-btn adm-btn-danger adm-btn-small"
                        onClick={() =>
                          set(
                            "social_media",
                            form.social_media.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div>
                    <button
                      type="button"
                      className="adm-btn adm-btn-secondary"
                      disabled={(form.social_media || []).length >= 8}
                      onClick={() =>
                        set("social_media", [
                          ...(form.social_media || []),
                          { id: Date.now(), name: "", url: "", icon: "" },
                        ])
                      }
                    >
                      + Add social link
                    </button>
                  </div>
                </div>
              </Panel>
            </div>
            <div>
              <Panel title="Your logo">
                <div className="adm-upload">
                  {form.horizontal_logo && (
                    <img
                      src={String(form.horizontal_logo)}
                      alt="Current centre logo"
                    />
                  )}
                  <label>
                    {uploading ? "Uploading…" : "Upload a logo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploading || busy}
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        setError("");
                        try {
                          const media = await uploadAdminFile(file, "image");
                          set("horizontal_logo", media.url);
                          set("vertical_logo", media.url);
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
                <div className="adm-form-stack" style={{ marginTop: 18 }}>
                  <Field label="Main logo URL">
                    <input
                      value={String(form.horizontal_logo || "")}
                      onChange={(event) => {
                        set("horizontal_logo", event.target.value);
                        set("vertical_logo", event.target.value);
                      }}
                    />
                  </Field>
                  <Field label="Favicon URL">
                    <input
                      value={String(form.favicon || "")}
                      onChange={(event) => set("favicon", event.target.value)}
                    />
                  </Field>
                </div>
              </Panel>
              <Panel title="Brand colours">
                <div className="adm-form-stack">
                  {[
                    { key: "system_color", label: "Primary violet" },
                    { key: "system_light_colour", label: "Soft background" },
                    { key: "hover_color", label: "Button hover" },
                  ].map(({ key, label }) => (
                    <Field key={key} label={label}>
                      <div className="adm-actions">
                        <input
                          type="color"
                          value={String(form[key] || "#5700b8")}
                          onChange={(event) => set(key, event.target.value)}
                          style={{ width: 50, padding: 3 }}
                        />
                        <input
                          value={String(form[key] || "")}
                          onChange={(event) => set(key, event.target.value)}
                          pattern="#[0-9a-fA-F]{6}"
                          required
                          style={{ flex: 1 }}
                          aria-label={`${label} hexadecimal colour`}
                        />
                      </div>
                    </Field>
                  ))}
                </div>
              </Panel>
              <Panel title="Site availability">
                <label className="adm-check">
                  <input
                    type="checkbox"
                    checked={String(form.maintaince_mode) === "1"}
                    onChange={(event) =>
                      set("maintaince_mode", event.target.checked ? "1" : "0")
                    }
                  />
                  Show maintenance mode to visitors
                </label>
                <p className="adm-section-note" style={{ marginTop: 12 }}>
                  Your admin workspace stays available while you make changes.
                </p>
              </Panel>
            </div>
          </div>
          <div className="adm-form-actions">
            <button className="adm-btn" disabled={busy || uploading}>
              {busy ? "Saving…" : "Save centre settings"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
