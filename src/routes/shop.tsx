import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "מוצרים נלווים | לגעת ברגש" }] }),
  component: Shop,
});

type Product = {
  id: string;
  name_he: string;
  name_en: string | null;
  desc_he: string | null;
  desc_en: string | null;
  price: number;
  image_url: string | null;
  in_stock: boolean;
};

function Shop() {
  const { t, lang } = useLanguage();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name_he,name_en,desc_he,desc_en,price,image_url,in_stock")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  return (
    <section className="py-16 md:py-24 px-6 bg-[#F5F0E8] min-h-[60vh]">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-extralight text-[#2D1B3D] text-center mb-3">{t.shop_page.heading}</h1>
          <div className="flex justify-center mb-4"><span className="w-[26px] h-px bg-[#BA9B78] opacity-65" /></div>
          <p className="text-center text-[#4A3D30] font-light mb-14 max-w-2xl mx-auto">{t.shop_page.sub}</p>
        </Reveal>

        {isLoading && (
          <div className="text-center text-[#A0907A] text-sm py-12">…</div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="text-center text-[#A0907A] text-sm py-16">{t.shop_page.empty}</div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const name = lang === "en" && p.name_en ? p.name_en : p.name_he;
              const desc = lang === "en" && p.desc_en ? p.desc_en : p.desc_he;
              return (
                <Reveal key={p.id}>
                  <div className="bg-white rounded-2xl border border-[#E0D8CC] overflow-hidden shadow-sm flex flex-col h-full">
                    <div className="relative aspect-square bg-gradient-to-br from-[#4E8C85]/40 via-[#2D1B3D]/60 to-[#BA9B78]/50 flex items-center justify-center overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <span className="relative text-[#F5F0E8]/70 text-xs tracking-[0.25em] uppercase px-4 text-center">{name}</span>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h2 className="text-xl font-light text-[#2D1B3D] mb-2">{name}</h2>
                      {desc && <p className="text-sm text-[#4A3D30] font-light leading-relaxed flex-1">{desc}</p>}
                      <div className="flex items-center justify-between mt-5">
                        <span className="text-2xl font-serif text-[#BA9B78]">₪{Number(p.price).toLocaleString()}</span>
                        {!p.in_stock && <span className="text-xs text-[#A0907A]">{t.shop_page.out_of_stock}</span>}
                      </div>
                      <button disabled className="mt-4 px-6 py-3 bg-[#BA9B78]/60 cursor-not-allowed text-white rounded-full text-sm tracking-wide">
                        {t.shop_page.btn}
                      </button>
                      <p className="mt-2 text-xs text-[#A0907A] text-center">{t.shop_page.soon}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
