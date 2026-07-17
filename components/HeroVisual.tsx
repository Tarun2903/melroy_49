export default function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hv-glow hv-glow-a" />
      <div className="hv-glow hv-glow-b" />
      <div className="hv-panel">
        <div className="hv-row">
          <span className="hv-dot" />
          <span className="hv-dot" />
          <span className="hv-dot" />
        </div>
        <div className="hv-bar hv-bar-1" />
        <div className="hv-bar hv-bar-2" />
        <div className="hv-bar hv-bar-3" />
        <div className="hv-chart">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="hv-tag">₹49 · Launched</span>
      </div>
      <div className="hv-chip hv-chip-1">⚡ Idea</div>
      <div className="hv-chip hv-chip-2">🤖 Build</div>
      <div className="hv-chip hv-chip-3">🌐 Brand</div>
      <div className="hv-chip hv-chip-4">🚀 Launch</div>
    </div>
  );
}
