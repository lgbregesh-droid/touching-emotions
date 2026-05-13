import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

const palette = [
  "from-[#4E8C85]/60 to-[#2D1B3D]/80",
  "from-[#BA9B78]/55 to-[#2D1B3D]/85",
  "from-[#2D1B3D]/70 to-[#4E8C85]/60",
  "from-[#BA9B78]/45 to-[#4E8C85]/60",
  "from-[#4E8C85]/55 to-[#BA9B78]/45",
  "from-[#2D1B3D]/80 to-[#BA9B78]/40",
  "from-[#4E8C85]/65 to-[#2D1B3D]/70",
  "from-[#BA9B78]/55 to-[#2D1B3D]/80",
  "from-[#4E8C85]/45 to-[#2D1B3D]/85",
  "from-[#2D1B3D]/70 to-[#BA9B78]/50",
  "from-[#4E8C85]/55 to-[#2D1B3D]/80",
  "from-[#BA9B78]/55 to-[#4E8C85]/55",
];

type GalleryImage = { id: string; url: string };

function Placeholder({ idx, label }: { idx: number; label: string }) {
  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${palette[idx % palette.length]} flex items-end p-4`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <span className="relative text-[#F5F0E8]/70 text-xs tracking-widest uppercase">{label} {idx + 1}</span>
    </div>
  );
}

function Tile({ img, idx, label }: { img?: GalleryImage; idx: number; label: string }) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {img ? (
        <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <Placeholder idx={idx} label={label} />
      )}
    </div>
  );
}

export function Gallery({ count = 8, featuredOnly = true }: { count?: number; featuredOnly?: boolean }) {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      let q = supabase.from("gallery").select("id,url,featured,order_index").order("order_index", { ascending: true });
      if (featuredOnly) q = q.eq("featured", true);
      const { data } = await q;
      if (!active) return;
      setImages(((data || []) as GalleryImage[]).slice(0, featuredOnly ? count : 100));
    })();
    return () => { active = false; };
  }, [count, featuredOnly]);

  const itemsCount = featuredOnly ? count : Math.max(images.length, count);
  const items = Array.from({ length: itemsCount });
  const center = (itemsCount - 1) / 2;
  const offset = (i: number) => Math.abs(i - center) * 22;

  return (
    <>
      {/* Desktop fan */}
      <div className="hidden md:flex justify-center items-end h-[480px] mt-8" style={{ perspective: "1200px" }}>
        <div className="flex" style={{ transform: "rotateY(-12deg)" }}>
          {items.map((_, i) => (
            <div
              key={i}
              className="reveal w-[200px] h-[280px] -ml-12 first:ml-0 transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-16 hover:scale-105 hover:z-30"
              style={{
                transform: `translateY(-${offset(i)}px)`,
                transitionDelay: `${i * 0.06}s`,
                boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
              }}
            >
              <Tile img={images[i]} idx={i} label={t.gallery.placeholder} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile marquee */}
      <div className="md:hidden mt-6 overflow-hidden">
        <div className="marquee-track flex gap-3 w-max">
          {[...items, ...items].map((_, i) => {
            const idx = i % itemsCount;
            return (
              <div key={i} className="w-[220px] aspect-[4/3] shrink-0 rounded-[10px] overflow-hidden">
                <Tile img={images[idx]} idx={idx} label={t.gallery.placeholder} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
