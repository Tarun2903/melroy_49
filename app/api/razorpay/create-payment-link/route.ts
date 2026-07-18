import { NextRequest, NextResponse } from "next/server";
import { BASE_PRICE, ORDER_BUMPS, SITE_URL } from "@/lib/constants";

/**
 * Creates a Razorpay Payment Link for the base price plus whichever order
 * bumps the visitor accepted in LeadModal's bump-offer steps, so the amount
 * actually charged matches what they were shown and agreed to.
 *
 * Same redirect-to-a-hosted-URL pattern as the existing static PAYMENT_LINK
 * (see lib/constants.ts) — no Checkout.js/SDK changes needed on the
 * frontend, just a different URL to redirect to.
 *
 * The amount is computed server-side from known addon ids (never trust a
 * client-supplied amount for a real charge) and requires RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET to be set. If those aren't configured, or the
 * Razorpay API call fails for any reason, this returns an error — the
 * caller (LeadModal) falls back to the static PAYMENT_LINK so checkout
 * never breaks even if this route has a problem.
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
    const res = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInRupees * 100, // Razorpay expects the amount in paise
        currency: "INR",
        description,
        callback_url: `${SITE_URL}/thank-you`,
        callback_method: "get",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.description ?? "Razorpay payment link creation failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: data.short_url, amount: amountInRupees });
  } catch (err) {
    console.error("Razorpay payment link creation error:", err);
    return NextResponse.json({ error: "Could not reach Razorpay" }, { status: 502 });
  }
}
