"use client";

import { useEffect } from "react";

/** Mounted once in the page. Scans the whole rendered DOM for `.reveal` and
 * `.reveal-group` elements and fades them in as they enter the viewport,
 * staggering direct children of `.reveal-group`. Renders nothing itself. */
export default function ScrollRevealInit() {
  useEffect(() => {
    const targets = document.querySelectorAll(".reveal, .reveal-group");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;

          if (el.classList.contains("reveal-group")) {
            Array.from(el.children).forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 70}ms`;
            });
          }

          el.classList.add("in-view");
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
