import { useEffect, useMemo, useState, KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

const palette = [
  "from-[#4E8C85]/60 to-[#2D1B3D]/80",
  "from-[#BA9B78]/55 to-[#2D1B3D]/85",
  "from-[#2D1B3D]/70 to-[#4E8C85]/60",
  "from-[#BA9B78]/45 to-[#4E8C85]/60",
  "from-[#4E8C85]/55 to-[#BA9B78]/45",
  "from-[#2D1B3D]/80 to-[#BA9B78]/40",
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

/* ---------- Featured fan (home page) ---------- */
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

/* ---------- Grid + lightbox (gallery page) ---------- */
function GridGallery({ images, label }: { images: GalleryImage[]; label: string }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string>("__all__");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const availableCats = useMemo(() => {
    const set = new Set(images.map((i) => i.category || "כללי"));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [images]);

  const filtered = filter === "__all__" ? images : images.filter((i) => (i.category || "כללי") === filter);

  const handleNext = () => {
    if (!selectedId) return;
    const i = filtered.findIndex((x) => x.id === selectedId);
    setSelectedId(filtered[(i + 1) % filtered.length].id);
  };
  const handlePrev = () => {
    if (!selectedId) return;
    const i = filtered.findIndex((x) => x.id === selectedId);
    setSelectedId(filtered[(i - 1 + filtered.length) % filtered.length].id);
  };
  const selected = filtered.find((i) => i.id === selectedId);

  const handleCardKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedId(id);
    }
  };

  const catLabel = (c: string) => t.gallery_page.categories[CAT_KEY[c]] || c;

  return (
    <div>
      {/* Filter pills */}
      <div className="mt-8 -mx-2 px-2 overflow-x-auto">
        <div className="flex gap-2 justify-start md:justify-center min-w-max">
          {[{ key: "__all__", label: t.gallery_page.filter_all }, ...availableCats.map((c) => ({ key: c, label: catLabel(c) }))].map((p) => {
            const active = filter === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setFilter(p.key)}
                aria-pressed={active}
                className={`px-4 py-1.5 text-xs tracking-wider transition whitespace-nowrap ${
                  active ? "bg-[#BA9B78] text-white" : "text-[#F5F0E8]/60 hover:text-[#F5F0E8]/90"
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

      {/* Grid */}
      <motion.div
        layout
        className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <div
                onClick={() => setSelectedId(image.id)}
                onKeyDown={(e) => handleCardKeyDown(e, image.id)}
                role="button"
                tabIndex={0}
                aria-label={`${label} ${index + 1}`}
                className="group relative overflow-hidden rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#BA9B78]"
                style={{ background: "rgba(245,240,232,0.04)", border: "0.5px solid rgba(186,155,120,0.2)" }}
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={image.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                {/* Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2D1B3D] via-[#2D1B3D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex items-center gap-2 text-[#F5F0E8]/80 text-[10px] tracking-[0.18em] uppercase">
                    <ZoomIn className="h-3 w-3" />
                    {catLabel(image.category || "כללי")}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center text-[#F5F0E8]/50 py-16 text-sm">—</div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedId(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="relative max-h-[90vh] max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="absolute -top-12 right-0 rtl:right-auto rtl:left-0 text-[#F5F0E8] hover:text-[#BA9B78] transition"
              >
                <X className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                aria-label="Previous"
                className="absolute top-1/2 -translate-y-1/2 left-2 md:-left-14 rtl:left-auto rtl:right-2 rtl:md:right-auto rtl:md:-right-14 text-[#F5F0E8] hover:text-[#BA9B78] transition bg-black/30 rounded-full p-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next"
                className="absolute top-1/2 -translate-y-1/2 right-2 md:-right-14 rtl:right-auto rtl:left-2 rtl:md:left-auto rtl:md:-left-14 text-[#F5F0E8] hover:text-[#BA9B78] transition bg-black/30 rounded-full p-2"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <img
                src={selected.url}
                alt=""
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-3 text-center">
                <span className="inline-block px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-[#F5F0E8]/80 border border-[#BA9B78]/40 rounded-full">
                  {catLabel(selected.category || "כללי")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Public API ---------- */
export function Gallery({ count = 8, featuredOnly = true }: { count?: number; featuredOnly?: boolean }) {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);

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

  if (featuredOnly) {
    return <FanRow images={images} count={count} label={t.gallery.placeholder} />;
  }
  return <GridGallery images={images} label={t.gallery.placeholder} />;
}
