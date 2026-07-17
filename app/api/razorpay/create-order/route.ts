import { NextRequest, NextResponse } from "next/server";
import { BASE_PRICE, ORDER_BUMPS } from "@/lib/constants";

/**
 * Creates a Razorpay order for the base price plus any selected order bumps.
 *
 * Not called by the frontend yet — LeadModal still redirects to the static
 * PAYMENT_LINK. Wire this in once you're ready to move off the static link:
 * POST the selected addon ids here, get back an order id, then open Razorpay
 * Checkout.js with that order_id instead of redirecting.
 *
 * The amount is computed server-side from known addon ids (never trust a
 * client-supplied amount for a real charge) and requires RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET to be set (see .env.example).
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

  const amountInRupees =
    BASE_PRICE +
    ORDER_BUMPS.filter((bump) => addonIds.includes(bump.id)).reduce(
      (sum, bump) => sum + bump.price,
      0
    );

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
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.description ?? "Razorpay order creation failed" }, { status: 502 });
    }

    return NextResponse.json({ orderId: data.id, amount: data.amount, currency: data.currency });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ error: "Could not reach Razorpay" }, { status: 502 });
  }
}
