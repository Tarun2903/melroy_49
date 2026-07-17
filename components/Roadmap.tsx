import CtaButton from "./CtaButton";
import { BASE_PRICE } from "@/lib/constants";

const DAYS = [
  {
    icon: "⚡",
    title: "Find Your Product Idea",
    body: "Discover a product idea with real potential and create a clear plan for what you'll build.",
    outcome: "A validated product concept",
  },
  {
    icon: "🤖",
    title: "Build Your Product With AI",
    body: "Use AI to create your digital product with a practical, step-by-step workflow.",
    outcome: "Your first version is complete",
  },
  {
    icon: "🌐",
    title: "Build Your Brand & Online Presence",
    body: "Set up your brand, create a professional-looking online presence, and prepare your product for launch.",
    outcome: "Your business is ready to be seen",
  },
  {
    icon: "🚀",
    title: "Build Your Sales System",
    body: "Create a simple funnel so people can learn about your product and access it easily.",
    outcome: "Your sales system is ready",
  },
  {
    icon: "🔥",
    title: "Launch With Confidence",
    body: "Launch your product and leave with a practical action plan for your next steps.",
    outcome: "A live product + a repeatable framework",
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" style={{ paddingTop: 0 }} aria-labelledby="roadmap-heading">
      <div className="wrap">
        <div className="center reveal">
          <span className="kicker">Your 5-day roadmap</span>
          <h2 id="roadmap-heading">One focused build per day. Five days to launch.</h2>
          <p className="sub">
            Every day ends with something real. No fluff sessions, no theory marathons.
          </p>
        </div>
        <ol className="days reveal-group">
          {DAYS.map((day, i) => (
            <li className="day" key={day.title}>
              <div className="node">
                DAY
                <br />
                {i + 1}
              </div>
              <div className="box">
                <h3>
                  <span aria-hidden="true">{day.icon}</span> {day.title}
                </h3>
                <p>{day.body}</p>
                <span className="outcome">{day.outcome}</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="roadmap-cta">
          <CtaButton label={`Start My 5-Day Build — ₹${BASE_PRICE}`} />
        </div>
      </div>
    </section>
  );
}
