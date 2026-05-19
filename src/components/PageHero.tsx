import { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

type PageHeroProps = {
  label?: string;
  title: string;
  intro?: string;
  ctaLabel?: string;
  ctaTo?: string;
  imageSlot?: ReactNode;
  background?: "cream" | "beige" | "blush";
};

const BG: Record<NonNullable<PageHeroProps["background"]>, string> = {
  cream: "#FDFBF7",
  beige: "#EAE3DA",
  blush: "#F7E8EA",
};

export function PageHero({ label, title, intro, ctaLabel, ctaTo, imageSlot, background = "cream" }: PageHeroProps) {
  return (
    <section className="relative px-6 pt-12 md:pt-20 pb-10 md:pb-16" style={{ background: BG[background] }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(78,140,133,0.35), rgba(186,155,120,0.3), transparent)" }} />
      <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 md:gap-10 items-center">
        <div className={imageSlot ? "md:col-span-7" : "md:col-span-12 text-center max-w-3xl mx-auto"}>
          <Reveal>
            {label && (
              <span className="inline-block text-[11px] tracking-[0.22em] uppercase text-[#BA9B78] mb-3 px-3 py-1 rounded-full bg-white/70 border border-[#E0D8CC]">
                {label}
              </span>
            )}
            <h1 className="text-[2rem] sm:text-4xl md:text-5xl font-light text-[#461C5B] leading-tight mb-4">{title}</h1>
            {intro && <p className="text-[#4A3D30] font-light text-base md:text-lg leading-relaxed max-w-2xl mb-6">{intro}</p>}
            {ctaLabel && ctaTo && (
              <a href={ctaTo} className="inline-flex items-center gap-2 px-6 py-3 bg-[#461C5B] text-white rounded-full text-sm tracking-wide hover:bg-[#5a2674] transition-colors">
                {ctaLabel}
              </a>
            )}
          </Reveal>
        </div>
        {imageSlot && (
          <div className="md:col-span-5">
            <Reveal delay={0.1}>{imageSlot}</Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
