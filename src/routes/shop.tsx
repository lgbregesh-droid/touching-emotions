import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "חנות | לגעת ברגש" }] }),
  component: Shop,
});

function Shop() {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-24 px-6 bg-[#F5F0E8] min-h-[60vh]">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-extralight text-[#2D1B3D] text-center mb-3">{t.shop_page.heading}</h1>
          <div className="flex justify-center mb-14"><span className="w-[26px] h-px bg-[#BA9B78] opacity-65" /></div>
        </Reveal>
        <Reveal>
          <div className="bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden grid md:grid-cols-2 shadow-sm">
            <div className="relative aspect-square md:aspect-auto bg-gradient-to-br from-[#4E8C85]/40 via-[#2D1B3D]/60 to-[#BA9B78]/50 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B3D]/40 to-transparent" />
              <span className="relative text-[#F5F0E8]/70 text-xs tracking-[0.25em] uppercase">{t.shop_page.product_title}</span>
            </div>
            <div className="p-8 md:p-12 flex flex-col">
              <h2 className="text-2xl md:text-3xl font-light text-[#2D1B3D] mb-4">{t.shop_page.product_title}</h2>
              <p className="text-[#4A3D30] font-light leading-relaxed flex-1">{t.shop_page.product_desc}</p>
              <div className="text-3xl font-serif text-[#BA9B78] mt-6">{t.shop_page.price}</div>
              <button disabled className="mt-6 px-8 py-3.5 bg-[#BA9B78]/60 cursor-not-allowed text-white rounded-full text-sm tracking-wide">
                {t.shop_page.btn}
              </button>
              <p className="mt-2 text-xs text-[#A0907A]">{t.shop_page.soon}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
