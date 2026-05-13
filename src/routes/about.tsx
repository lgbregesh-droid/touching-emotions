import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "אודות | לגעת ברגש" }, { name: "description", content: "אודות עמותת לגעת ברגש — מטרות, ערכים ומה שהופך אותנו לייחודיים." }] }),
  component: About,
});

function About() {
  const { t } = useLanguage();
  const goals = [t.about_page.goal1, t.about_page.goal2, t.about_page.goal3, t.about_page.goal4, t.about_page.goal5];
  const unique = [t.about_page.u1, t.about_page.u2, t.about_page.u3, t.about_page.u4, t.about_page.u5];
  return (
    <>
      <div className="shimmer-line" />
      <section className="py-16 md:py-24 px-6 bg-[#F5F0E8]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h1 className="text-4xl md:text-6xl font-extralight text-[#2D1B3D] text-center mb-3">{t.about_page.heading}</h1>
            <div className="flex justify-center mb-12"><span className="w-[26px] h-px bg-[#BA9B78] opacity-65" /></div>
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#E0D8CC]" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
              <p className="text-lg text-[#4A3D30] leading-loose font-light">{t.about_page.org_text}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 bg-[#F0F5F3]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-light text-[#2D1B3D] text-center mb-12">{t.about_page.goals_heading}</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((g, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="card-hover bg-white border border-[#E0D8CC] rounded-xl p-6 h-full">
                  <div className="text-[#BA9B78] font-serif text-2xl mb-3">0{i + 1}</div>
                  <p className="text-[#4A3D30] font-light">{g}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6" style={{ background: "linear-gradient(135deg, #EDE6DC 55%, rgba(78,140,133,0.10) 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-light text-[#2D1B3D] text-center mb-12">{t.about_page.unique_heading}</h2>
          </Reveal>
          <ul className="space-y-4">
            {unique.map((u, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <li className="bg-white/70 backdrop-blur rounded-xl p-5 border border-[#E0D8CC] flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-[#BA9B78] text-white flex items-center justify-center text-sm">{i + 1}</span>
                  <p className="text-[#4A3D30] font-light leading-relaxed pt-1">{u}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
