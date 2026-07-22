"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_PRICE, ORDER_BUMPS } from "@/lib/constants";
import { readCookie, waitForFbq } from "@/lib/metaPixel";
import { waitForRazorpay, type RazorpayHandlerResponse } from "@/lib/razorpayCheckout";
import WhatsAppCta from "./WhatsAppCta";

type Step = "form" | "bump1" | "bump2" | "success";

interface LeadInfo {
  name: string;
  email: string;
  phone: string;
}

/** Verified purchase data needed to fire the Meta Pixel Purchase event,
 * captured from the /api/payment/verify-order response. */
interface PurchaseData {
  value?: number;
  currency?: string;
  eventId: string;
  addonIds?: string[];
  purchasedItems?: string[];
}

/** Intercepts every `.cta` button click on the page (across all sections)
 * and opens this dialog instead of navigating straight to Razorpay. The
 * flow is: lead details -> one order-bump offer at a time -> checkout ->
 * success — all on this same page, never navigating away.
 *
 * On submitting details, the lead is POSTed to /api/leads (regardless of
 * whether that save succeeds, the flow continues — a lead-pipeline hiccup
 * never blocks a sale). The visitor then sees each order bump one at a
 * time; accepting or declining either one advances to the next step. Once
 * both are answered, a Razorpay order is created server-side for the exact
 * accepted total (so what they're charged matches what they agreed to) and
 * Razorpay Checkout.js opens as an in-page popup against that order — this
 * dialog closes first so the landing page is what's visible behind it. On a
 * successful payment, the payment is verified server-side and this dialog
 * reopens showing a success step instead of redirecting to a Thank You
 * page. If order creation fails, an inline error is shown so checkout never
 * silently breaks and the visitor is never sent to a hosted redirect page. */
