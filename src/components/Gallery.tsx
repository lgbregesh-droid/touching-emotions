import { useEffect, useMemo, useState } from "react";
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
];

type GalleryImage = { id: string; url: string; category: string };

const CATEGORY_ORDER = ["סדנה", "הכשרה", "הרצאה", "מפגש קהילתי", "ערב עיון", "כללי"] as const;
const CAT_KEY: Record<string, "workshop" | "training" | "lecture" | "community" | "evening" | "general"> = {
  "סדנה": "workshop",
  "הכשרה": "training",
  "הרצאה": "lecture",
  "מפגש קהילתי": "community",
  "ערב עיון": "evening",
  "כללי": "general",
};

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

function FanRow({ images, count, label }: { images: GalleryImage[]; count: number; label: string }) {
  const itemsCount = Math.max(images.length, count);
  const items = Array.from({ length: itemsCount });
  const center = (itemsCount - 1) / 2;
  const offset = (i: number) => Math.abs(i - center) * 22;
  return (
    <>
      <div className="hidden md:flex justify-center items-end h-[480px] mt-4" style={{ perspective: "1200px" }}>
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
              <Tile img={images[i]} idx={i} label={label} />
            </div>
          ))}
        </div>
      </div>
      <div className="md:hidden mt-4 overflow-hidden">
        <div className="marquee-track flex gap-3 w-max">
          {[...items, ...items].map((_, i) => {
            const idx = i % itemsCount;
            return (
              <div key={i} className="w-[220px] aspect-[4/3] shrink-0 rounded-[10px] overflow-hidden">
                <Tile img={images[idx]} idx={idx} label={label} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function Gallery({ count = 8, featuredOnly = true }: { count?: number; featuredOnly?: boolean }) {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filter, setFilter] = useState<string>("__all__");
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      let q = supabase.from("gallery").select("id,url,category,featured,order_index").order("order_index", { ascending: true });
      if (featuredOnly) q = q.eq("featured", true);
      const { data } = await q;
      if (!active) return;
      const rows = (data || []) as GalleryImage[];
      setImages(featuredOnly ? rows.slice(0, count) : rows);
    })();
    return () => { active = false; };
  }, [count, featuredOnly]);

  const availableCats = useMemo(() => {
    const set = new Set(images.map((i) => i.category || "כללי"));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [images]);

  // Featured/home mode — original single fan
  if (featuredOnly) {
    return <FanRow images={images} count={count} label={t.gallery.placeholder} />;
  }

  const filtered = filter === "__all__" ? images : images.filter((i) => (i.category || "כללי") === filter);
  const grouped = filter === "__all__"
    ? CATEGORY_ORDER.map((cat) => ({ cat, items: images.filter((i) => (i.category || "כללי") === cat) })).filter((g) => g.items.length > 0)
    : [{ cat: filter, items: filtered }];

  const handleSelect = (val: string) => {
    if (val === filter) return;
    setFadeKey((k) => k + 1);
    setFilter(val);
  };

  return (
    <div>
      {/* Filter pills */}
      <div className="mt-8 -mx-2 px-2 overflow-x-auto">
        <div className="flex gap-2 justify-start md:justify-center min-w-max">
          {[{ key: "__all__", label: t.gallery_page.filter_all }, ...availableCats.map((c) => ({ key: c, label: t.gallery_page.categories[CAT_KEY[c]] }))].map((p) => {
            const active = filter === p.key;
            return (
              <button
                key={p.key}
                onClick={() => handleSelect(p.key)}
                className={`px-4 py-1.5 text-xs tracking-wider transition whitespace-nowrap ${
                  active
                    ? "bg-[#BA9B78] text-white"
                    : "text-[#F5F0E8]/60 hover:text-[#F5F0E8]/90"
                }`}
                style={{
                  borderRadius: 20,
                  border: active ? "0.5px solid transparent" : "0.5px solid rgba(186,155,120,0.35)",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div key={fadeKey} style={{ animation: "fadeInUp 0.35s ease-out both" }}>
        {grouped.map((g) => (
          <div key={g.cat} className="mt-10">
            {filter === "__all__" && (
              <div className="text-center">
                <div
                  className="text-[#F5F0E8]/50 uppercase"
                  style={{ fontSize: 11, letterSpacing: "0.08em" }}
                >
                  {t.gallery_page.categories[CAT_KEY[g.cat]] || g.cat}
                </div>
                <div className="mx-auto mt-2 h-px" style={{ width: 20, background: "#BA9B78", opacity: 0.4 }} />
              </div>
            )}
            <FanRow images={g.items} count={Math.max(g.items.length, 4)} label={t.gallery.placeholder} />
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="text-center text-[#F5F0E8]/50 py-16 text-sm">—</div>
        )}
      </div>
    </div>
  );
}
