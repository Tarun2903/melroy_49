declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Shared by every place that needs to read the Meta `_fbp`/`_fbc` cookies
 * for CAPI match quality (components/ThankYouContent.tsx, components/LeadModal.tsx). */
export function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** The Meta Pixel base snippet (components/MetaPixel.tsx) loads with
 * strategy="afterInteractive", so `window.fbq` isn't guaranteed to exist the
 * instant a caller wants to fire an event. Poll briefly instead of firing
 * (or silently skipping) immediately — the stub fbq() installs synchronously
 * the moment that script runs, so this only needs to cover a short
 * scheduling gap, not the full async fbevents.js network load. */
export function waitForFbq(timeoutMs = 8000, intervalMs = 100): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.fbq === "function") {
      resolve(true);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof window.fbq === "function") {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start >= timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, intervalMs);
  });
}
