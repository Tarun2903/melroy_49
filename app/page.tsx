import TopNav from "@/components/TopNav";
import Hero from "@/components/Hero";
import Outcomes from "@/components/Outcomes";
import Roadmap from "@/components/Roadmap";
import Results from "@/components/Results";
import Fit from "@/components/Fit";
import Included from "@/components/Included";
import DifferentSection from "@/components/DifferentSection";
import Guarantee from "@/components/Guarantee";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Disclaimer from "@/components/Disclaimer";
import BuyBar from "@/components/BuyBar";
import LeadModal from "@/components/LeadModal";
import ScrollRevealInit from "@/components/ScrollRevealInit";
import { BASE_PRICE, FAQS } from "@/lib/constants";

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "5-Day 1-on-1 AI Digital Product Challenge",
  description:
    "A private 1-on-1 challenge where Melroy personally guides you from idea to a launched AI digital product in 5 days.",
  provider: { "@type": "Person", name: "Melroy" },
  offers: {
    "@type": "Offer",
    price: String(BASE_PRICE),
    priceCurrency: "INR",
    availability: "https://schema.org/LimitedAvailability",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <TopNav />
      <Hero />

      <main id="main">
        <Outcomes />
        <Roadmap />
        <Results />
        <Fit />
        <Included />
        <DifferentSection />
        <Guarantee />
        <Faq />
        <FinalCta />
      </main>

      <Disclaimer />
      <Footer />
      <BuyBar />
      <LeadModal />
      <ScrollRevealInit />
    </>
  );
}
