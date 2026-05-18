export function ProcessTimeline({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {steps.map((s, i) => (
        <div
          key={i}
          className="relative bg-white/5 backdrop-blur-sm border border-[#BA9B78]/25 rounded-2xl p-5 h-full"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-full bg-[#BA9B78] text-[#2D1B3D] flex items-center justify-center font-serif text-lg">
              {i + 1}
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#BA9B78]/40" />
          </div>
          <h3 className="text-base text-[#F5F0E8] font-medium mb-1.5">{s.title}</h3>
          <p className="text-sm text-[#F5F0E8]/70 font-light leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}
