"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_PRICE, ORDER_BUMPS, PAYMENT_LINK } from "@/lib/constants";

type Step = "form" | "bump1" | "bump2";

/** Intercepts every `.cta` button click on the page (across all sections)
 * and opens this dialog instead of navigating straight to Razorpay. The
 * flow is: lead details -> one order-bump offer at a time -> checkout.
 *
 * On submitting details, the lead is POSTed to /api/leads (regardless of
 * whether that save succeeds, the flow continues — a lead-pipeline hiccup
 * never blocks a sale). The visitor then sees each order bump one at a
 * time; accepting or declining either one advances to the next step. Once
 * both are answered, a Razorpay Payment Link is created server-side for the
 * exact accepted total (so what they're charged matches what they agreed
 * to) and they're redirected there. If that call fails for any reason, this
 * falls back to the static PAYMENT_LINK so checkout never breaks. */
export default function LeadModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const [source, setSource] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

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
        // Reset every piece of flow state, not just step/selectedBumps —
        // this dialog is a singleton mounted once for the whole page, so
        // its state otherwise survives across separate open/close cycles.
        // Previously `redirecting`/`submitting` were never reset here: if a
        // checkout attempt ever set redirecting=true and the redirect
        // didn't complete in this tab (a failed request, or the browser
        // restoring this page from back/forward cache after the visitor
        // hit "back" from Razorpay), every button stayed permanently
        // disabled for the rest of the session — including "Yes, add this"
        // on a fresh reopen. That was the reported bug.
        setStep("form");
        setSelectedBumps([]);
        setSubmitting(false);
        setRedirecting(false);
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

  // Also reset on close (Escape, backdrop, the X button) so a half-finished
  // bump sequence never lingers into the next time the dialog opens.
  function handleDialogClose() {
    lastFocused.current?.focus();
    setStep("form");
    setSelectedBumps([]);
    setRedirecting(false);
  }

  function handleClose() {
    dialogRef.current?.close();
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      console.error("Lead save failed (continuing anyway):", err);
    } finally {
      setSubmitting(false);
    }

    // Stashed so the Thank You page can improve Meta CAPI match quality
    // (hashed email/phone) after the round trip to Razorpay and back.
    // Best-effort only — the purchase flow doesn't depend on this.
    try {
      sessionStorage.setItem(
        "melroy_last_lead",
        JSON.stringify({ name: leadData.name, email: leadData.email, phone: leadData.phone })
      );
    } catch {
      // sessionStorage unavailable (private mode, quota) — non-fatal
    }

    setStep("bump1");
  }

  function answerBump(bumpId: string, accepted: boolean, nextStep: Step | null) {
    const updatedSelection = accepted ? [...selectedBumps, bumpId] : selectedBumps;
    setSelectedBumps(updatedSelection);
    if (nextStep) {
      setStep(nextStep);
    } else {
      finalizeCheckout(updatedSelection);
    }
  }

  async function finalizeCheckout(addonIds: string[]) {
    setRedirecting(true);
    try {
      const res = await fetch("/api/razorpay/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addonIds }),
      });
      if (res.ok) {
        const data: { url?: string } = await res.json();
        if (data.url) {
          dialogRef.current?.close();
          window.location.href = data.url;
          return;
        }
      }
      console.warn("Dynamic payment link creation failed — falling back to static PAYMENT_LINK.");
    } catch (err) {
      console.error("Dynamic payment link request failed — falling back to static PAYMENT_LINK:", err);
    }
    // Only reached on the fallback path (the success path returns above) —
    // clear the flag before falling back so the buttons aren't left
    // disabled if this redirect is somehow interrupted too.
    setRedirecting(false);
    dialogRef.current?.close();
    window.location.href = PAYMENT_LINK;
  }

  const [bump1, bump2] = ORDER_BUMPS;
  const runningTotal =
    BASE_PRICE + ORDER_BUMPS.filter((b) => selectedBumps.includes(b.id)).reduce((sum, b) => sum + b.price, 0);

  return (
    <dialog
      className="lead-modal"
      id="leadModal"
      ref={dialogRef}
      aria-labelledby="leadModalTitle"
      onClose={handleDialogClose}
    >
      {step === "form" && (
        <form className="lead-form" id="leadForm" ref={formRef} noValidate onSubmit={handleFormSubmit}>
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
            <span className="label">{submitting ? "Please wait…" : "Continue"}</span>
          </button>
          <p className="lead-note">
            Your details are used only to confirm your spot and contact you about the challenge.
          </p>
        </form>
      )}

      {step === "bump1" && bump1 && (
        <div className="lead-form">
          <button type="button" className="lead-close" aria-label="Close" onClick={handleClose}>
            &times;
          </button>
          <span className="bump-badge">One-time offer</span>
          <h2 id="leadModalTitle" className="lead-title bump-name">
            Add {bump1.name}?
          </h2>
          <p className="bump-desc">{bump1.intro}</p>
          <ul className="bump-bullets">
            {bump1.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="bump-price">
            +₹{bump1.price} <span>added to your order today</span>
          </p>
          <p className="bump-total">Your total: ₹{runningTotal}</p>
          <div className="bump-actions">
            <button
              type="button"
              className="btn"
              disabled={redirecting}
              onClick={() => answerBump(bump1.id, true, bump2 ? "bump2" : null)}
            >
              <span className="label">Yes, add this</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={redirecting}
              onClick={() => answerBump(bump1.id, false, bump2 ? "bump2" : null)}
            >
              <span className="label">No thanks, continue</span>
            </button>
          </div>
        </div>
      )}

      {step === "bump2" && bump2 && (
        <div className="lead-form">
          <button type="button" className="lead-close" aria-label="Close" onClick={handleClose}>
            &times;
          </button>
          <span className="bump-badge">One more thing</span>
          <h2 id="leadModalTitle" className="lead-title bump-name">
            Add {bump2.name}?
          </h2>
          <p className="bump-desc">{bump2.intro}</p>
          <ul className="bump-bullets">
            {bump2.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="bump-price">
            +₹{bump2.price} <span>added to your order today</span>
          </p>
          <p className="bump-total">Your total: ₹{runningTotal}</p>
          <div className="bump-actions">
            <button
              type="button"
              className="btn"
              disabled={redirecting}
              onClick={() => answerBump(bump2.id, true, null)}
            >
              <span className="label">{redirecting ? "Please wait…" : "Yes, add this"}</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={redirecting}
              onClick={() => answerBump(bump2.id, false, null)}
            >
              <span className="label">{redirecting ? "Please wait…" : "No thanks, take me to checkout"}</span>
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
