const OUTCOMES = [
  {
    icon: "🧩",
    title: "A completed AI-powered digital product",
    body: "Built with AI, ready to sell — not a half-finished draft.",
  },
  {
    icon: "🌐",
    title: "A professional online presence",
    body: "A clean brand and page that makes people trust you.",
  },
  {
    icon: "📈",
    title: "A simple sales funnel",
    body: "A clear path from stranger → buyer, set up and working.",
  },
  {
    icon: "🗺️",
    title: "A clear launch plan",
    body: "A repeatable framework you can keep using after Day 5.",
  },
];

export default function Outcomes() {
  return (
    <section id="outcomes" aria-labelledby="outcomes-heading">
      <div className="wrap center">
        <span className="kicker">What you&rsquo;ll walk away with</span>
        <h2 id="outcomes-heading">
          In 5 days, you don&rsquo;t learn about it.
          <br />
          You&rsquo;ll have built it.
        </h2>
        <p className="sub">
          By the end of this challenge, all four of these exist — live, working, and yours.
        </p>
        <ul className="grid grid-4 reveal-group outcomes-grid">
          {OUTCOMES.map((o) => (
            <li className="card" key={o.title}>
              <div className="ico" aria-hidden="true">
                {o.icon}
              </div>
              <h3>{o.title}</h3>
              <p>{o.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
