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
│   ├── thank-you/page.tsx  The one Thank You page — see ThankYouContent below
│   └── api/
│       ├── leads/route.ts                    POST — validates + saves a lead
│       ├── razorpay/create-order/route.ts    POST — creates a Razorpay order
│       │                                     (501 until keys are set)
│       └── payment/verify/route.ts           POST — verifies a Razorpay
│                                              Payment Link redirect, fires
│                                              the server-side Meta Purchase
│                                              event (501 until keys are set)
├── components/             One file per section (Hero, Outcomes, Roadmap,
│                           Results, Fit, Included, Guarantee, Faq, FinalCta,
│                           Footer, TopNav, BuyBar, LeadModal, CtaButton,
│                           AnimatedCounter, HeroVisual, ScrollRevealInit,
│                           MetaPixel, ThankYouContent, WhatsAppCta)
├── lib/
│   ├── constants.ts        Single source of truth: price, order bumps,
│   │                       case-study data, site URL/title/description,
│   │                       Meta Pixel id, WhatsApp group URL
│   ├── supabase.ts         Client factory — returns null until env vars are set
│   └── metaCapi.ts         Server-side Meta Conversions API call — returns
│                           { sent: false } until META_CAPI_ACCESS_TOKEN is set
├── public/
│   └── images/             favicon.svg, og-image.svg, result-1.jpg…4.jpg
├── .env.example             Documents the env vars the API routes expect
├── package.json / tsconfig.json / next.config.ts / eslint.config.mjs
└── README.md (this file)
```

Interactive ("use client") components: `TopNav` (mobile menu), `BuyBar`
(sticky-on-scroll), `LeadModal` (multi-step: lead form -> order bumps ->
checkout — see below), `ThankYouContent` (payment verification + Purchase
event), plus the small reusable `AnimatedCounter` and `ScrollRevealInit`.
`Included` is now a plain server component (the order bumps moved into
`LeadModal`). `MetaPixel` and `MicrosoftClarity` also render on every page
from the root layout, not from `page.tsx`.

## Before you deploy

1. **Payment link** — `lib/constants.ts` exports `PAYMENT_LINK`
   (`NEXT_PUBLIC_PAYMENT_LINK`), a live ₹49 Razorpay Payment Link. It's now
   only a **fallback**: normal checkout goes through
   `app/api/razorpay/create-payment-link/route.ts` instead (see "Order bumps
   & checkout flow" below), which creates a payment link for the exact
   accepted total. The static link is only used if that call fails for any
   reason, so checkout keeps working either way.
2. **Razorpay** — both `app/api/razorpay/create-payment-link/route.ts`
   (used by `LeadModal`, described below) and the older
   `app/api/razorpay/create-order/route.ts` (Orders API + Checkout.js —
   built but never wired to the frontend; the Payment Links approach was
   used instead since it needed no client-side SDK) are real, working
   implementations. Both require `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`,
   already set in `.env.local` and Vercel Production.
3. **Supabase** — `app/api/leads/route.ts` validates and receives every lead
   submission; `lib/supabase.ts` documents the exact two steps to connect it
   (`npm install @supabase/supabase-js`, fill in `.env.local`). Until then,
   leads are only `console.log`'d server-side — nothing is lost silently, but
   nothing is stored permanently either.
4. **Meta Pixel + Purchase tracking + Thank You page** — see the dedicated
   section below. This is the newest, most credential-dependent piece;
   read it before assuming purchases are actually being tracked anywhere.
5. **Domain** — `lib/constants.ts`'s `SITE_URL` is
   `https://digitalsales.coachingsales.space` (the real production domain,
   DNS pointed at Vercel). Feeds the canonical URL, OG/Twitter tags, the
   generated sitemap/robots, and the `callback_url` on every dynamically
   created Razorpay Payment Link — update it there once, everywhere follows.
6. **Social image** — `public/images/og-image.svg` is an SVG source. Facebook/
   LinkedIn and some Twitter clients don't render SVG for link previews
   reliably, so export it to a 1200×630 PNG/JPG and update the `openGraph`/
   `twitter` blocks in `app/layout.tsx` to point at it.
