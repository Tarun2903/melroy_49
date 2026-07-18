import { PAYMENT_LINK } from "@/lib/constants";

interface CtaButtonProps {
  label: string;
  small?: string;
  wide?: boolean;
  className?: string;
}

/** Every CTA on the page shares this markup. Clicking it is intercepted by
 * LeadModal (see components/LeadModal.tsx), which opens the lead-capture
 * form before sending the visitor on to PAYMENT_LINK — the href here is a
 * plain fallback for when JS/the dialog is unavailable. */
export default function CtaButton({ label, small, wide, className }: CtaButtonProps) {
  const classes = ["btn", "cta", wide ? "btn-wide" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={classes} href={PAYMENT_LINK}>
      <span className="label">{label}</span>
      {small && <span className="small">{small}</span>}
    </a>
  );
}
