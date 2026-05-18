import { LucideIcon } from "lucide-react";

export function ImpactGrid({ items }: { items: { icon: LucideIcon; title: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-[#E0D8CC] flex items-start gap-4 hover:shadow-md transition-shadow"
          >
            <div className="shrink-0 w-11 h-11 rounded-xl bg-[#F0F5F3] flex items-center justify-center border border-[#4E8C85]/20">
              <Icon size={20} color="#4E8C85" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base text-[#2D1B3D] font-medium mb-1">{it.title}</h3>
              <p className="text-sm text-[#4A3D30] font-light leading-relaxed">{it.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
