import { createFileRoute, Link } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/workshops")({
  head: () => ({ meta: [{ title: "סדנאות והרצאות | לגעת ברגש" }, { name: "description", content: "סדנאות חוסן רגשי, תוכניות שנתיות, הדרכות הורים וצוותים." }] }),
  component: Workshops,
});

function Workshops() {
  const { t } = useLanguage();
  const items = [
    { title: t.workshops_page.w1_title, desc: t.workshops_page.w1_desc },
    { title: t.workshops_page.w2_title, desc: t.workshops_page.w2_desc },
    { title: t.workshops_page.w3_title, desc: t.workshops_page.w3_desc },
    { title: t.workshops_page.w4_title, desc: t.workshops_page.w4_desc },
    { title: t.workshops_page.w5_title, desc: t.workshops_page.w5_desc },
    { title: t.workshops_page.w6_title, desc: t.workshops_page.w6_desc },
  ];
  return (
    <>
      <div className="shimmer-line" />
      <section className="py-16 md:py-24 px-6 bg-[#F5F0E8]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h1 className="text-4xl md:text-6xl font-extralight text-[#2D1B3D] text-center mb-3">{t.workshops_page.heading}</h1>
            <div className="flex justify-center mb-6"><span className="w-[26px] h-px bg-[#BA9B78] opacity-65" /></div>
            <p className="text-center text-[#4A3D30] font-light max-w-2xl mx-auto mb-14">{t.workshops_page.sub}</p>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it, i) => (
              <Reveal key={i} delay={(i % 3) * 0.1}>
                <div
                  className="card-hover bg-white border border-[#E0D8CC] rounded-2xl p-7 h-full flex flex-col"
                  style={i % 2 === 1 ? { borderRight: "2px solid rgba(78,140,133,0.25)" } : undefined}
                >
                  <h3 className="text-xl text-[#2D1B3D] font-normal mb-3">{it.title}</h3>
                  <p className="text-[#4A3D30] font-light leading-relaxed flex-1">{it.desc}</p>
                  <Link to="/contact" className="mt-6 inline-block self-start px-5 py-2 border border-[#BA9B78] text-[#2D1B3D] text-xs tracking-wide rounded-full hover:bg-[#BA9B78] hover:text-white transition-colors">
                    {t.workshops_page.contact_cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
