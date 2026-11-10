"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Loader2, X } from "lucide-react";
import { adminApi, errorMessage, type AdminList } from "./api";

export function useAdminResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    adminApi<T>(path, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(result.data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(errorMessage(failure));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, revision]);
  return { data, loading, error, refresh, setData };
}
export function AdminHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="adm-heading">
      <div>
        {eyebrow && <p className="adm-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="adm-actions">{actions}</div>}
    </div>
  );
}
export function Notice({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "success" | "info";
}) {
  return children ? (
    <div
      className={`adm-notice adm-notice-${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  ) : null;
}
export function Loading() {
  return (
    <div className="adm-loading" role="status">
      <Loader2 size={20} className="animate-spin" /> Loading your workspace…
    </div>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="adm-empty">
      <span className="adm-empty-mark">✦</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className={`adm-badge adm-badge-${String(children)
        .toLowerCase()
        .replace(/[^a-z]/g, "")}`}
    >
      {children}
    </span>
  );
}
export function Field({
  label,
  hint,
  children,
  wide = false,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const generatedId = useId();
  let controlId: string | undefined;
  const controls = Children.map(children, (child) => {
    if (
      !controlId &&
      isValidElement<{ id?: string; "aria-describedby"?: string }>(child) &&
      typeof child.type === "string" &&
      ["input", "select", "textarea"].includes(child.type)
    ) {
      controlId = child.props.id || generatedId;
      return cloneElement(child, {
        id: controlId,
        "aria-describedby":
          child.props["aria-describedby"] ||
          (hint ? `${generatedId}-hint` : undefined),
      });
    }
    return child;
  });
  return (
    <div className={`adm-field${wide ? " adm-field-wide" : ""}`}>
      <label htmlFor={controlId}>{label}</label>
      {controls}
      {hint && <small id={`${generatedId}-hint`}>{hint}</small>}
    </div>
  );
}
export function Panel({
  title,
  description,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="adm-panel">
      {(title || actions) && (
        <div className="adm-panel-heading">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
export function Pager({
  list,
  page,
  onChange,
}: {
  list: Pick<AdminList<unknown>, "total" | "total_pages"> | null;
  page: number;
  onChange: (page: number) => void;
}) {
  if (!list || list.total_pages < 2) return null;
  return (
    <div className="adm-pager">
      <span>
        {list.total} records · Page {page} of {list.total_pages}
      </span>
      <div>
        <button
          className="adm-btn adm-btn-secondary"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="adm-btn adm-btn-secondary"
          disabled={page >= list.total_pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
export function AdminDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="adm-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="adm-dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="adm-icon-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function ConfirmButton({
  children,
  title,
  description,
  onConfirm,
  className = "adm-btn adm-btn-danger",
}: {
  children: ReactNode;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        {children}
      </button>
      <AdminDialog
        open={open}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
        title={title}
      >
        <p className="adm-muted">{description}</p>
        <Notice>{error}</Notice>
        <div className="adm-dialog-actions">
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={
              className.includes("adm-btn-danger")
                ? "adm-btn adm-btn-danger"
                : "adm-btn"
            }
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setError("");
              try {
                await onConfirm();
                setOpen(false);
              } catch (failure) {
                setError(errorMessage(failure));
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? "Please wait…" : "Confirm"}
          </button>
        </div>
      </AdminDialog>
    </>
  );
}
