import { FAQS } from "@/lib/constants";

export default function Faq() {
  return (
    <section id="faq" style={{ paddingTop: 0 }} aria-labelledby="faq-heading">
      <div className="wrap">
        <div className="center reveal">
          <span className="kicker">Questions, answered</span>
          <h2 id="faq-heading">Frequently asked questions</h2>
        </div>
        <div className="faq">
          {FAQS.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <div className="a">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
