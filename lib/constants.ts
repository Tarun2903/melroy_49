/** Central place for site-wide config. Update pricing/links here — every
 *  component and API route imports from this file rather than hardcoding. */

export const SITE_URL = "https://digitalsales.coachingsales.space";

export const SITE_TITLE =
  "Build & Launch Your AI Digital Product in 5 Days — 1-on-1 Challenge";

export const SITE_DESCRIPTION =
  "A private 1-on-1 challenge where Melroy personally guides you from idea to a launched AI digital product in 5 days. No coding. No confusing tech. Just ₹49.";

/** Fallback static payment link, used until the Razorpay order-creation API
 *  (app/api/razorpay/create-order) is wired up with real credentials. */
export const PAYMENT_LINK =
  process.env.NEXT_PUBLIC_PAYMENT_LINK ?? "https://rzp.io/l/YOUR-PAYMENT-LINK";

export const BASE_PRICE = 49;
export const ORIGINAL_PRICE = 1999;
/** Site charges in INR (Razorpay checkout, all displayed prices) — the
 *  Purchase event reports this currency, not the USD in generic examples. */
export const CURRENCY = "INR";

export const META_PIXEL_ID = "913277347759939";
/** Conversions API dataset id — defaults to the Pixel id, which is correct
 *  for a standard single-Pixel setup. Override via META_DATASET_ID if this
 *  project ever moves to a distinct CAPI Gateway dataset. */
export const META_DATASET_ID = process.env.META_DATASET_ID ?? META_PIXEL_ID;

export const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/IkPhVgr0Ve51z7MM80x5bW";

/** Microsoft Clarity heatmaps/session recordings — see components/MicrosoftClarity.tsx */
export const CLARITY_PROJECT_ID = "xo9lpr0ak3";

export interface OrderBump {
  id: string;
  name: string;
  /** Lead-in line before the bullet list, e.g. "200+ proven examples of:" */
  intro: string;
  bullets: string[];
  price: number;
}

/** Order bumps, offered one at a time inside LeadModal after the lead form
 * (see components/LeadModal.tsx) — not shown upfront on the landing page.
 * `id` values are also used as Razorpay payment-link notes keys
 * (app/api/razorpay/create-payment-link) — keep them stable; changing an id
 * changes what past purchase records mean. */
export const ORDER_BUMPS: OrderBump[] = [
  {
    id: "swipe-file",
    name: "Marketing Swipe File",
    intro: "200+ proven examples of:",
    bullets: [
      "Landing Pages",
      "Sales Emails",
      "Headlines",
      "Winning Ads",
      "Checkout Pages",
      "Pricing Sections",
    ],
    price: 90,
  },
  {
    id: "session-recording",
    name: "Session Recording",
    intro:
      "Get lifetime access to the complete 5-Day Challenge recordings so you can revisit every session anytime at your own pace.",
    bullets: [],
    price: 190,
  },
];

export interface CaseStudy {
  headline: string;
  client: string;
  business: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: "Do I need any coding or technical skills?",
    a: "None. Every step uses AI tools with simple, guided workflows. If you can use WhatsApp and a browser, you can do this.",
  },
  {
    q: "How do the 1-on-1 sessions work?",
    a: "You get five private video calls — one per day — scheduled at times that work for you. We build together live, so you're never stuck between sessions.",
  },
  {
    q: "How much time do I need each day?",
    a: "Plan for your session plus about 60–90 minutes of guided implementation. Everything is broken into small, clear tasks.",
  },
  {
    q: "What kind of product will I build?",
    a: "That's Day 1's job — we'll find the idea that fits your skills and audience. Common builds: e-books, templates, mini-courses, toolkits, guides, and AI-assisted services.",
  },
  {
    q: "I don't have a product idea yet. Is that okay?",
    a: "Perfect, actually. The challenge starts from zero — Day 1 is entirely about finding and validating your idea.",
  },
  {
    q: "What if it doesn't work for me?",
    a: `You're covered by the money-back guarantee: attend Day 1, and if it's not right for you, you get a full refund of your ₹${BASE_PRICE}.`,
  },
  {
    q: "When does my challenge start?",
    a: "As soon as you reserve your spot, you'll receive a link to schedule your Day 1 session. Spots per intake are limited to keep the coaching truly 1-on-1.",
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    headline: "100+ Qualified Calls Booked",
    client: "David Birtwistle",
    business: "UK Fitness Creator",
    image: "/images/result-1.jpg",
    imageWidth: 1672,
    imageHeight: 941,
  },
  {
    headline: "146+ Appointments Booked In 60 Days",
    client: "Satyam",
    business: "Visionary Focus",
    image: "/images/result-2.jpg",
    imageWidth: 1658,
    imageHeight: 949,
  },
  {
    headline: "35 Discovery Calls Booked In Less Than A Week",
    client: "Jatin Naren",
    business: "Amazon Automation",
    image: "/images/result-3.jpg",
    imageWidth: 1662,
    imageHeight: 946,
  },
  {
    headline: "$200K+ AI Coaching Sales",
    client: "Jordan Lee",
    business: "AI Acquisition",
    image: "/images/result-4.jpg",
    imageWidth: 1672,
    imageHeight: 941,
  },
];
