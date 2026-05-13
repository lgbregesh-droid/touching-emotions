import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/donations")({
  head: () => ({ meta: [{ title: "תרומות | לגעת ברגש" }] }),
  component: Donations,
});

function Donations() {
  const { t } = useLanguage();
  const [recurring, setRecurring] = useState(false);
  const [amount, setAmount] = useState<number | "custom">(100);
  const [custom, setCustom] = useState("");
  return (
    <section className="py-16 md:py-24 px-6 bg-[#F5F0E8]">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-extralight text-[#2D1B3D] text-center mb-3">{t.donations_page.heading}</h1>
          <div className="flex justify-center mb-6"><span className="w-[26px] h-px bg-[#BA9B78] opacity-65" /></div>
          <p className="text-center text-[#4A3D30] font-light mb-12">{t.donations_page.intro}</p>
        </Reveal>

        <Reveal>
          <div className="bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-10" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
            <div className="flex rounded-full border border-[#E0D8CC] p-1 mb-8 bg-[#F5F0E8]">
              {[false, true].map((r) => (
                <button
                  key={String(r)}
                  onClick={() => setRecurring(r)}
                  className={`flex-1 py-2.5 rounded-full text-sm transition-colors ${recurring === r ? "bg-[#BA9B78] text-white" : "text-[#4A3D30]"}`}
                >
                  {r ? t.donations_page.toggle_monthly : t.donations_page.toggle_once}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[50, 100, 200].map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={`py-4 rounded-xl border text-lg font-light transition ${amount === a ? "border-[#BA9B78] bg-[#BA9B78]/10 text-[#2D1B3D]" : "border-[#E0D8CC] text-[#4A3D30] hover:border-[#BA9B78]/60"}`}
                >
                  ₪{a}
                </button>
              ))}
              <button
                onClick={() => setAmount("custom")}
                className={`py-4 rounded-xl border text-sm transition ${amount === "custom" ? "border-[#BA9B78] bg-[#BA9B78]/10 text-[#2D1B3D]" : "border-[#E0D8CC] text-[#4A3D30] hover:border-[#BA9B78]/60"}`}
              >
                {t.donations_page.custom}
              </button>
            </div>
            {amount === "custom" && (
              <input
                type="number"
                min="1"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="₪"
                className="w-full mb-6 px-4 py-3 rounded-xl border border-[#E0D8CC] bg-white text-[#4A3D30] outline-none focus:border-[#BA9B78]"
              />
            )}
            <button disabled className="btn-pulse w-full py-3.5 bg-[#BA9B78]/60 cursor-not-allowed text-white rounded-full text-sm tracking-wide">
              {t.donations_page.btn}
            </button>
            <p className="mt-2 text-xs text-[#A0907A] text-center">{t.donations_page.soon}</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-10 bg-[#F0F5F3] rounded-xl border border-[#E0D8CC] p-6 md:p-8">
            <h3 className="text-lg text-[#2D1B3D] font-normal mb-4">{t.donations_page.bank_heading}</h3>
            <ul className="text-[#4A3D30] font-light space-y-1 text-sm leading-relaxed">
              <li>בנק לאומי לישראל בע"מ</li>
              <li>סניף 806 — לב דיזינגוף</li>
              <li>לגעת ברגש (ע"ר)</li>
              <li>מספר חשבון: <span className="font-medium text-[#2D1B3D]">3182395</span></li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
