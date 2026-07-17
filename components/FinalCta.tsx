import CtaButton from "./CtaButton";
import { BASE_PRICE } from "@/lib/constants";

export default function FinalCta() {
  return (
    <section className="final" id="final-cta" aria-labelledby="final-heading">
      <div className="wrap reveal">
        <h2 id="final-heading">
          In 5 days, you could still be &quot;planning.&quot;
          <br />
          Or you could be launched.
        </h2>
        <p className="sub">Reserve your spot in the 5-Day 1-on-1 AI Digital Product Challenge.</p>
        <p className="spots">⚠ Only a limited number of 1-on-1 spots per intake</p>
        <div>
          <CtaButton
            label={`Reserve My Spot Now — ₹${BASE_PRICE}`}
            small="Backed by the 100% money-back guarantee"
            wide
          />
        </div>
      </div>
    </section>
  );
}
