export interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

/** components/LeadModal.tsx loads Razorpay's Checkout.js (app/layout.tsx)
 * with strategy="afterInteractive", so `window.Razorpay` isn't guaranteed to
 * exist the instant the visitor finishes the bump-offer steps. Poll briefly
 * instead of failing immediately — mirrors lib/metaPixel.ts's waitForFbq. */
export function waitForRazorpay(timeoutMs = 8000, intervalMs = 100): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay === "function") {
      resolve(true);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof window.Razorpay === "function") {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start >= timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, intervalMs);
  });
}
