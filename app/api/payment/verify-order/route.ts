import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { sendPurchaseCapiEvent } from "@/lib/metaCapi";
import { CURRENCY, ORDER_BUMPS } from "@/lib/constants";

/**
 * Verifies a Razorpay Checkout.js payment (order_id + payment_id +
 * signature returned to the `handler` callback in components/LeadModal.tsx)
 * and, on first verification of a given payment, fires the server-side Meta
 * Purchase event (CAPI).
 *
 * This is the order-based counterpart to app/api/payment/verify — that
 * route verifies a Payment Link redirect signature
 * (`payment_link_id|reference_id|status|payment_id`); Checkout.js uses a
 * different, simpler signature formula (`order_id|payment_id`), documented
 * by Razorpay for client-side Checkout integrations. Kept as a separate
 * route rather than branching the existing one so neither verification path
 * changes behavior for the other.
 */

interface VerifyOrderRequestBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  // Optional — forwarded from the lead captured earlier in the same
  // session, purely to improve Meta CAPI match quality. Never required.
  email?: string;
  phone?: string;
  firstName?: string;
  fbp?: string;
  fbc?: string;
}

function verifySignature(orderId: string, paymentId: string, signature: string, keySecret: string): boolean {
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Fetches the order back from Razorpay so the charged amount, currency,
 * and addon_ids notes come from Razorpay's own record of the order — never
 * trust client-supplied amounts for what actually got charged. */
async function fetchOrder(
  orderId: string,
  keyId: string,
  keySecret: string
): Promise<{ amount: number; currency: string; status: string; notes?: Record<string, string> } | null> {
  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
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

  let body: VerifyOrderRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ verified: false, reason: "Invalid JSON body" }, { status: 400 });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = body;

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      { verified: false, reason: "Missing Razorpay checkout parameters" },
      { status: 400 }
    );
  }

  const isValid = verifySignature(orderId, paymentId, signature, keySecret);
  if (!isValid) {
    return NextResponse.json({ verified: false, reason: "Signature invalid" }, { status: 400 });
  }

  // Signature is authentic from here on — this really is a completed
  // payment against this order. Confirm with Razorpay's own record before
  // reporting a value/currency, and read back which bumps were purchased.
  const order = await fetchOrder(orderId, keyId, keySecret);
  if (!order || order.status !== "paid") {
    return NextResponse.json({ verified: false, reason: "Order not confirmed as paid" }, { status: 400 });
  }

  const eventId = `purchase_${paymentId}`;
  const value = order.amount / 100;
  const currency = order.currency || CURRENCY;
  const knownIds = new Set(ORDER_BUMPS.map((b) => b.id));
  const rawAddonIds = order.notes?.addon_ids;
  const addonIds =
    typeof rawAddonIds === "string" && rawAddonIds.length > 0
      ? rawAddonIds.split(",").filter((id) => knownIds.has(id))
      : [];
  const purchasedItems = ORDER_BUMPS.filter((b) => addonIds.includes(b.id)).map((b) => b.name);

  const supabase = getSupabaseClient();
  let alreadyProcessed = false;

  if (supabase) {
    const { error } = await supabase.from("purchases").insert([
      {
        razorpay_payment_id: paymentId,
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
