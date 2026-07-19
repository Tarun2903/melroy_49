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
    price: 99,
  },
  {
    id: "session-recording",
    name: "Session Recording",
    intro:
      "Get lifetime access to the complete 5-Day Challenge recordings so you can revisit every session anytime at your own pace.",
    bullets: [],
    price: 99,
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  avatarWidth: number;
  avatarHeight: number;
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

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I'd been ‘planning’ a digital product for two years. In 5 days with Melroy I actually launched an AI-built resume toolkit—and made my first sale within a week.",
    name: "Priya R.",
    role: "HR Professional, Bengaluru",
    rating: 5,
    avatar: "/images/testimonial-priya.png",
    avatarWidth: 512,
    avatarHeight: 512,
  },
  {
    quote:
      "I'm not technical at all. The 1-on-1 format is what made the difference—every time I got stuck, we fixed it live on the call instead of me giving up.",
    name: "Arjun S.",
    role: "Sales Manager, Pune",
    rating: 5,
    avatar: "/images/testimonial-arjun.png",
    avatarWidth: 512,
    avatarHeight: 512,
  },
  {
    quote:
      "The best ₹99 I've spent. I launched a mini-course with AI-generated workbooks. The funnel template alone was worth 10× the price.",
    name: "Meera K.",
    role: "Freelance Designer, Kochi",
    rating: 5,
    avatar: "/images/testimonial-meera.png",
    avatarWidth: 512,
    avatarHeight: 512,
  },
  {
    quote:
      "Day 3 changed how I see my side hustle. Having a real brand page made me take myself seriously—and so did my first customers.",
    name: "Rahul V.",
    role: "Software Engineer, Hyderabad",
    rating: 5,
    avatar: "/images/testimonial-rahul.png",
    avatarWidth: 512,
    avatarHeight: 512,
  },
  {
    quote:
      "I've bought big courses before and finished none of them. This is the opposite: 5 days, one clear task a day, and someone personally keeping you accountable.",
    name: "Sneha N.",
    role: "Homemaker turned Creator, Chennai",
    rating: 5,
    avatar: "/images/testimonial-sneha.png",
    avatarWidth: 512,
    avatarHeight: 512,
  },
  {
    quote:
      "Launched my first paid Notion template pack on Day 5. The launch checklist meant zero guesswork—I just followed it step by step.",
    name: "Vikram D.",
    role: "MBA Student, Mumbai",
    rating: 5,
    avatar: "/images/testimonial-vikram.png",
    avatarWidth: 512,
    avatarHeight: 512,
  },
];
