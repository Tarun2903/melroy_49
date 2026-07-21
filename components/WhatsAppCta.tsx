import { WHATSAPP_GROUP_URL } from "@/lib/constants";

interface WhatsAppCtaProps {
  /** Optional side-effect (e.g. analytics) to run on click. Does not
   * preventDefault, so navigation to WhatsApp is unaffected. */
  onClick?: () => void;
}

/** Deliberately does NOT carry the `.cta` class — LeadModal intercepts every
 * `.cta` click to open the lead-capture form, which must not happen here.
 * This should navigate straight to WhatsApp in a new tab. */
export default function WhatsAppCta({ onClick }: WhatsAppCtaProps) {
  return (
    <a
      className="btn btn-wide btn-whatsapp"
      href={WHATSAPP_GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      <span className="label">
        <span aria-hidden="true">💬</span> Join the Private WhatsApp Group
      </span>
    </a>
  );
}
