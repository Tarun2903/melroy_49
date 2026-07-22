"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import WhatsAppCta from "./WhatsAppCta";
import { readCookie, waitForFbq } from "@/lib/metaPixel";

type Status = "checking" | "no-payment-params" | "verifying" | "confirmed" | "unverified";

interface StashedLead {
  name?: string;
  email?: string;
  phone?: string;
}

/** Verified purchase data needed to fire the Meta Pixel Purchase event,
 * captured once /api/payment/verify confirms the payment. Firing itself is
 * deferred to the WhatsApp CTA click (see handleWhatsAppClick below). */
interface PurchaseData {
  value?: number;
  currency?: string;
  eventId: string;
  addonIds?: string[];
}

function readStashedLead(): StashedLead {
  try {
    const raw = sessionStorage.getItem("melroy_last_lead");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function ThankYouContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  // Guards against a rapid double-click firing twice within the same page
  // load, in addition to the cross-reload localStorage guard below.
  const firingRef = useRef(false);

  useEffect(() => {
    const paymentId = searchParams.get("razorpay_payment_id");

    if (!paymentId) {
      setStatus("no-payment-params");
      return;
    }

    const firedKey = `meta_purchase_fired_${paymentId}`;
    const cached = localStorage.getItem(firedKey);
    if (cached) {
      // Already confirmed + fired in this browser (e.g. page refresh) —
      // show the confirmed state again without re-verifying or re-firing.
      // (JSON.parse of the old plain "1" flag format from before this was
      // an object just yields the number 1, so `?.purchasedItems` is
      // safely undefined and falls back to [] — no crash on old data.)
      try {
        setPurchasedItems(JSON.parse(cached)?.purchasedItems ?? []);
      } catch {
        setPurchasedItems([]);
      }
      setStatus("confirmed");
      return;
    }

    setStatus("verifying");

    const lead = readStashedLead();
    const payload = {
      razorpay_payment_id: paymentId,
      razorpay_payment_link_id: searchParams.get("razorpay_payment_link_id"),
      razorpay_payment_link_reference_id: searchParams.get("razorpay_payment_link_reference_id"),
      razorpay_payment_link_status: searchParams.get("razorpay_payment_link_status"),
      razorpay_signature: searchParams.get("razorpay_signature"),
      email: lead.email,
      phone: lead.phone,
      firstName: lead.name?.split(" ")[0],
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
    };

    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(
        (data: {
          verified: boolean;
          eventId?: string;
          value?: number;
          currency?: string;
          addonIds?: string[];
          purchasedItems?: string[];
        }) => {
          if (!data.verified || !data.eventId) {
            console.warn("Payment could not be verified — Purchase event not fired.");
            setStatus("unverified");
            return;
          }

          // Purchase is only fired once the visitor clicks the WhatsApp CTA
          // (see handleWhatsAppClick) — stash the verified data here so that
          // handler has what it needs, but don't fire yet.
          setPurchaseData({
            value: data.value,
            currency: data.currency,
            eventId: data.eventId,
            addonIds: data.addonIds,
          });
          setPurchasedItems(data.purchasedItems ?? []);
          setStatus("confirmed");
        }
      )
      .catch((err) => {
        console.error("Payment verification request failed:", err);
        setStatus("unverified");
      });
    // Intentionally runs once on mount only — searchParams are read from
    // the URL at that point and this must not re-fire on re-renders.
  }, [searchParams]);

  // Fires the Meta Pixel Purchase event on the WhatsApp CTA click instead of
  // on page load — the previous "fire as soon as verification succeeds"
  // approach wasn't being tracked reliably. Still gated on a verified
  // payment, still fires at most once (localStorage + in-session ref guard),
  // still never fires for an unverified payment (purchaseData stays null),
  // and still uses the same eventID as the server-side CAPI call for dedup.
  const handleWhatsAppClick = () => {
    const paymentId = searchParams.get("razorpay_payment_id");
    if (!paymentId || !purchaseData || firingRef.current) return;

    const firedKey = `meta_purchase_fired_${paymentId}`;
    if (localStorage.getItem(firedKey)) return;

    firingRef.current = true;

    (async () => {
      const pixelReady = await waitForFbq();
      if (!pixelReady) {
        // Payment is verified and the server-side CAPI event already went
        // out — only the browser Pixel leg failed. Don't mark firedKey:
        // leaving it unset lets the visitor retry (e.g. re-clicking, or
        // reloading and clicking again) once the Pixel script is available.
        console.error(
          "Meta Pixel (fbq) never became available — browser Purchase event was not sent. " +
            "The server-side Conversions API event was still sent. This usually means the " +
            "Pixel script was blocked (ad blocker / browser privacy setting) or failed to load " +
            "(network issue) — check the Network tab for a blocked request to " +
            "connect.facebook.net/en_US/fbevents.js."
        );
        firingRef.current = false;
        return;
      }

      // Same eventID (and the same content_ids/value/currency) as the
      // server sent to Meta CAPI — matching custom_data plus a shared
      // eventID is what lets Meta deduplicate the browser + server
      // events into one, rather than double-counting the purchase.
      window.fbq!(
        "track",
        "Purchase",
        {
          value: purchaseData.value,
          currency: purchaseData.currency,
          ...(purchaseData.addonIds && purchaseData.addonIds.length > 0
            ? { content_ids: purchaseData.addonIds, content_type: "product" }
            : {}),
        },
        { eventID: purchaseData.eventId }
      );
      localStorage.setItem(firedKey, JSON.stringify({ purchasedItems }));
    })();
  };

  // Only show the private group link when there's at least payment evidence
  // in the URL (a real Razorpay redirect) — someone who just browsed here
  // directly with no payment params shouldn't get the group link.
  const hasPaymentEvidence = status === "confirmed" || status === "unverified";

  if (status === "no-payment-params") {
    return (
      <main className="ty-page">
        <div className="ty-card">
          <div className="ty-icon" aria-hidden="true">
            ✔
          </div>
          <h1>Looking for your confirmation?</h1>
          <p className="sub">
            We didn&rsquo;t find a payment reference on this page. If you&rsquo;ve just completed
            checkout, check your email for your receipt — it includes everything you need. If
            you haven&rsquo;t reserved your spot yet, head back to do that first.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="ty-page">
      <div className="ty-card">
        <div className="ty-icon" aria-hidden="true">
          ✔
        </div>
        <h1>You&rsquo;re in! Your seat is reserved.</h1>
        <p className="sub">
          Thank you for joining the 5-Day 1-on-1 AI Digital Product Challenge — we&rsquo;re
          genuinely excited to build with you.
        </p>

        {status === "confirmed" && purchasedItems.length > 0 && (
          <p className="ty-order">
            Your order also includes: <b>{purchasedItems.join(", ")}</b>
          </p>
        )}

        {hasPaymentEvidence && (
          <>
            <ul className="ty-steps">
              <li>
                <span className="num">1</span>
                <span>
                  <b>Check your email</b> for your payment receipt and challenge details.
                </span>
              </li>
              <li>
                <span className="num">2</span>
                <span>
                  <b>Join the WhatsApp group below</b> — that&rsquo;s where we&rsquo;ll share your
                  Day 1 scheduling link and keep you updated.
                </span>
              </li>
              <li>
                <span className="num">3</span>
                <span>
                  <b>Block time on Day 1</b> — come with an open mind, even if you don&rsquo;t
                  have a product idea yet.
                </span>
              </li>
            </ul>
            <WhatsAppCta onClick={handleWhatsAppClick} />
            {status === "unverified" && (
              <p className="ty-status">
                We couldn&rsquo;t automatically confirm this payment just now — if you were
                charged, you&rsquo;re still all set. Message us in the WhatsApp group above and
                we&rsquo;ll sort it out.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
