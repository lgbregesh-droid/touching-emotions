import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { InfoCard } from "@/components/InfoCard";
import { CTABand } from "@/components/CTABand";
import { buildContactUrl } from "@/lib/contact-link";
import { Heart, Sparkles, Users, BookOpen, ArrowRight, Copy, Check, Repeat, Phone } from "lucide-react";
import { useSiteContent } from "@/hooks/use-cms";

import community from "@/assets/home/community.jpg";

export const Route = createFileRoute("/donations")({
  head: () => ({
    meta: [
      { title: "תרומות | לגעת ברגש" },
      { name: "description", content: "תרומה לעמותת לגעת ברגש — תומכים בסדנאות, פעילויות בקהילה והנגשת מענה רגשי לילדים, נוער ומשפחות." },
    ],
  }),
  component: Donations,
});

const ICONS = [Heart, Users, Sparkles, BookOpen];

function Donations() {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";
  const { data: cms } = useSiteContent();
  const pick = (key: string, fb: string) => { const v = cms?.[key]; return v ? ((isEn ? v.en : v.he) || fb) : fb; };
  const d = t.donations_page;

  const [recurring, setRecurring] = useState(false);
  const [amount, setAmount] = useState<number | "custom">(100);
  const [custom, setCustom] = useState("");
  const [step, setStep] = useState<"choose" | "pay">("choose");
  const [copied, setCopied] = useState<string | null>(null);

  const finalAmount = amount === "custom" ? Number(custom) || 0 : amount;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <PageHero
        label={pick("donations.label", isEn ? "Donate" : "תרומות")}
        title={pick("donations.title", isEn ? "Every donation reaches a child" : "כל תרומה מגיעה לילד אחד")}
        intro={pick("donations.intro", d.intro)}
        background="cream"
      />

      {/* What your donation supports */}
      <section className="px-6 py-14 md:py-20" style={{ background: "#EAE3DA" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Your Impact" : "ההשפעה שלכם"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{d.why_heading}</h2>
              <p className="text-sm text-[#4A3D30] font-light mt-3 max-w-2xl mx-auto">{d.why_intro}</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5">
            {d.impact.map((item, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Reveal key={i} delay={i * 0.05}>
                  <InfoCard icon={Icon} title={item.title} desc={item.text} accent={(["blush", "teal", "purple", "gold"] as const)[i % 4]} />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donation options */}
      <section className="px-6 py-14 md:py-20" style={{ background: "#FDFBF7" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-8">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Choose Your Way" : "בחרו את הדרך"}</span>
              <h2 className="text-2xl md:text-3xl font-light text-[#461C5B] mt-3">{isEn ? "Donation options" : "אפשרויות תרומה"}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <OptionCard icon={Heart} title={isEn ? "One-time" : "חד-פעמית"} desc={isEn ? "A single contribution at the amount that fits you." : "תרומה אחת בסכום שמתאים לכם."} onClick={() => { setRecurring(false); setStep("choose"); }} active={!recurring} />
              <OptionCard icon={Repeat} title={isEn ? "Monthly" : "חודשית"} desc={isEn ? "Ongoing monthly support that lets us plan ahead." : "תמיכה חודשית שמאפשרת לתכנן קדימה."} onClick={() => { setRecurring(true); setStep("choose"); }} active={recurring} />
              <OptionCard icon={Phone} title={isEn ? "Contact us" : "יצירת קשר"} desc={isEn ? "Have a question or want to donate differently?" : "יש שאלה או רוצים לתרום אחרת? נשמח לשמוע."} onClick={() => (window.location.href = buildContactUrl({ type: "donation", source: "donations" }))} />
            </div>
          </Reveal>

          {/* Action card */}
          <Reveal>
            <div className="bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-10" style={{ borderRight: "3px solid rgba(229,163,173,0.5)" }}>
              {step === "choose" && (
                <>
                  <div className="flex rounded-full border border-[#E0D8CC] p-1 mb-8 bg-[#FDFBF7]">
                    {[false, true].map((r) => (
                      <button
                        key={String(r)}
                        onClick={() => setRecurring(r)}
                        className={`flex-1 py-2.5 rounded-full text-sm transition-colors ${recurring === r ? "bg-[#461C5B] text-white" : "text-[#4A3D30]"}`}
                      >
                        {r ? d.toggle_monthly : d.toggle_once}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[50, 100, 200].map((a) => (
                      <button
                        key={a}
                        onClick={() => setAmount(a)}
                        className={`py-4 rounded-xl border text-lg font-light transition ${amount === a ? "border-[#461C5B] bg-[#F7E8EA] text-[#461C5B]" : "border-[#E0D8CC] text-[#4A3D30] hover:border-[#BA9B78]"}`}
                      >
                        ₪{a}
                      </button>
                    ))}
                    <button
                      onClick={() => setAmount("custom")}
                      className={`py-4 rounded-xl border text-sm transition ${amount === "custom" ? "border-[#461C5B] bg-[#F7E8EA] text-[#461C5B]" : "border-[#E0D8CC] text-[#4A3D30] hover:border-[#BA9B78]"}`}
                    >
                      {d.custom}
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
                  <button
                    onClick={() => setStep("pay")}
                    disabled={finalAmount <= 0}
                    className="w-full py-3.5 bg-[#461C5B] hover:bg-[#5a2674] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-sm tracking-wide flex items-center justify-center gap-2 transition-colors"
                  >
                    {d.btn}
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </>
              )}

              {step === "pay" && (
                <div>
                  <button onClick={() => setStep("choose")} className="text-xs text-[#A0907A] hover:text-[#461C5B] mb-4 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    {d.back}
                  </button>

                  <div className="mb-6 pb-6 border-b border-[#E0D8CC]">
                    <p className="text-xs text-[#A0907A] mb-1">{recurring ? d.summary_monthly : d.summary_once}</p>
                    <p className="text-3xl font-light text-[#461C5B]">₪{finalAmount.toLocaleString()}</p>
                  </div>

                  <h3 className="text-lg text-[#461C5B] font-normal mb-2">{d.payment_heading}</h3>
                  <p className="text-sm text-[#4A3D30] font-light leading-relaxed mb-5 bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg p-4">
                    {d.payment_note}
                  </p>

                  <h4 className="text-sm text-[#461C5B] font-medium mb-3">{d.bank_heading}</h4>
                  <div className="space-y-2 text-sm">
                    <BankRow label="בנק" value="בנק לאומי לישראל בע״מ" />
                    <BankRow label="סניף" value="806 — לב דיזינגוף" />
                    <BankRow label="שם החשבון" value="לגעת ברגש (ע״ר)" />
                    <BankRow label="מספר חשבון" value="3182395" copyable copied={copied === "acct"} onCopy={() => copy("3182395", "acct")} />
                  </div>

                  <p className="mt-6 text-sm text-[#4E8C85] font-light text-center leading-relaxed">
                    {d.thanks}
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quote / impact */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#F7E8EA" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <Reveal>
            <img src={community} alt="" className="rounded-2xl w-full aspect-[4/3] object-cover" />
          </Reveal>
          <Reveal delay={0.1}>
            <span className="block text-5xl font-serif text-[#D4A373] leading-none mb-2">"</span>
            <p className="text-xl md:text-2xl font-light text-[#461C5B] leading-relaxed mb-4">
              {pick("donations.quote", isEn
                ? "Every donation, no matter the size, opens a door for another child to feel heard."
                : "כל תרומה, בכל גודל, פותחת דלת לעוד ילד שירגיש שמקשיבים לו.")}
            </p>
            <span className="text-xs tracking-[0.25em] uppercase text-[#BA9B78]">— {isEn ? "Touching Emotion" : "לגעת ברגש"}</span>
          </Reveal>
        </div>
      </section>

      <CTABand
        title={pick("donations.cta.title", isEn ? "Prefer to talk to us?" : "מעדיפים לדבר איתנו?")}
        sub={pick("donations.cta.sub", isEn ? "We'd love to hear from you — by phone, email or message." : "נשמח לשמוע — בטלפון, במייל או בהודעה.")}
        primaryLabel={isEn ? "Contact us" : "צרו קשר"}
        whatsappLabel={t.final_cta.whatsapp}
        variant="purple"
        context={{ type: "donation", source: "donations" }}
      />

    </>
  );
}

function OptionCard({ icon: Icon, title, desc, onClick, active }: { icon: typeof Heart; title: string; desc: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`text-right p-5 rounded-2xl border transition card-hover ${active ? "bg-[#F7E8EA] border-[#461C5B]" : "bg-white border-[#E0D8CC] hover:border-[#BA9B78]"}`}>
      <Icon className="w-6 h-6 text-[#BA9B78] mb-3" />
      <h3 className="text-[#461C5B] mb-1">{title}</h3>
      <p className="text-sm text-[#4A3D30] font-light leading-relaxed">{desc}</p>
    </button>
  );
}

function BankRow({
  label,
  value,
  copyable,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  copied?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[#E0D8CC]/60 last:border-0">
      <span className="text-[#A0907A]">{label}</span>
      <span className="flex items-center gap-2 text-[#461C5B] font-medium">
        {value}
        {copyable && (
          <button onClick={onCopy} className="p-1 text-[#BA9B78] hover:text-[#461C5B] transition-colors" aria-label="העתק">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </span>
    </div>
  );
}
