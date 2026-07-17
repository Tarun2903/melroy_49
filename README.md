# Melroy — 5-Day 1-on-1 AI Digital Product Challenge

Landing page for a private 1-on-1 challenge. Built with **Next.js (App Router) +
TypeScript**, deployed for **Vercel**.

> This was originally a static HTML/CSS/JS site (still viewable at commit
> `aa43f0e`/`453e957` in git history). It was rebuilt on Next.js so the
> Supabase lead pipeline and Razorpay order creation could live in real,
> typed API routes instead of client-side placeholders.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint (flat config, TypeScript-aware)
```

Copy `.env.example` to `.env.local` and fill in real values before wiring up
Supabase/Razorpay (see "Before you deploy" below). Until then the site runs
fine with those two integrations in their placeholder state.

## Folder structure

```
.
├── app/
│   ├── layout.tsx          Root layout: next/font (self-hosted Google Fonts),
│   │                       SEO metadata (Metadata API), global CSS import
│   ├── page.tsx            Composes every section + the two JSON-LD blocks
│   ├── globals.css         Design tokens + all component styles (ported
│   │                       from the original style.css, unchanged behavior)
│   ├── robots.ts           Typed robots.txt generator
│   ├── sitemap.ts          Typed sitemap.xml generator
│   ├── manifest.ts         Typed web app manifest generator
│   └── api/
│       ├── leads/route.ts                    POST — validates + saves a lead
│       └── razorpay/create-order/route.ts    POST — creates a Razorpay order
│                                              (501 until keys are set)
├── components/             One file per section (Hero, Outcomes, Roadmap,
│                           Results, Fit, Included, Guarantee, Faq, FinalCta,
│                           Footer, TopNav, BuyBar, LeadModal, CtaButton,
│                           AnimatedCounter, HeroVisual, ScrollRevealInit)
├── lib/
│   ├── constants.ts        Single source of truth: price, order bumps,
│   │                       case-study data, site URL/title/description
│   └── supabase.ts         Client factory — returns null until env vars are set
├── public/
│   └── images/             favicon.svg, og-image.svg, result-1.jpg…4.jpg
├── .env.example             Documents the env vars the API routes expect
├── package.json / tsconfig.json / next.config.ts / eslint.config.mjs
└── README.md (this file)
```

Only three components are interactive ("use client"): `TopNav` (mobile menu),
`BuyBar` (sticky-on-scroll), `Included` (order-bump calculator), plus the
small reusable `AnimatedCounter`, `LeadModal`, and `ScrollRevealInit`. Everything
else is a plain server component — no client JS shipped for static content.

## Before you deploy

1. **Payment link** — `lib/constants.ts` exports `PAYMENT_LINK`, read from
   `NEXT_PUBLIC_PAYMENT_LINK` (see `.env.example`) with a placeholder fallback.
   Set the real Razorpay link there once you have it — or, better, finish
   wiring the Razorpay order-creation flow (see next point) and drop the
   static link entirely.
2. **Razorpay** — `app/api/razorpay/create-order/route.ts` is a real,
   working implementation (computes the amount server-side from `BASE_PRICE`
   + selected order-bump ids, calls Razorpay's Orders API) but returns `501`
   until `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are set. It is **not called
   by the frontend yet** — `LeadModal` still redirects to the static
   `PAYMENT_LINK` after a successful lead submission. Once you have real
   keys: set the env vars, then update `LeadModal`'s `handleSubmit` to POST
   to this route and open Razorpay Checkout.js with the returned order id
   instead of redirecting.
3. **Supabase** — `app/api/leads/route.ts` validates and receives every lead
   submission; `lib/supabase.ts` documents the exact two steps to connect it
   (`npm install @supabase/supabase-js`, fill in `.env.local`). Until then,
   leads are only `console.log`'d server-side — nothing is lost silently, but
   nothing is stored permanently either.
