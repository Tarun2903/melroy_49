"use client";

import { useState } from "react";
import CtaButton from "./CtaButton";
import { BASE_PRICE, ORDER_BUMPS, ORIGINAL_PRICE } from "@/lib/constants";

const INCLUDED_ITEMS = [
  "Five private 1-on-1 coaching sessions",
  "Step-by-step implementation (we build together)",
  "AI prompts & templates library",
  "Product creation framework",
  "Sales funnel template",
  "Launch checklist",
  "Support throughout the challenge",
  "A repeatable framework for every future product",
];

export default function Included() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const total =
    BASE_PRICE +
    ORDER_BUMPS.reduce((sum, bump) => (checked[bump.id] ? sum + bump.price : sum), 0);

  return (
    <section id="included" style={{ paddingTop: 0 }} aria-labelledby="included-heading">
      <div className="wrap">
        <div className="included reveal">
          <span className="kicker" style={{ color: "var(--amber)" }}>
            Everything included for ₹{BASE_PRICE}
          </span>
          <h2 id="included-heading">Your complete build-and-launch stack</h2>
          <p className="sub">
            Not just calls — the exact assets and frameworks so you never wonder &quot;what do I
            do next?&quot;
          </p>
          <ul className="inc-grid">
            {INCLUDED_ITEMS.map((item) => (
              <li className="inc" key={item}>
                <span className="tick" aria-hidden="true">
                  ✔
                </span>
                {item}
              </li>
            ))}
          </ul>

          {/* Optional add-ons (order bumps). Checking a box updates the total
              shown below client-side only — wiring the selected total into an
              actual Razorpay charge happens in app/api/razorpay/create-order. */}
          <div className="addons">
            <h3 className="addons-title">Boost your order (optional)</h3>
            <ul className="addon-list">
              {ORDER_BUMPS.map((bump) => (
                <li className="addon" key={bump.id}>
                  <label>
                    <input
                      type="checkbox"
                      className="addon-check"
                      checked={!!checked[bump.id]}
                      onChange={(e) =>
                        setChecked((prev) => ({ ...prev, [bump.id]: e.target.checked }))
                      }
                    />
                    <span className="addon-copy">
                      <b>{bump.name}</b>
                      <span className="addon-desc">{bump.description}</span>
                    </span>
                    <span className="addon-price">+₹{bump.price}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="cta-line">
            <p className="price-tag price-tag--on-dark">
              <s>₹{ORIGINAL_PRICE.toLocaleString("en-IN")}</s>₹{total}{" "}
              <span className="price-tag__note">one-time</span>
            </p>
            <CtaButton label={`Get Everything for ₹${total}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
