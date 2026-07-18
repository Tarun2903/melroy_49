import CtaButton from "./CtaButton";
import AnimatedCounter from "./AnimatedCounter";
import HeroVisual from "./HeroVisual";
import { BASE_PRICE, ORIGINAL_PRICE } from "@/lib/constants";

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="badge">
              <span className="dot" aria-hidden="true" />
              Private 1-on-1 · Limited spots per intake
            </span>
            <h1>
              Build &amp; Launch Your <span className="hl">AI Digital Product</span> in Just 5
              Days
            </h1>
            <p className="lede lede--tag">Limited Seats • Personal 1-on-1 Guidance</p>
            <ul className="no-list">
              <li>No coding</li>
              <li>No confusing tech</li>
              <li>No endless tutorials</li>
            </ul>
            <div className="price-row">
              <p className="price-tag">
                <s>₹{ORIGINAL_PRICE.toLocaleString("en-IN")}</s>₹{BASE_PRICE}
              </p>
            </div>
            <CtaButton label={`Reserve My Spot for ₹${BASE_PRICE}`} />
            <p className="hero-cta-note">Instant confirmation • Secured by Razorpay</p>
            <ul className="trust-strip">
              <li>
                <span className="stars" aria-hidden="true">
                  ★★★★★
                </span>{" "}
                <b>
                  <AnimatedCounter target={4.9} decimals={1} />
                </b>
                &nbsp;from past participants
              </li>
              <li>
                <b>1-on-1</b> — never a group webinar
              </li>
              <li>
                <b>
                  <AnimatedCounter target={100} suffix="%" />
                </b>{" "}
                money-back guarantee
              </li>
            </ul>
          </div>
          <HeroVisual />
        </div>
      </div>
    </header>
  );
}
