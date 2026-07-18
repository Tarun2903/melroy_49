"use client";

import { useEffect, useRef, useState } from "react";
import CtaButton from "./CtaButton";
import { BASE_PRICE } from "@/lib/constants";

/** Slides up from the bottom on mobile once the visitor scrolls past the
 * hero. Mirrors the original vanilla-JS IntersectionObserver on `.hero`.
 * On mobile the trigger uses a shrunk root (rootMargin) so it fires as soon
 * as the hero is mostly scrolled past, rather than waiting for every last
 * pixel of it (including the tall trust-strip footer) to leave the
 * viewport — desktop keeps the original full-exit trigger. */
export default function BuyBar() {
  const [show, setShow] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero || !("IntersectionObserver" in window)) return;

    const isMobile = window.matchMedia("(max-width: 899px)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0, rootMargin: isMobile ? "0px 0px -50% 0px" : "0px" }
    );
    observer.observe(hero);
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
