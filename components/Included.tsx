import CtaButton from "./CtaButton";
import { BASE_PRICE, ORIGINAL_PRICE } from "@/lib/constants";

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

/** Order bumps (Templates & Creatives, Meeting Recordings) are no longer
 * shown upfront here — they're offered one at a time inside LeadModal,
 * after the visitor has entered their details and is already checking out.
 * See components/LeadModal.tsx and lib/constants.ts's ORDER_BUMPS. */
export default function Included() {
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

          <div className="cta-line">
            <p className="price-tag price-tag--on-dark">
              <s>₹{ORIGINAL_PRICE.toLocaleString("en-IN")}</s>₹{BASE_PRICE}{" "}
              <span className="price-tag__note">one-time</span>
            </p>
            <CtaButton label={`Get Everything for ₹${BASE_PRICE}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
