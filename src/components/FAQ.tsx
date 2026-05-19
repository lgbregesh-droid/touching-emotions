import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FAQItem = { q: string; a: string };

export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="bg-white rounded-2xl border border-[#E0D8CC] overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-5 text-right"
              aria-expanded={isOpen}
            >
              <span className="text-[#461C5B] font-normal">{it.q}</span>
              <ChevronDown className={`w-5 h-5 text-[#BA9B78] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-[#4A3D30] font-light leading-relaxed border-t border-[#F0EAE0] pt-4">
                {it.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
