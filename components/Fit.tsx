import CtaButton from "./CtaButton";

const CHECKS = [
  "You want to create a digital product with AI — without learning to code.",
  "You prefer learning by building, not by watching hours of videos.",
  "You want personal guidance throughout the process, not a group webinar.",
  "You're ready to take action instead of endlessly consuming content.",
];

export default function Fit() {
  return (
    <section id="fit" aria-labelledby="fit-heading">
      <div className="wrap center">
        <span className="kicker">Is this challenge right for you?</span>
        <h2 id="fit-heading">This works if you check even one box</h2>
        <ul className="check-list reveal-group" style={{ textAlign: "left" }}>
          {CHECKS.map((text) => (
            <li className="check" key={text}>
              <span className="tick" aria-hidden="true">
                ✔
              </span>
              {text}
            </li>
          ))}
        </ul>
        <div className="fit-cta">
          <CtaButton label="Yes, That's Me — Reserve My Spot" />
        </div>
      </div>
    </section>
  );
}