7. **Results / case studies** — `lib/constants.ts`'s `CASE_STUDIES` array:
   David Birtwistle, Satyam, Jatin Naren, and Jordan Lee, each with their
   stated result, business/niche, and photo. Per Tarun: these are real,
   verified clients who gave permission to be featured. A testimonial video
   is planned as a future addition — there's no dedicated slot for it yet.
8. **Known non-issue**: `npm audit` reports a moderate `postcss` advisory
   nested inside Next.js's own dependency tree. The suggested fix downgrades
   Next.js to a very old release, which is worse — left as-is; expect Vercel
   to bump the pinned version in a future Next.js patch.

## Order bumps & checkout flow

The two order bumps (`ORDER_BUMPS` in `lib/constants.ts`):

- **Marketing Swipe File** — +₹90 — 200+ examples (Landing Pages, Sales
  Emails, Headlines, Winning Ads, Checkout Pages, Pricing Sections)
- **AI Prompt Vault** — +₹190 — 300+ prompts (Sales Pages, Meta Ads, Landing
  Pages, Email Marketing, Content Creation, Funnels)

are **not** shown upfront on the landing page. Clicking any `.cta` button
opens `LeadModal`, which steps through:

1. **Lead form** — name/phone/email. On submit, the lead is saved
   (`/api/leads`) and stashed in `sessionStorage` (for Meta CAPI match
   quality later), then the modal advances — it does not close or redirect
   yet.
2. **Bump 1** (Marketing Swipe File) — shown alone, with "Yes, add this" /
   "No thanks, continue" and a live "Your total: ₹X" line. Either answer
   advances to the next step.
