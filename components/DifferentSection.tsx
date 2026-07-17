export default function DifferentSection() {
  return (
    <section style={{ paddingTop: 0 }} aria-labelledby="different-heading">
      <div className="wrap center narrow reveal">
        <span className="kicker">Why this is different</span>
        <h2 id="different-heading">
          Most programs teach concepts.
          <br />
          This one ships a product.
        </h2>
        <p className="sub different-lede">
          Courses hand you information and leave you alone with it. This challenge is designed
          to help you build something real — with personal guidance every step of the way.
          You&rsquo;re never stuck, because I&rsquo;m on the call with you.
        </p>
      </div>
    </section>
  );
}
