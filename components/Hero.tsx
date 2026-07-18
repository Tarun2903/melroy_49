import CtaButton from "./CtaButton";
import AnimatedCounter from "./AnimatedCounter";
import HeroVisual from "./HeroVisual";
import { BASE_PRICE } from "@/lib/constants";

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="badge">
              <span className="dot" aria-hidden="true" />
              Limited Seats • Personal 1-on-1 Guidance
            </span>
            <h1>
              Build &amp; Launch Your <span className="hl">AI Digital Product</span> in Just 5
              Days
            </h1>
            <p className="lede">
              A private 1-on-1 challenge where I&rsquo;ll personally guide you from idea to
              launch — one focused session a day, and you build alongside me.
            </p>
            <ul className="no-list">
              <li>No coding</li>
              <li>No confusing tech</li>
              <li>No endless tutorials</li>
            </ul>
            <CtaButton label={`Reserve My Spot for ₹${BASE_PRICE}`} />
            <p className="hero-cta-note">Instant confirmation • Secured by Razorpay</p>
            <ul className="trust-strip">
              <li>
                <b>
                  <AnimatedCounter target={4.9} decimals={1} />
                </b>{" "}
                <span className="stars" aria-hidden="true">
                  ★
                </span>
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
