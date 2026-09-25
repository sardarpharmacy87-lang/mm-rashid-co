"use client";

import Link from "next/link";
import { useState } from "react";

export function SupportChat() {
  const [open,setOpen] = useState(false);

  return (
    <div className={"support-chat " + (open ? "is-open" : "")}>
      {open ? (
        <div className="support-chat-panel" role="dialog" aria-label="Customer support">
          <div className="support-chat-head">
            <div>
              <strong>Hi there!</strong>
              <span>MM Rashid &amp; Co. support</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>
          <p>Ask about products, sizing, specifications, shipping, quotations, or an existing enquiry.</p>
          <div className="support-chat-actions">
            <Link href="/sign-in">Sign in</Link>
            <Link href="/customer">Customer account</Link>
            <a href="mailto:mmrashidco@hotmail.com">Email us</a>
          </div>
          <small>For quotations and order enquiries, login is required so your messages and rates remain private.</small>
        </div>
      ) : null}
      <button className="support-chat-toggle" type="button" onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">◌</span> Chat
      </button>
    </div>
  );
}
