import crypto from "crypto";
import { META_DATASET_ID } from "@/lib/constants";

/** Meta requires PII (email, phone) to be lowercased/trimmed and SHA-256
 * hashed before being sent to the Conversions API. */
function hashField(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

interface PurchaseCapiParams {
  /** Must exactly match the eventID passed to the browser fbq() call for
   * the same purchase — this is how Meta deduplicates Pixel + CAPI. */
  eventId: string;
  value: number;
  currency: string;
  eventSourceUrl: string;
  email?: string;
  phone?: string;
  firstName?: string;
  /** _fbp cookie, if present in the request */
  fbp?: string;
  /** _fbc cookie (or derived from the fbclid query param), if present */
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

interface CapiResult {
  sent: boolean;
  reason?: string;
}

/**
 * Sends a server-side Purchase event to Meta's Conversions API.
 *
 * Returns { sent: false, reason: "..." } instead of throwing when
 * META_CAPI_ACCESS_TOKEN isn't configured yet, so callers (the payment
 * verification route) can proceed without crashing the purchase flow —
 * the browser Pixel event still fires either way.
 */
export async function sendPurchaseCapiEvent(params: PurchaseCapiParams): Promise<CapiResult> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    return { sent: false, reason: "META_CAPI_ACCESS_TOKEN is not set" };
  }

  const userData: Record<string, string | undefined> = {
    em: hashField(params.email),
    ph: hashField(params.phone),
    fn: hashField(params.firstName),
    fbp: params.fbp,
    fbc: params.fbc,
    client_ip_address: params.clientIpAddress,
    client_user_agent: params.clientUserAgent,
  };
  // Strip undefined keys — Meta rejects fields it doesn't recognize as null.
  Object.keys(userData).forEach((key) => userData[key] === undefined && delete userData[key]);

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        action_source: "website",
        event_source_url: params.eventSourceUrl,
        user_data: userData,
        custom_data: {
          value: params.value,
          currency: params.currency,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${META_DATASET_ID}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Meta CAPI request failed:", errText);
      return { sent: false, reason: `Meta API error: ${errText}` };
    }

    return { sent: true };
  } catch (err) {
    console.error("Meta CAPI request error:", err);
    return { sent: false, reason: "Network error calling Meta CAPI" };
  }
}
