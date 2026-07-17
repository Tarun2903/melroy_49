"use client";

import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  target: number;
  decimals?: number;
  suffix?: string;
}

/** Counts up from 0 to `target` once scrolled into view. Renders the final
 * value immediately (no animation) if the visitor prefers reduced motion. */
export default function AnimatedCounter({
  target,
  decimals = 0,
  suffix = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    if (!("IntersectionObserver" in window)) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    const animate = () => {
      const duration = 1200;
      let start: number | null = null;

      const step = (timestamp: number) => {
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate();
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [target, decimals, suffix]);

  return (
    <span className="counter" ref={ref}>
      {(0).toFixed(decimals) + suffix}
    </span>
  );
}
