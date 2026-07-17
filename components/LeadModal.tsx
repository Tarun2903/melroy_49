"use client";

import { useEffect, useRef, useState } from "react";
import { PAYMENT_LINK } from "@/lib/constants";

/** Intercepts every `.cta` button click on the page (across all sections)
 * and opens this form instead of navigating straight to Razorpay. On submit
 * the lead is POSTed to /api/leads (see that route for the Supabase TODO)
 * and — regardless of whether the save succeeds — the visitor is then sent
 * on to PAYMENT_LINK, so a lead-pipeline hiccup never blocks a sale. */
export default function LeadModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || typeof dialog.showModal !== "function") return;

    const ctaButtons = document.querySelectorAll<HTMLElement>(".cta");
    const handlers: Array<{ el: HTMLElement; fn: (e: Event) => void }> = [];

    ctaButtons.forEach((btn) => {
      const fn = (e: Event) => {
        e.preventDefault();
        lastFocused.current = document.activeElement as HTMLElement;
        setSource(btn.textContent?.trim() ?? "");
        formRef.current?.reset();
        dialog.showModal();
        document.getElementById("leadName")?.focus();
      };
      btn.addEventListener("click", fn);
      handlers.push({ el: btn, fn });
    });

    return () => {
      handlers.forEach(({ el, fn }) => el.removeEventListener("click", fn));
    };
  }, []);

  function handleClose() {
    dialogRef.current?.close();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    const leadData = {
      name: (document.getElementById("leadName") as HTMLInputElement).value.trim(),
      phone: (document.getElementById("leadPhone") as HTMLInputElement).value.trim(),
      email: (document.getElementById("leadEmail") as HTMLInputElement).value.trim(),
      source,
      page: window.location.href,
    };

    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
    } catch (err) {
      console.error("Lead save failed (continuing to payment anyway):", err);
    } finally {
      setSubmitting(false);
    }

    dialogRef.current?.close();
    window.location.href = PAYMENT_LINK;
  }

  return (
    <dialog
      className="lead-modal"
      id="leadModal"
      ref={dialogRef}
      aria-labelledby="leadModalTitle"
      onClose={() => lastFocused.current?.focus()}
    >
      <form className="lead-form" id="leadForm" ref={formRef} noValidate onSubmit={handleSubmit}>
        <button type="button" className="lead-close" aria-label="Close" onClick={handleClose}>
          &times;
        </button>
        <h2 id="leadModalTitle" className="lead-title">
          Reserve your spot
        </h2>
        <p className="lead-sub">Add your details and you&rsquo;ll be taken straight to secure payment.</p>

        <label className="lead-field">
          <span>Full name</span>
          <input type="text" name="name" id="leadName" autoComplete="name" required />
        </label>
        <label className="lead-field">
          <span>Phone number</span>
          <input
            type="tel"
            name="phone"
            id="leadPhone"
            autoComplete="tel"
            inputMode="tel"
            pattern="[0-9+\-\s()]{7,15}"
            title="Enter a valid phone number"
            required
          />
        </label>
        <label className="lead-field">
          <span>Email address</span>
          <input type="email" name="email" id="leadEmail" autoComplete="email" required />
        </label>

        <button type="submit" className="btn lead-submit" disabled={submitting}>
          <span className="label">{submitting ? "Please wait…" : "Continue to Payment"}</span>
        </button>
        <p className="lead-note">
          Your details are used only to confirm your spot and contact you about the challenge.
        </p>
      </form>
    </dialog>
  );
}