export default function LeadModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const [source, setSource] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"pending" | "verified" | "unverified">("pending");
  // Guards against firing the Purchase event twice for the same payment.
  const firedRef = useRef(false);
  // Set right before this dialog is closed programmatically to open the
  // Razorpay popup — see handleDialogClose.
  const suppressCloseResetRef = useRef(false);

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
        // Previously `processing`/`submitting` were never reset here: if a
        // checkout attempt ever set that flag and the flow didn't complete
        // in this tab, every button stayed permanently disabled for the
        // rest of the session — including "Yes, add this" on a fresh
        // reopen. That was the reported bug.
        setStep("form");
        setSelectedBumps([]);
        setSubmitting(false);
        setProcessing(false);
        setLeadInfo(null);
        setCheckoutError(null);
        setPurchaseData(null);
        setVerifyStatus("pending");
        firedRef.current = false;
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
  // bump sequence never lingers into the next time the dialog opens. This
  // dialog is also closed programmatically right before Razorpay Checkout's
  // popup opens (see finalizeCheckout) so the landing page — not this
  // dialog — is what's visible behind it; suppressCloseResetRef distinguishes
  // that intentional, momentary close from a visitor actually dismissing the
  // dialog, so in-flight checkout state survives it.
  function handleDialogClose() {
    lastFocused.current?.focus();
    if (suppressCloseResetRef.current) {
      suppressCloseResetRef.current = false;
      return;
    }
    setStep("form");
    setSelectedBumps([]);
    setProcessing(false);
    setCheckoutError(null);
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

    // Stashed so the Thank You page can improve Meta CAPI match quality if
    // it's ever reached (see app/thank-you) — kept for compatibility, though
    // the primary flow no longer redirects there. Best-effort only.
    try {
      sessionStorage.setItem(
        "melroy_last_lead",
        JSON.stringify({ name: leadData.name, email: leadData.email, phone: leadData.phone })
      );
    } catch {
      // sessionStorage unavailable (private mode, quota) — non-fatal
    }

    // Used for the Razorpay Checkout prefill and the verify-order request.
    setLeadInfo({ name: leadData.name, email: leadData.email, phone: leadData.phone });

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
    setProcessing(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addonIds }),
      });
      const data: {
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        description?: string;
        error?: string;
      } = await res.json();

      if (!res.ok || !data.orderId || !data.keyId || !data.amount) {
        throw new Error(data.error ?? "Could not start checkout. Please try again.");
      }

      await waitForRazorpay();
      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        throw new Error("Payment could not load. Please check your connection and try again.");
      }

      // Close this dialog first so the landing page — not this dialog — is
      // what's visible behind Razorpay's popup (suppressCloseResetRef stops
      // the onClose handler from wiping the flow state we still need).
      suppressCloseResetRef.current = true;
      dialogRef.current?.close();

      const orderId = data.orderId;
      const amount = data.amount;
      const currency = data.currency ?? "INR";
      const razorpay = new RazorpayCtor({
        key: data.keyId,
        amount,
        currency,
        name: "Melroy — 5-Day AI Digital Product Challenge",
        description: data.description,
        order_id: orderId,
        prefill: {
          name: leadInfo?.name,
          email: leadInfo?.email,
          contact: leadInfo?.phone,
        },
        notes: { addon_ids: addonIds.join(",") },
        handler: (response: RazorpayHandlerResponse) => {
          handlePaymentSuccess(response);
        },
        modal: {
          // Visitor closed Razorpay's popup without paying — just clear the
          // processing flag; they can click a `.cta` button again to retry.
          ondismiss: () => {
            setProcessing(false);
          },
        },
      });
      razorpay.on("payment.failed", () => {
        // Razorpay's own popup already shows the visitor a failure message.
        setProcessing(false);
      });
      razorpay.open();
    } catch (err) {
      console.error("Checkout could not start:", err);
      setProcessing(false);
      setCheckoutError(
        err instanceof Error ? err.message : "Something went wrong starting checkout. Please try again."
      );
    }
  }

  async function handlePaymentSuccess(response: RazorpayHandlerResponse) {
    setStep("success");
    setVerifyStatus("pending");
    dialogRef.current?.showModal();

    try {
      const verifyRes = await fetch("/api/payment/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          email: leadInfo?.email,
          phone: leadInfo?.phone,
          firstName: leadInfo?.name?.split(" ")[0],
          fbp: readCookie("_fbp"),
          fbc: readCookie("_fbc"),
        }),
      });
      const data: {
        verified: boolean;
        eventId?: string;
        value?: number;
        currency?: string;
        addonIds?: string[];
        purchasedItems?: string[];
      } = await verifyRes.json();

      setProcessing(false);

      if (!data.verified || !data.eventId) {
        console.warn("Payment could not be verified — Purchase event not fired.");
        setVerifyStatus("unverified");
        return;
      }

      setVerifyStatus("verified");
      setPurchaseData({
        value: data.value,
        currency: data.currency,
        eventId: data.eventId,
        addonIds: data.addonIds,
        purchasedItems: data.purchasedItems,
      });

      // Fire immediately after verification succeeds — never before, never
      // if verification fails, and only once (firedRef + the same
      // localStorage key app/thank-you also uses, kept in sync in case that
      // page is ever reached for this same payment id).
      if (firedRef.current) return;
      const firedKey = `meta_purchase_fired_${response.razorpay_payment_id}`;
      if (localStorage.getItem(firedKey)) return;
      firedRef.current = true;

      const pixelReady = await waitForFbq();
      if (!pixelReady) {
        console.error(
          "Meta Pixel (fbq) never became available — browser Purchase event was not sent. " +
            "The server-side Conversions API event was still sent."
        );
        return;
      }

      // Same eventID (and the same content_ids/value/currency) as the
      // server sent to Meta CAPI — matching custom_data plus a shared
      // eventID is what lets Meta deduplicate the browser + server events
      // into one, rather than double-counting the purchase.
      window.fbq!(
        "track",
        "Purchase",
        {
          value: data.value,
          currency: data.currency,
          ...(data.addonIds && data.addonIds.length > 0
            ? { content_ids: data.addonIds, content_type: "product" }
            : {}),
        },
        { eventID: data.eventId }
      );
      localStorage.setItem(firedKey, JSON.stringify({ purchasedItems: data.purchasedItems ?? [] }));
    } catch (err) {
      console.error("Payment verification request failed:", err);
      setProcessing(false);
      setVerifyStatus("unverified");
    }
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
              disabled={processing}
              onClick={() => answerBump(bump1.id, true, bump2 ? "bump2" : null)}
            >
              <span className="label">Yes, add this</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={processing}
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
          {checkoutError && <p className="bump-desc" style={{ color: "#D64545" }}>{checkoutError}</p>}
          <div className="bump-actions">
            <button
              type="button"
              className="btn"
              disabled={processing}
              onClick={() => answerBump(bump2.id, true, null)}
            >
              <span className="label">{processing ? "Please wait…" : "Yes, add this"}</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={processing}
              onClick={() => answerBump(bump2.id, false, null)}
            >
              <span className="label">{processing ? "Please wait…" : "No thanks, take me to checkout"}</span>
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="lead-form">
          <button type="button" className="lead-close" aria-label="Close" onClick={handleClose}>
            &times;
          </button>
          <div className="ty-icon" aria-hidden="true">
            ✔
          </div>
          <h2 id="leadModalTitle" className="lead-title">
            Payment Successful
          </h2>
          <p className="lead-sub">
            Thank you for joining the 5-Day AI Digital Product Challenge. Check your email for your
            payment receipt and challenge details, then join the WhatsApp group below for your Day 1
            scheduling link.
          </p>
          {purchaseData?.purchasedItems && purchaseData.purchasedItems.length > 0 && (
            <p className="bump-desc">
              Your order also includes: <b>{purchaseData.purchasedItems.join(", ")}</b>
            </p>
          )}
          {verifyStatus === "unverified" && (
            <p className="bump-desc">
              We couldn&rsquo;t automatically confirm this payment just now — if you were charged,
              you&rsquo;re still all set. Message us in the WhatsApp group below and we&rsquo;ll sort it
              out.
            </p>
          )}
          <div className="bump-actions">
            <WhatsAppCta />
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              <span className="label">Close</span>
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