3. **Bump 2** (AI Prompt Vault) — same pattern, its own live running total
   (reflecting bump 1's decision). Answering either way triggers checkout.
4. **Checkout** — `LeadModal` POSTs the accepted bump ids to
   `app/api/razorpay/create-payment-link/route.ts`, which computes the real
   total server-side (never trusting a client-supplied amount), stores the
   accepted ids in the Payment Link's `notes.addon_ids` field, and creates
   an actual Razorpay Payment Link for that amount via their API. The
   visitor is redirected there, so **what they're charged matches exactly
   what they agreed to**.

All four purchase combinations produce distinct, correct totals: ₹49 alone,
₹139 (+ Swipe File), ₹239 (+ Prompt Vault), ₹329 (both).

**How bump selection survives the redirect to Razorpay and back**: Razorpay
Payment Links support an arbitrary `notes` object that's stored with the
link and readable afterwards via their API. `create-payment-link` writes
`notes.addon_ids` (e.g. `"swipe-file,prompt-vault"`) when creating the link;
`app/api/payment/verify/route.ts` reads it back via
`GET /v1/payment_links/{id}` once the signature is verified, resolves it to
bump names, stores it in Supabase's `purchases.addon_ids` column, includes
it in the Meta CAPI `content_ids`, and returns it to the Thank You page
(which shows "Your order also includes: ..." and passes the same
`content_ids` into the browser Pixel call). This is why bump tracking
doesn't rely on guessing from the charged amount — it's read from the
source of truth.

**Fallback, so this can never break checkout**: if `create-payment-link`
fails for any reason (Razorpay down, misconfigured keys, network error),
`LeadModal` catches it and redirects to the static `PAYMENT_LINK` instead
(fixed ₹49, no bumps, no notes). A visitor never sees an error — worst
case, a bump they accepted doesn't get charged for, which is a
business/reconciliation question, not a broken flow.

Every dynamically created Payment Link reuses the same `callback_url`
(`${SITE_URL}/thank-you`) as the static one, so the Thank You page /
signature verification / Purchase event pipeline (below) works identically
regardless of which link a given customer paid through.

**Bug fixed (Jul 2026): "Yes, add this" appearing to not work.** `LeadModal`
is a singleton mounted once for the whole page — its `redirecting` state
persisted across separate modal open/close cycles. If a checkout attempt
ever set `redirecting=true` and the redirect didn't complete in that tab
(a failed request, or the browser restoring the page from back/forward
cache after hitting "back" from Razorpay), every button in the modal —
including "Yes, add this" — stayed permanently `disabled` for the rest of
the session. Fixed by resetting `redirecting`/`submitting` (not just
`step`/`selectedBumps`) both when the modal reopens and whenever it closes
for any reason (Escape, the X button, or a completed checkout).

## Meta Pixel, Purchase tracking, and the Thank You page

**What's live right now, with zero extra setup:**
- The Meta Pixel (id `913277347759939`, hardcoded in `lib/constants.ts` since
  it's a public identifier) loads on every page via `components/MetaPixel.tsx`
  in the root layout — base snippet in `<head>` (via `next/script`), the
  required `<noscript>` fallback image as the first thing in `<body>`, and
  `PageView` firing both on initial load and on every client-side route
  change (App Router navigations don't trigger the base snippet again, so a
  small route-change tracker handles that).
- `/thank-you` is the single Thank You page. It reads Razorpay's redirect
  query params, and shows one of three states: no payment reference at all
  (generic "check your email" message, **no WhatsApp link shown** — that
  link is only for people with actual payment evidence in the URL);
  payment reference present but not yet/couldn't be verified (still shows
  the full thank-you content + WhatsApp CTA, since a real paying customer
  should never see a broken page just because our backend isn't fully wired
  yet — but the Purchase event does **not** fire in this case); and fully
  verified (full content, WhatsApp CTA, Purchase event fires exactly once).
- The **WhatsApp CTA** (`components/WhatsAppCta.tsx`) deliberately does not
  carry the `.cta` class, so `LeadModal`'s global click-interceptor leaves it
  alone — it's a plain link, opens in a new tab, `rel="noopener noreferrer"`.

**How "payment confirmed" actually works, and why it needs real credentials:**
Razorpay Payment Links redirect the browser back to a configured URL with
`razorpay_payment_id`, `razorpay_payment_link_id`,
`razorpay_payment_link_reference_id`, `razorpay_payment_link_status`, and
`razorpay_signature`. `app/api/payment/verify/route.ts` recomputes that
signature with `RAZORPAY_KEY_SECRET` (HMAC-SHA256) — this is the actual
"did this person really pay" check; nothing fires without it passing. It
then fetches the authoritative charged amount from Razorpay's Payments API
(so the tracked value is never just a hardcoded guess), and records the
payment in a new Supabase `purchases` table with a `UNIQUE` constraint on
`razorpay_payment_id` — this is what guarantees the server-side Purchase
event fires **exactly once** even across page refreshes, multiple tabs, or
someone hitting the redirect URL twice. The browser-side duplicate guard
(`localStorage`, keyed by payment id) is a second, independent layer on top
of that. Both the browser Pixel call and the server CAPI call use the same
deterministic `event_id` (`purchase_<payment_id>`), which is what lets Meta
deduplicate them into a single conversion rather than double-counting.

**Exactly what's missing before any of this can go live — nothing here was
guessed at:**
1. **`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`** — still empty. Required for
   both the signature verification and fetching the charged amount.
2. **A real `PAYMENT_LINK`** — still the placeholder
   `https://rzp.io/l/YOUR-PAYMENT-LINK`.
3. **The Payment Link's Redirect URL, set in the Razorpay dashboard** (when
   creating/editing the Payment Link) — must point to
   `https://<your-domain>/thank-you`. Without this, Razorpay never sends the
   customer (or the payment params) to our Thank You page at all.
4. **`META_CAPI_ACCESS_TOKEN`** — a System User access token. Generate one in
   Meta Events Manager → your Pixel → Settings → Conversions API → "Generate
   access token". Without it, `lib/metaCapi.ts` logs and no-ops — the
   browser Pixel Purchase event still fires normally, but there's no
   server-side event for Meta to deduplicate it against or fall back on if
   the browser event is blocked (ad blockers, iOS ATT, etc.).
