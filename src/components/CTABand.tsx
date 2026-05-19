import { Reveal } from "@/components/Reveal";
import { MessageCircle } from "lucide-react";

type Props = {
  title: string;
  sub?: string;
  primaryLabel?: string;
  primaryTo?: string;
  whatsappLabel?: string;
  variant?: "purple" | "blush" | "beige";
};

const VARIANTS = {
  purple: { bg: "#461C5B", fg: "#F5F0E8", btnBg: "#E5A3AD", btnFg: "#461C5B" },
  blush: { bg: "#F7E8EA", fg: "#461C5B", btnBg: "#461C5B", btnFg: "#FDFBF7" },
  beige: { bg: "#EAE3DA", fg: "#461C5B", btnBg: "#461C5B", btnFg: "#FDFBF7" },
};

export function CTABand({ title, sub, primaryLabel = "צרו קשר", primaryTo = "/contact", whatsappLabel = "וואטסאפ", variant = "blush" }: Props) {
  const v = VARIANTS[variant];
  return (
    <section className="px-6 py-14 md:py-20" style={{ background: v.bg, color: v.fg }}>
      <Reveal>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-light mb-3">{title}</h2>
          {sub && <p className="text-sm md:text-base font-light opacity-90 mb-7 leading-relaxed">{sub}</p>}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to={primaryTo} className="px-7 py-3 rounded-full text-sm tracking-wide transition-transform hover:scale-[1.02]" style={{ background: v.btnBg, color: v.btnFg }}>
              {primaryLabel}
            </Link>
            <a
              href="https://wa.me/972528040787"
              target="_blank"
              rel="noreferrer noopener"
              className="px-7 py-3 rounded-full text-sm tracking-wide border inline-flex items-center gap-2 transition-colors"
              style={{ borderColor: v.fg, color: v.fg }}
            >
              <MessageCircle className="w-4 h-4" />
              {whatsappLabel}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
