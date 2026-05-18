export function TestimonialsRow({ items }: { items: { quote: string; name: string; role: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {items.map((t, i) => (
        <div
          key={i}
          className="relative bg-[#FBF6EE] rounded-2xl p-6 md:p-7 border border-[#E0D8CC] shadow-sm"
          style={{ borderRight: "3px solid rgba(186,155,120,0.45)" }}
        >
          <div className="absolute top-3 left-4 text-5xl text-[#BA9B78]/40 font-serif leading-none select-none">"</div>
          <p className="text-[#4A3D30] text-sm md:text-base leading-relaxed font-light mb-5">
            {t.quote}
          </p>
          <div className="flex items-center gap-3 pt-3 border-t border-[#E0D8CC]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BA9B78]/30 to-[#4E8C85]/25 flex items-center justify-center text-[#2D1B3D] font-medium">
              {t.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#2D1B3D] font-medium">{t.name}</div>
              <div className="text-xs text-[#A0907A]">{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
