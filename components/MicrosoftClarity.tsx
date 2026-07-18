import Script from "next/script";
import { CLARITY_PROJECT_ID } from "@/lib/constants";

/**
 * Microsoft Clarity — heatmaps + session recordings, loaded on every page.
 *
 * Production only: `next dev` runs with NODE_ENV="development", so this
 * simply doesn't render locally, keeping real-visitor recordings free of
 * dev/test traffic. No env var needed for this gate — NODE_ENV is set
 * automatically by `next build`/`next start` vs. `next dev`.
 *
 * Uses next/script with strategy="afterInteractive", same as MetaPixel —
 * loads after the page is interactive, doesn't block initial render, and
 * doesn't need its own Suspense boundary since (unlike MetaPixel) this
 * component has no client-side hooks: Clarity's own tag already tracks SPA
 * route changes internally, so no route-change tracker is needed here.
 */
export default function MicrosoftClarity() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}
