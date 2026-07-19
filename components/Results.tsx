import Image from "next/image";
import { TESTIMONIALS } from "@/lib/constants";

export default function Results() {
  return (
    <section id="results" aria-labelledby="results-heading">
      <div className="wrap">
        <div className="center reveal">
          <h2 id="results-heading">Results from Past Participants</h2>
          <p className="sub">People who stopped watching tutorials — and shipped.</p>
        </div>
        <ul className="case-grid reveal-group">
          {TESTIMONIALS.map((t) => (
            <li className="case-card" key={t.name}>
              <span className="case-tag">{"★".repeat(t.rating)}</span>
              <h3 className="case-headline">&ldquo;{t.quote}&rdquo;</h3>
              <p className="case-client">{t.name}</p>
              <p className="case-business">{t.role}</p>
              <div className="case-shot">
                <Image
                  className="case-shot-img"
                  src={t.avatar}
                  alt={t.name}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 640px) 90vw, 45vw"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
