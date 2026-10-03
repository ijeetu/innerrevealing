"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  MapPin,
  MessageCircle,
  Monitor,
  Phone,
  X,
} from "lucide-react";

export default function DemoBooking({
  interest,
  onClose,
}: {
  interest: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState("At the centre");
  const [draft, setDraft] = useState({ name: "", message: "" });
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    node?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = previous;
    };
  }, [interest]);
  useEffect(() => {
    const selector = whatsappUrl ? ".demo-ready .button" : 'input[name="name"]';
    dialog.current?.querySelector<HTMLElement>(selector)?.focus();
  }, [whatsappUrl]);
  const close = () => {
    dialog.current?.close();
    onClose();
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    if (!name) return;
    const message = `Hello Inner Revealing, my name is ${name}. I'd like to book a free demo session ${mode === "Online" ? "online" : "at the Kolkata centre"}. I'm interested in ${interest}. ${String(data.get("message") ?? "").trim()}`;
    setWhatsappUrl(
      `https://wa.me/919836147999?text=${encodeURIComponent(message)}`,
    );
  };
  return (
    <dialog
      className="demo-dialog"
      ref={dialog}
      aria-labelledby="demo-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            close();
        }
      }}
    >
      <div className="demo-dialog-body">
        <button
          className="dialog-close"
          aria-label="Close demo enquiry"
          onClick={close}
        >
          <X size={20} />
        </button>
        <span className="eyebrow">
          <span className="eyebrow-line" />
          YOUR FIRST STEP WITHIN
        </span>
        {whatsappUrl ? (
          <div className="demo-ready" role="status">
            <span className="demo-check">
              <Check size={26} />
            </span>
            <h2 id="demo-title">
              Your journey
              <br />
              <em>starts here.</em>
            </h2>
            <p>
              Your enquiry is ready. Send it to our team on WhatsApp to arrange
              your free demo session.
            </p>
            <a
              className="button button-primary"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} />
              Send on WhatsApp
              <ArrowUpRight size={17} />
            </a>
            <button className="demo-edit" onClick={() => setWhatsappUrl(null)}>
              Edit my enquiry
            </button>
            <a className="demo-call" href="tel:+919836147999">
              <Phone size={14} />
              Or call +91 98361 47999
            </a>
          </div>
        ) : (
          <>
            <h2 id="demo-title">
              Experience the
              <br />
              <em>peace within.</em>
            </h2>
            <p className="demo-intro">
              Begin with a free demo. We’ll understand your needs and help you
              find the right practice.
            </p>
            <form onSubmit={submit}>
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="given-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                  maxLength={80}
                  required
                  pattern={".*\\S.*"}
                  title="Please enter your name."
                  placeholder="What should we call you?"
                />
              </label>
              <fieldset>
                <legend>Where would you like to join?</legend>
                <div className="demo-mode-options">
                  {[
                    { label: "At the centre", icon: MapPin },
                    { label: "Online", icon: Monitor },
                  ].map((option) => (
                    <label
                      className={`demo-mode ${mode === option.label ? "selected" : ""}`}
                      key={option.label}
                    >
                      <input
                        type="radio"
                        name="mode"
                        value={option.label}
                        checked={mode === option.label}
                        onChange={() => setMode(option.label)}
                      />
                      <option.icon size={17} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>
                Anything you’d like us to know?
                <textarea
                  name="message"
                  value={draft.message}
                  onChange={(event) =>
                    setDraft({ ...draft, message: event.target.value })
                  }
                  rows={3}
                  maxLength={1200}
                  placeholder="Share a little about what brings you here (optional)."
                />
              </label>
              <span className="demo-interest">
                Interested in: <strong>{interest}</strong>
              </span>
              <button className="button button-primary" type="submit">
                Prepare my demo enquiry
                <ArrowUpRight size={17} />
              </button>
              <p className="demo-form-note">
                Continue to WhatsApp to send your enquiry directly to our team.
              </p>
            </form>
            <a className="demo-call" href="tel:+919836147999">
              <Phone size={14} />
              Prefer to talk? +91 98361 47999
            </a>
          </>
        )}
      </div>
    </dialog>
  );
}
