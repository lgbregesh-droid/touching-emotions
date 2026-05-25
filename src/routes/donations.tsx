import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { InfoCard } from "@/components/InfoCard";
import { CTABand } from "@/components/CTABand";
import { buildContactUrl } from "@/lib/contact-link";
import { Heart, Sparkles, Users, BookOpen, ArrowDown, Copy, Check, Phone } from "lucide-react";
import { useSiteContent } from "@/hooks/use-cms";

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
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1800); } catch { /* ignore */ }
  };

  const scrollToDonate = () => {
    document.getElementById("donate")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHero
        compact
        label={pick("donations.label", isEn ? "Donate" : "תרומות")}
        title={pick("donations.title", isEn ? "Every donation reaches a child" : "כל תרומה מגיעה לילד אחד")}
        background="cream"
      />

      {/* Quick skip-to-donate */}
      <div className="px-6 pt-2 pb-6 text-center" style={{ background: "#FDFBF7" }}>
        <button
          onClick={scrollToDonate}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#461C5B] hover:bg-[#5a2674] text-white rounded-full text-sm tracking-wide transition-colors"
        >
          {isEn ? "Skip to donate" : "מעבר ישיר לתרומה"}
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

      {/* Why this organization */}
      <section className="px-6 py-14 md:py-20" style={{ background: "#EAE3DA" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Why Touching Emotion" : "למה לגעת ברגש"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">
                {pick("donations.why.heading", isEn ? "An organization that truly listens" : "עמותה שבאמת מקשיבה")}
              </h2>
              <p className="text-[#4A3D30] font-light leading-relaxed mt-5 text-base md:text-lg max-w-3xl mx-auto">
                {pick("donations.why.text", isEn
                  ? "Touching Emotion is built around one belief: every child deserves a space where their feelings are seen and respected. We don't run formal lectures — we sit with children, teens and families inside their everyday spaces (schools, communities, homes) and build real emotional language with them."
                  : "לגעת ברגש נבנתה סביב אמונה אחת: לכל ילד מגיע מרחב שבו הרגשות שלו נראים ומכובדים. אנחנו לא מעבירים הרצאות פורמליות — אנחנו יושבים עם ילדים, נוער ומשפחות בתוך המרחבים היומיומיים שלהם (בתי ספר, קהילות, בתים) ובונים איתם שפה רגשית אמיתית.")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How donations are used */}
      <section className="px-6 py-14 md:py-20" style={{ background: "#FDFBF7" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Where It Goes" : "לאן זה הולך"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">
                {pick("donations.where.heading", isEn ? "Your donation, in real action" : "התרומה שלכם, בפעולה אמיתית")}
              </h2>
              <p className="text-sm text-[#4A3D30] font-light mt-3 max-w-2xl mx-auto">
                {pick("donations.where.intro", isEn
                  ? "Every shekel goes directly to the field — to workshops, materials, training and the human time it takes to truly meet a child."
                  : "כל שקל מגיע ישירות לשטח — לסדנאות, לחומרים, להכשרות ולשעות אדם אמיתיות שדורש מפגש משמעותי עם ילד.")}
              </p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
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

      {/* What makes us unique */}
      <section className="px-6 py-14 md:py-20" style={{ background: "#F7E8EA" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-8">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "What Makes Us Different" : "מה מייחד אותנו"}</span>
              <h2 className="text-2xl md:text-3xl font-light text-[#461C5B] mt-3">
                {pick("donations.unique.heading", isEn ? "A different kind of emotional work" : "עבודה רגשית מסוג אחר")}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <UniqueItem
                title={pick("donations.unique.1.title", isEn ? "Personal, not formal" : "אישי, לא פורמלי")}
                text={pick("donations.unique.1.text", isEn ? "We don't lecture — we sit, listen and create together with each group." : "אנחנו לא מרצים — אנחנו יושבים, מקשיבים ויוצרים יחד עם כל קבוצה.")}
              />
              <UniqueItem
                title={pick("donations.unique.2.title", isEn ? "Built with the community" : "נבנה עם הקהילה")}
                text={pick("donations.unique.2.text", isEn ? "Every workshop is tailored to the specific school, family or group." : "כל סדנה מותאמת לבית הספר, למשפחה או לקבוצה הספציפית.")}
              />
              <UniqueItem
                title={pick("donations.unique.3.title", isEn ? "Lean and direct" : "רזה וישיר")}
                text={pick("donations.unique.3.text", isEn ? "No heavy overhead. Donations turn into hours with children almost immediately." : "ללא תקורה מנופחת. תרומות הופכות לשעות עם ילדים כמעט מיידית.")}
              />
              <UniqueItem
                title={pick("donations.unique.4.title", isEn ? "Long-term presence" : "נוכחות לאורך זמן")}
                text={pick("donations.unique.4.text", isEn ? "We come back. We follow up. We're not a one-time visit." : "אנחנו חוזרים. אנחנו ממשיכים ללוות. לא מפגש חד-פעמי.")}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Donation section */}
      <section id="donate" className="px-6 py-14 md:py-20 scroll-mt-24" style={{ background: "#FDFBF7" }}>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-8">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Donate" : "תרומה"}</span>
              <h2 className="text-2xl md:text-3xl font-light text-[#461C5B] mt-3">
                {pick("donations.donate.heading", isEn ? "Donate via bank transfer" : "תרומה בהעברה בנקאית")}
              </h2>
              <p className="text-sm text-[#4A3D30] font-light mt-3 max-w-2xl mx-auto">
                {pick("donations.donate.intro", isEn
                  ? "Transfer any amount you choose. After the transfer, we'd love a quick message so we can send you a receipt and a personal thank-you."
                  : "אפשר להעביר כל סכום שבחרתם. אחרי ההעברה נשמח להודעה קצרה כדי לשלוח לכם קבלה ותודה אישית.")}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-10" style={{ borderRight: "3px solid rgba(229,163,173,0.5)" }}>
              <h4 className="text-sm text-[#461C5B] font-medium mb-4">{d.bank_heading}</h4>
              <div className="space-y-2 text-sm">
                <BankRow label="בנק" value="בנק לאומי לישראל בע״מ" />
                <BankRow label="סניף" value="806 — לב דיזינגוף" />
                <BankRow label="שם החשבון" value="לגעת ברגש (ע״ר)" />
                <BankRow label="מספר חשבון" value="3182395" copyable copied={copied === "acct"} onCopy={() => copy("3182395", "acct")} />
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <a
                  href={buildContactUrl({ type: "donation", source: "donations" })}
                  className="inline-flex items-center justify-center gap-2 py-3 bg-[#461C5B] hover:bg-[#5a2674] text-white rounded-full text-sm tracking-wide transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {isEn ? "Send us a message" : "שלחו לנו הודעה"}
                </a>
                <a
                  href={buildContactUrl({ type: "donation", source: "donations" })}
                  className="inline-flex items-center justify-center gap-2 py-3 border border-[#461C5B] text-[#461C5B] hover:bg-[#F7E8EA] rounded-full text-sm tracking-wide transition-colors"
                >
                  {isEn ? "Other donation options" : "אפשרויות תרומה אחרות"}
                </a>
              </div>

              <p className="mt-6 text-sm text-[#4E8C85] font-light text-center leading-relaxed">
                {d.thanks}
              </p>
            </div>
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

function UniqueItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white/70 rounded-2xl border border-[#E0D8CC] p-5">
      <h3 className="text-[#461C5B] mb-2 font-normal">{title}</h3>
      <p className="text-sm text-[#4A3D30] font-light leading-relaxed">{text}</p>
    </div>
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
