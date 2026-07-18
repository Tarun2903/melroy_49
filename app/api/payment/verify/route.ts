import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { sendPurchaseCapiEvent } from "@/lib/metaCapi";
import { BASE_PRICE, CURRENCY, ORDER_BUMPS } from "@/lib/constants";

/**
 * Verifies a Razorpay Payment Link redirect and, on first verification of a
 * given payment, fires the server-side Meta Purchase event (CAPI).
 *
 * Razorpay Payment Links redirect the browser back to a configured URL with
 * `razorpay_payment_id`, `razorpay_payment_link_id`,
 * `razorpay_payment_link_reference_id`, `razorpay_payment_link_status`, and
 * `razorpay_signature` query params. The signature is an HMAC-SHA256 of
 * `payment_link_id|reference_id|status|payment_id` keyed with the account's
 * key secret — this is the authoritative "payment actually succeeded"
 * check; nothing here should fire without it passing.
 *
 * See "Before you deploy" in the README for what needs to be configured
 * before this route can do anything (Razorpay keys + the Payment Link's
 * redirect URL).
 */

interface VerifyRequestBody {
  razorpay_payment_id?: string;
  razorpay_payment_link_id?: string;
  razorpay_payment_link_reference_id?: string;
  razorpay_payment_link_status?: string;
  razorpay_signature?: string;
  // Optional — forwarded from the lead captured earlier in the same
  // session, purely to improve Meta CAPI match quality. Never required.
  email?: string;
  phone?: string;
  firstName?: string;
  fbp?: string;
  fbc?: string;
}

function verifySignature(
  paymentLinkId: string,
  referenceId: string,
  status: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  const payload = `${paymentLinkId}|${referenceId}|${status}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function fetchAuthoritativeAmount(
  paymentId: string,
  keyId: string,
  keySecret: string
): Promise<{ amount: number; currency: string } | null> {
  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { amount: data.amount / 100, currency: data.currency };
  } catch {
    return null;
  }
}

/** Reads back which order bumps were included, from the `notes.addon_ids`
 * set when the link was created (see app/api/razorpay/create-payment-link).
 * Falls back to an empty list — e.g. for payments made through the static
 * PAYMENT_LINK fallback, which was never created with bump notes. */
async function fetchAddonIds(
  paymentLinkId: string,
  keyId: string,
  keySecret: string
): Promise<string[]> {
  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/payment_links/${paymentLinkId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const raw = data?.notes?.addon_ids;
    if (typeof raw !== "string" || raw.length === 0) return [];
    const knownIds = new Set(ORDER_BUMPS.map((b) => b.id));
    return raw.split(",").filter((id) => knownIds.has(id));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { verified: false, reason: "Razorpay is not configured yet (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)." },
      { status: 501 }
    );
  }

  let body: VerifyRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ verified: false, reason: "Invalid JSON body" }, { status: 400 });
  }

  const {
    razorpay_payment_id: paymentId,
    razorpay_payment_link_id: paymentLinkId,
    razorpay_payment_link_reference_id: referenceId,
    razorpay_payment_link_status: status,
    razorpay_signature: signature,
  } = body;

  if (!paymentId || !paymentLinkId || !referenceId || !status || !signature) {
    return NextResponse.json(
      { verified: false, reason: "Missing Razorpay redirect parameters" },
      { status: 400 }
    );
  }

  const isValid = verifySignature(paymentLinkId, referenceId, status, paymentId, signature, keySecret);
  if (!isValid || status !== "paid") {
    return NextResponse.json({ verified: false, reason: "Signature invalid or payment not completed" }, { status: 400 });
  }

  // Signature is authentic from here on — this really is a completed payment.
  const eventId = `purchase_${paymentId}`;
  const [authoritative, addonIds] = await Promise.all([
    fetchAuthoritativeAmount(paymentId, keyId, keySecret),
    fetchAddonIds(paymentLinkId, keyId, keySecret),
  ]);
  const value = authoritative?.amount ?? BASE_PRICE;
  const currency = authoritative?.currency ?? CURRENCY;
  const purchasedItems = ORDER_BUMPS.filter((b) => addonIds.includes(b.id)).map((b) => b.name);

  const supabase = getSupabaseClient();
  let alreadyProcessed = false;

  if (supabase) {
    const { error } = await supabase.from("purchases").insert([
      {
        razorpay_payment_id: paymentId,
        razorpay_payment_link_id: paymentLinkId,
        razorpay_payment_link_reference_id: referenceId,
        amount: value,
        currency,
        event_id: eventId,
        addon_ids: addonIds.join(","),
      },
    ]);
    // Postgres unique_violation — this payment was already recorded, so a
    // CAPI event was already sent for it. Don't send a second one.
    if (error) {
      if (error.code === "23505") {
        alreadyProcessed = true;
      } else {
        console.error("Failed to record purchase (continuing without idempotency guarantee):", error.message);
      }
    }
  } else {
    console.warn(
      "Supabase not configured — purchase idempotency cannot be guaranteed server-side for payment", paymentId
    );
  }

  if (!alreadyProcessed) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    await sendPurchaseCapiEvent({
      eventId,
      value,
      currency,
      eventSourceUrl: request.headers.get("referer") ?? "",
      email: body.email,
      phone: body.phone,
      firstName: body.firstName,
      fbp: body.fbp,
      fbc: body.fbc,
      clientIpAddress: forwardedFor?.split(",")[0]?.trim(),
      clientUserAgent: request.headers.get("user-agent") ?? undefined,
      contentIds: addonIds,
    });
  }

  return NextResponse.json({
    verified: true,
    eventId,
    value,
    currency,
    alreadyProcessed,
    addonIds,
    purchasedItems,
  });
}
