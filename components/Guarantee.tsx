import { BASE_PRICE } from "@/lib/constants";

export default function Guarantee() {
  return (
    <section id="guarantee" aria-labelledby="guarantee-heading">
      <div className="wrap">
        <div className="guarantee reveal">
          <div className="seal" aria-hidden="true">
            100%
            <br />
            MONEY
            <br />
            BACK
          </div>
          <div>
            <h2 id="guarantee-heading">Try Day 1. If it&rsquo;s not for you, get every rupee back.</h2>
            <p>
              Attend your first session, and if you don&rsquo;t feel this challenge will get you
              to a launched product, just say the word — I&rsquo;ll refund your ₹{BASE_PRICE} in
              full. No forms, no friction, no hard feelings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
