import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  icon?: LucideIcon;
  title: string;
  desc?: ReactNode;
  accent?: "gold" | "teal" | "purple" | "blush";
  badge?: string;
};

const ACCENT: Record<NonNullable<Props["accent"]>, { bg: string; fg: string }> = {
  gold: { bg: "rgba(186,155,120,0.15)", fg: "#BA9B78" },
  teal: { bg: "rgba(78,140,133,0.15)", fg: "#4E8C85" },
  purple: { bg: "rgba(70,28,91,0.10)", fg: "#461C5B" },
  blush: { bg: "rgba(229,163,173,0.20)", fg: "#C8636E" },
};

export function InfoCard({ icon: Icon, title, desc, accent = "gold", badge }: Props) {
  const a = ACCENT[accent];
  return (
    <div className="bg-white rounded-2xl border border-[#E0D8CC] p-6 h-full flex flex-col card-hover" style={{ borderRight: `3px solid ${a.fg}40` }}>
      <div className="flex items-start gap-4 mb-3">
        {Icon && (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.bg }}>
            <Icon className="w-5 h-5" style={{ color: a.fg }} />
          </div>
        )}
        <div className="flex-1">
          {badge && <div className="text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: a.fg }}>{badge}</div>}
          <h3 className="text-lg text-[#461C5B] font-normal leading-snug">{title}</h3>
        </div>
      </div>
      {desc && <p className="text-sm text-[#4A3D30] font-light leading-relaxed flex-1">{desc}</p>}
    </div>
  );
}
