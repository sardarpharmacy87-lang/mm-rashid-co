"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  function closePanel() {
    setOpen(false);
    toggleRef.current?.focus();
  }
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <div
      className={"support-chat " + (open ? "is-open" : "")}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) closePanel();
      }}
    >
      {open ? (
        <div
          id="workshop-contact-panel"
          className="support-chat-panel"
          role="dialog"
          aria-label="Contact the workshop"
        >
          <div className="support-chat-head">
            <div>
              <strong>Talk to the workshop</strong>
              <span>Monday–Sunday · 24 hours</span>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={closePanel}
              aria-label="Close contact options"
            >
              ×
            </button>
          </div>
          <p>
            Ask about products, sizing, specifications, shipping, quotations, or
            an existing enquiry.
          </p>
          <div className="support-chat-actions">
            <Link href="/contact" onClick={closePanel}>
              Contact details
            </Link>
            <a href="tel:+923343342223">Call the workshop</a>
            <a href="mailto:mmrashidco@hotmail.com">Email us</a>
            <Link href="/customer" onClick={closePanel}>
              Track your quotations
            </Link>
          </div>
          <small>
            Email or call us with your requirements. Sign in to keep track of
            your private quotations.
          </small>
        </div>
      ) : null}
      <button
        ref={toggleRef}
        className="support-chat-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="workshop-contact-panel"
        onClick={() => setOpen((value) => !value)}
      >
        Contact us
      </button>
    </div>
  );
}