5. **`META_DATASET_ID`** (optional) — defaults to the Pixel id above, which
   is correct for a standard setup. Only set this if Meta gave you a
   separate Conversions API Gateway dataset id.
6. **Run this SQL in the Supabase SQL Editor** (same place as the earlier
   `leads` table SQL) — if you already created `purchases` before the order
   bumps were reworked, just run the `alter table` line at the bottom; it's
   additive and safe to run even if the column already exists:

   ```sql
   create table if not exists public.purchases (
     id uuid primary key default gen_random_uuid(),
     razorpay_payment_id text not null unique,
     razorpay_payment_link_id text,
     razorpay_payment_link_reference_id text,
     amount numeric,
     currency text,
     event_id text not null,
     addon_ids text,
     created_at timestamptz not null default now()
   );

   alter table public.purchases enable row level security;

   create policy if not exists "Allow server-side purchase inserts"
   on public.purchases
   for insert
   to anon
   with check (true);

   -- Only needed if the table already existed without this column:
   alter table public.purchases add column if not exists addon_ids text;
   ```

   Same minimal-privilege pattern as `leads`: INSERT-only for the `anon`
   role (which is what the publishable key authenticates as), no read/
   update/delete policy exists, so nothing else is exposed. `addon_ids` is a
   comma-separated list of `ORDER_BUMPS` ids (e.g. `swipe-file,prompt-vault`),
   read back from the Razorpay Payment Link's `notes` field — see "Order
   bumps & checkout flow" below for how that round-trip works.

Until all of the above are set, the flow still works end-to-end without
errors — `LeadModal` → Razorpay → back to `/thank-you` — it just won't be
able to verify the payment or report a Purchase event yet, and will fall
back to the honest "we couldn't confirm this automatically" state.

## Status vs. the Jul 2026 meeting notes

Done:
- Price ₹99 → ₹49 everywhere (single source of truth: `BASE_PRICE` in
  `lib/constants.ts`).
- "Meet your coach" section removed per request.
- Order bumps — **Templates & Creatives (+₹90)** and **Full Access to
  Meeting Recordings & Notes (+₹19)** — moved from an upfront checkbox list
  into a one-at-a-time offer inside `LeadModal`'s checkout flow, with the
  accepted total actually charged via a dynamically created Razorpay
  Payment Link. See "Order bumps & checkout flow" above.
- Results section redesigned as a 2×2 dark case-study card grid, populated
  with the four real client results and photos.
- Every `.cta` button opens a lead-capture modal (name/phone/email); on
  submit it POSTs to `/api/leads` (real endpoint, Supabase insert pending —
  see above) and only then redirects to the payment link.
- Converted the whole site from static HTML/CSS/JS to Next.js + TypeScript,
  per request, with real (if not-yet-configured) backend routes for the two
  integrations that actually needed a server: Supabase and Razorpay.
- Meta Pixel installed globally with PageView on every route; single Thank
  You page with WhatsApp CTA; client + server (CAPI) Purchase event pipeline
  with real Razorpay-signature verification and dedup — see "Meta Pixel,
  Purchase tracking, and the Thank You page" above for what's wired vs. what
  still needs credentials.

Deliberately **not** done — flagged rather than guessed at, since these need
information or credentials only you have:
- **Razorpay live keys, Supabase `purchases` table, Meta CAPI access token,
  domain + SSL** — all need real credentials/actions from you. See "Meta
  Pixel, Purchase tracking, and the Thank You page" above for the complete,
  exact list — nothing there was guessed at.
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
- **Deliberate deviation from the Purchase-event spec example**: the example
  used `currency: 'USD'`, but every price on this site is in ₹ and Razorpay
  is charging INR — sending `USD` would misreport revenue in Meta Ads
  Manager (a ₹49 sale would show as a $49 sale, ~4,000% overstated). The
  implementation uses `CURRENCY = "INR"` from `lib/constants.ts` and the
  actual amount Razorpay confirms was charged, not a hardcoded number.
