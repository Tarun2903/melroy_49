"use client";

import { useEffect, useRef, useState } from "react";
import CtaButton from "./CtaButton";
import { BASE_PRICE } from "@/lib/constants";

/** Slides up from the bottom once the visitor scrolls past the first CTA
 * button on the page (the hero's "Reserve My Spot" button), so it appears
 * right after that button leaves view rather than waiting for the whole
 * hero section to scroll past. */
export default function BuyBar() {
  const [show, setShow] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstCta = document.querySelector(".cta");
    if (!firstCta || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(firstCta);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`buybar${show ? " show" : ""}`}
      ref={barRef}
      aria-hidden={!show}
    >
      <p className="p">5-Day Challenge</p>
      <CtaButton label={`₹${BASE_PRICE} Reserve Spot`} />
    </div>
  );
}
