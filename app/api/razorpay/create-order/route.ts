import { NextRequest, NextResponse } from "next/server";
import { BASE_PRICE, ORDER_BUMPS } from "@/lib/constants";

/**
 * Creates a Razorpay order for the base price plus any selected order bumps.
 *
 * Called by components/LeadModal.tsx, which opens Razorpay Checkout.js
 * (an in-page popup) against the returned order_id instead of redirecting
 * to a hosted Payment Link page — the visitor never leaves the landing page.
 *
 * The amount is computed server-side from known addon ids (never trust a
 * client-supplied amount for a real charge) and requires RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET to be set (see .env.example). `keyId` is returned in
 * the response because Checkout.js needs it client-side to open the popup —
 * a Razorpay key_id is a public identifier by design (same role as a
 * Stripe publishable key), never the secret.
 */
export async function POST(request: NextRequest) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured yet (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)." },
      { status: 501 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const addonIds = Array.isArray((body as { addonIds?: unknown })?.addonIds)
    ? ((body as { addonIds: unknown[] }).addonIds.filter((id) => typeof id === "string") as string[])
    : [];

  const selectedBumps = ORDER_BUMPS.filter((bump) => addonIds.includes(bump.id));
  const amountInRupees = BASE_PRICE + selectedBumps.reduce((sum, bump) => sum + bump.price, 0);

  const description =
    selectedBumps.length > 0
      ? `5-Day 1-on-1 AI Digital Product Challenge + ${selectedBumps.map((b) => b.name).join(" + ")}`
      : "5-Day 1-on-1 AI Digital Product Challenge";

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInRupees * 100, // Razorpay expects the amount in paise
        currency: "INR",
        receipt: `melroy_${Date.now()}`,
        // Round-trips with the order and is readable later via the Orders
        // API — this is how app/api/payment/verify-order knows which bumps
        // were purchased, the same pattern create-payment-link already uses.
        notes: {
          addon_ids: selectedBumps.map((b) => b.id).join(","),
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.description ?? "Razorpay order creation failed" }, { status: 502 });
    }

    return NextResponse.json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
      description,
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ error: "Could not reach Razorpay" }, { status: 502 });
  }
}
