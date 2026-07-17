"use client";

import { useEffect, useRef, useState } from "react";
import CtaButton from "./CtaButton";
import { BASE_PRICE, ORIGINAL_PRICE } from "@/lib/constants";

/** Slides up from the bottom on mobile once the visitor scrolls past the
 * hero. Mirrors the original vanilla-JS IntersectionObserver on `.hero`. */
export default function BuyBar() {
  const [show, setShow] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 }
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
      <p className="p">
        <s>₹{ORIGINAL_PRICE.toLocaleString("en-IN")}</s>₹{BASE_PRICE} · 5-Day Challenge
      </p>
      <CtaButton label="Reserve Spot" />
    </div>
  );
}
