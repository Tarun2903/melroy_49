"use client";

import { useEffect, useState } from "react";
import CtaButton from "./CtaButton";

const LINKS = [
  { href: "#roadmap", label: "Roadmap" },
  { href: "#results", label: "Results" },
  { href: "#included", label: "Included" },
  { href: "#faq", label: "FAQ" },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <nav className="topnav" aria-label="Primary">
      <div className="wrap inner">
        <a className="brand" href="#top">
          Melroy<span className="hl">.</span>
        </a>
        {/* Shown only on mobile (see .nav-mobile-text in globals.css), in
            place of the brand + "Reserve Spot" button, which are hidden at
            that breakpoint — the hamburger stays on the right either way. */}
        <span className="nav-mobile-text">Join Before Registration Closes</span>
        <ul className={`navlinks${open ? " open" : ""}`} id="navlinks">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          <CtaButton label="Reserve Spot" />
          <button
            type="button"
            className={`nav-toggle${open ? " is-active" : ""}`}
            aria-expanded={open}
            aria-controls="navlinks"
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        </div>
      </div>
    </nav>
  );
}