4. **Domain** — `lib/constants.ts`'s `SITE_URL` (`https://melroy.dev`) feeds
   the canonical URL, OG/Twitter tags, and the generated sitemap/robots.
   Update it there once, everywhere else follows.
5. **Social image** — `public/images/og-image.svg` is an SVG source. Facebook/
   LinkedIn and some Twitter clients don't render SVG for link previews
   reliably, so export it to a 1200×630 PNG/JPG and update the `openGraph`/
   `twitter` blocks in `app/layout.tsx` to point at it.
6. **Results / case studies** — `lib/constants.ts`'s `CASE_STUDIES` array:
   David Birtwistle, Satyam, Jatin Naren, and Jordan Lee, each with their
   stated result, business/niche, and photo. Per Tarun: these are real,
   verified clients who gave permission to be featured. A testimonial video
   is planned as a future addition — there's no dedicated slot for it yet.
7. **Known non-issue**: `npm audit` reports a moderate `postcss` advisory
   nested inside Next.js's own dependency tree. The suggested fix downgrades
   Next.js to a very old release, which is worse — left as-is; expect Vercel
   to bump the pinned version in a future Next.js patch.

## Status vs. the Jul 2026 meeting notes

Done:
- Price ₹99 → ₹49 everywhere (single source of truth: `BASE_PRICE` in
  `lib/constants.ts`).
- "Meet your coach" section removed per request.
- Order bumps in the Included section — **Templates & Creatives (+₹90)** and
  **Full Access to Meeting Recordings & Notes (+₹19)** — with a live total.
- Results section redesigned as a 2×2 dark case-study card grid, populated
  with the four real client results and photos.
- Every `.cta` button opens a lead-capture modal (name/phone/email); on
  submit it POSTs to `/api/leads` (real endpoint, Supabase insert pending —
  see above) and only then redirects to the payment link.
- Converted the whole site from static HTML/CSS/JS to Next.js + TypeScript,
  per request, with real (if not-yet-configured) backend routes for the two
  integrations that actually needed a server: Supabase and Razorpay.

Deliberately **not** done — flagged rather than guessed at, since these need
information or credentials only you have:
- **Razorpay live keys, Supabase project, Meta/Pixel tracking, domain + SSL** —
  all need real credentials/accounts. The code is ready for each; see
  "Before you deploy" above for the exact spot each one plugs into.
- **Removing "unnecessary/low-converting" sections** — not touched; nothing
  was named as a specific cut. Say which sections to cut and they'll come out.
- **Countdown timer / urgency deadline** — not added. A countdown needs a real
  batch-closing date; a fake one would be a dark pattern. The existing honest
  "limited spots" messaging was kept as-is.
- **Customer-count / results-screenshot trust stats** — not added, since no
  real numbers were provided and invented ones would be misleading.
- Refund-window / access-duration specifics for new FAQ entries — not added;
  provide the actual policy and they can be written in accurately.

## Notes

- Fonts are self-hosted automatically via `next/font/google` (Bricolage
  Grotesque + Inter) — no external request to `fonts.googleapis.com` anymore,
  and no layout shift from late font loading.
- Design system: spacing follows an 8-point scale (`--sp-1`…`--sp-12` in
  `app/globals.css`, 4px sub-steps), with matching type-scale, radius, and
  shadow tokens at the top of the file.
- Animations respect `prefers-reduced-motion` throughout (reveal-on-scroll,
  hover transforms, the hero's floating chips, animated counters).
- The top nav collapses into an accessible slide-down menu below 760px.
- The FAQ accordion uses native `<details>/<summary>` — accessible and
  works even with client JS disabled.
- Structured data (`Course` + `FAQPage` JSON-LD) lives in `app/page.tsx` and is
  generated from `lib/constants.ts` (`BASE_PRICE`, `FAQS`) — no hand-duplicated
  copy to keep in sync.
- Images in the Results section use `next/image` for automatic optimization
  and lazy loading.
