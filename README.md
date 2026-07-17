# Melroy — 5-Day 1-on-1 AI Digital Product Challenge

Landing page for a private 1-on-1 challenge. Static site, no build step required.

## Folder structure

```
.
├── index.html              Production page (semantic HTML5, SEO + a11y ready)
├── css/
│   └── style.css           All styles (variables, components, animations)
├── js/
│   └── main.js             Payment link wiring, mobile nav, sticky buy bar,
│                           scroll-reveal, animated counters
├── images/
│   ├── favicon.svg         Site icon (SVG, used for favicon + manifest)
│   ├── og-image.svg        Social share image source (see note below)
│   └── result-1.jpg…4.jpg  Client photos for the Results section case-study cards
├── fonts/
│   └── README.md           Notes on the current Google Fonts setup + how to self-host
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── index (1).html          Original single-file draft, kept for reference
```

## Before you deploy

1. **Payment link** — open `js/main.js` and replace `PAYMENT_LINK` with your real
   Razorpay (or other) checkout link.
2. **Lead capture → Supabase** — every `.cta` button now opens a modal
   (`#leadModal` in `index.html`) asking for name, phone, and email before
   sending the visitor to `PAYMENT_LINK`. Right now `saveLead()` in
   `js/main.js` just writes to `localStorage` (`melroy_leads`) and
   `console.log`s the entry — there's a `// TODO` at that exact spot marking
   where to swap in a real `supabase.from("leads").insert([data])` call once
   the project is connected. Until then, submissions aren't going anywhere
   permanent or visible to you except that browser's local storage.
3. **Domain** — `index.html`, `robots.txt`, and `sitemap.xml` use the placeholder
   domain `https://melroy.dev/`. Replace it with your real domain everywhere.
4. **Social image** — `images/og-image.svg` is an SVG source. Facebook/LinkedIn and
   some Twitter clients don't render SVG for link previews reliably, so export it
   to a 1200×630 PNG/JPG (e.g. open in a browser and screenshot, or run it through
   any SVG-to-PNG converter) and update the `og:image` / `twitter:image` meta tags
   in `index.html` to point at the PNG.
5. **Results / case studies** — the "Results" section is a 2×2 grid of dark
   case-study cards (`.case-card` in `css/style.css`): David Birtwistle, Satyam,
   Jatin Naren, and Jordan Lee, each with their stated result, business/niche,
   and photo (`images/result-1.jpg`…`result-4.jpg`). Per Tarun: these are real,
   verified clients who gave permission to be featured. A testimonial video is
   planned as a future addition — there's no dedicated slot for it yet, so add
   one when it's ready (e.g. an embedded player alongside or below this grid).

## Status vs. the Jul 2026 meeting notes

Done on the static site (no external accounts needed):
- Price updated from ₹99 → ₹49 everywhere (hero, all CTA buttons, included
  section, sticky buy bar, FAQ, meta tags, structured data).
- "Meet your coach" section removed per request.
- Order bumps added to the Included section — **Templates & Creatives (+₹90)**
  and **Full Access to Meeting Recordings & Notes (+₹19)** — as checkboxes with
  a live-updating total. This is display-only: the total isn't yet passed to a
  real charge (see below).
- Results section redesigned as a 2×2 dark case-study card grid (RESULT tag,
  headline, client, business, photo) per the agreed spec, populated with the
  four real client results and photos — see "Results / case studies" above.
- Every `.cta` button now opens a lead-capture modal (name/phone/email) before
  redirecting to Razorpay — see "Lead capture → Supabase" above for the exact
  TODO spot where the real Supabase insert goes.

Deliberately **not** done yet — flagged rather than guessed at, since these need
information or judgment calls only you can make:
- **Razorpay integration, Meta/Pixel event tracking, domain + SSL connection** —
  all need real credentials (API keys, Pixel ID) and a live domain. Wiring the
  order-bump total into an actual charge is part of this same pass.
- **Removing "unnecessary/low-converting" sections** — not touched; nothing was
  named as a specific cut, and guessing on deletions isn't safe on a project
  with no version control yet (no easy undo). Say which sections to cut and
  they'll come out.
- **Countdown timer / urgency deadline** — not added. A countdown needs a real
  batch-closing date; a fake one would be a dark pattern. The existing honest
  "limited spots" messaging was kept as-is.
- **Customer-count / results-screenshot trust stats** — not added, since no real
  numbers were provided and invented ones would be misleading.
- Refund-window / access-duration specifics for new FAQ entries — not added;
  provide the actual policy and they can be written in accurately.

## Notes

- Fonts are loaded from Google Fonts by default; see `fonts/README.md` for how to
  self-host.
- Design system: spacing follows an 8-point scale (`--sp-1`…`--sp-12` in
  `css/style.css`, 4px sub-steps), with matching type-scale, radius, and shadow
  tokens at the top of the file — change a token once, it updates everywhere.
- Animations respect `prefers-reduced-motion`; users with that setting see the
  final state immediately with no motion (reveal-on-scroll, hover transforms,
  the hero's floating chips, and the animated counters all short-circuit to
  their end state).
- The top nav collapses into an accessible slide-down menu below 760px
  (hamburger button with `aria-expanded`/`aria-controls`, closes on link click
  or <kbd>Esc</kbd>).
- The hero includes a decorative, `aria-hidden` visual panel (shown ≥900px
  only, so mobile stays fast and focused on the copy/CTA) and two animated
  counters (4.9 rating, 100% guarantee) that count up when scrolled into view.
- The FAQ accordion uses native `<details>/<summary>` — accessible and
  JS-independent.
- Structured data (`Course` + `FAQPage` JSON-LD) is included in `index.html` for
  richer search results — update pricing/copy there if it changes.
