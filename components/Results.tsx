import Image from "next/image";
import { CASE_STUDIES } from "@/lib/constants";

export default function Results() {
  return (
    <section id="results" aria-labelledby="results-heading">
      <div className="wrap">
        <div className="center reveal">
          <span className="kicker">Results from past participants</span>
          <h2 id="results-heading">People who stopped watching tutorials — and shipped</h2>
        </div>
        <ul className="case-grid reveal-group">
          {CASE_STUDIES.map((cs) => (
            <li className="case-card" key={cs.client}>
              <span className="case-tag">Result</span>
              <h3 className="case-headline">{cs.headline}</h3>
              <p className="case-client">{cs.client}</p>
              <p className="case-business">{cs.business}</p>
              <div className="case-shot">
                <Image
                  className="case-shot-img"
                  src={cs.image}
                  alt={`${cs.client}, ${cs.business}`}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 640px) 90vw, 45vw"
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="center demo-note">A testimonial video is coming soon.</p>
      </div>
    </section>
  );
}
