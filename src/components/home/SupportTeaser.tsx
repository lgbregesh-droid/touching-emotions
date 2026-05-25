import { Link } from "@tanstack/react-router";
import { Heart, Gift } from "lucide-react";
import { buildContactUrl } from "@/lib/contact-link";

export function SupportTeaser({
  label,
  title,
  desc,
  cta,
  donateCta,
}: {
  label: string;
  title: string;
  desc: string;
  cta: string;
  donateCta: string;
}) {
  return (
    <div className="bg-gradient-to-bl from-[#EDE6DC] via-[#F5F0E8] to-[#F0F5F3] rounded-3xl p-6 md:p-10 border border-[#E0D8CC] shadow-sm">
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#BA9B78] mb-3">— {label} —</p>
          <h2 className="text-2xl md:text-3xl font-extralight text-[#2D1B3D] mb-3 leading-tight">{title}</h2>
          <p className="text-[#4A3D30] font-light leading-relaxed max-w-2xl">{desc}</p>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <a
            href={buildContactUrl({ type: "support_item", source: "support" })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#2D1B3D] text-white text-sm hover:bg-[#3d2750] transition-colors"
          >
            <Gift size={15} />
            {cta}
          </a>
          <Link
            to="/donations"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#BA9B78] text-[#2D1B3D] text-sm hover:bg-[#BA9B78] hover:text-white transition-colors"
          >
            <Heart size={15} />
            {donateCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
