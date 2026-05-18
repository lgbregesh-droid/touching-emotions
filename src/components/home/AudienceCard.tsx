import { LucideIcon } from "lucide-react";

export function AudienceCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="card-hover bg-[#FBF6EE] border border-[#E0D8CC] rounded-2xl p-5 h-full flex flex-col gap-3 shadow-sm">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#BA9B78]/20 to-[#4E8C85]/15 border border-[#BA9B78]/25">
        <Icon size={22} color="#2D1B3D" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg text-[#2D1B3D] font-medium leading-tight">{title}</h3>
      <p className="text-sm text-[#4A3D30] font-light leading-relaxed">{desc}</p>
    </div>
  );
}
