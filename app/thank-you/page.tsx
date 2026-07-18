import { Suspense } from "react";
import type { Metadata } from "next";
import ThankYouContent from "@/components/ThankYouContent";

export const metadata: Metadata = {
  title: "You're In! — Melroy",
  description: "Your spot in the 5-Day AI Digital Product Challenge is reserved.",
  robots: { index: false, follow: false },
};

/** The single Thank You page for every successful purchase — see
 * components/ThankYouContent.tsx for the verification + Purchase event
 * logic. Wrapped in Suspense because that component uses useSearchParams(),
 * which the App Router requires a Suspense boundary for. */
export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}
