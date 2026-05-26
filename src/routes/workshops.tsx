import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent, useWorkshops } from "@/hooks/use-cms";
import { Reveal } from "@/components/Reveal";
import { CompactPageHeader } from "@/components/CompactPageHeader";
import { CTABand } from "@/components/CTABand";
import { buildContactUrl } from "@/lib/contact-link";

import { Phone, Search, Wand2, Sparkles, Heart, MessagesSquare, Users, Compass, ShieldCheck, ArrowRight, X } from "lucide-react";
import workshopChildren from "@/assets/home/workshop-children.jpg";
import workshopTeens from "@/assets/home/workshop-teens.jpg";
import school from "@/assets/home/school.jpg";
import community from "@/assets/home/community.jpg";
import facilitator from "@/assets/home/facilitator.jpg";
import parents from "@/assets/home/parents.jpg";

export const Route = createFileRoute("/workshops")({
  head: () => ({
    meta: [
      { title: "סדנאות ופעילויות | לגעת ברגש" },
      { name: "description", content: "סדנאות חוסן רגשי, הרצאות והכשרות לילדים, נוער, מוסדות חינוך וקהילות — מותאמות לגיל, לקהל ולמטרה." },
    ],
  }),
  component: Workshops,
});

const CATEGORIES = ["children", "teens", "schools", "communities", "parents"] as const;
type Cat = (typeof CATEGORIES)[number];

function Workshops() {
  const { t, lang } = useLanguage();
  const { data: cms } = useSiteContent();
  const { data: dbWorkshops } = useWorkshops();
  const isEn = lang === "en";
  const pick = (key: string, fallback: string) => {
    const v = cms?.[key];
    if (!v) return fallback;
    return (isEn ? v.en : v.he) || fallback;
  };
  const [filter, setFilter] = useState<Cat | "all">("all");

  const catLabel: Record<Cat, string> = {
    children: isEn ? "Children" : "ילדים",
    teens: isEn ? "Teens" : "נוער",
    schools: isEn ? "Schools" : "צוותים חינוכיים",
    communities: isEn ? "Communities" : "קהילות",
    parents: isEn ? "Parents" : "הורים",
  };

  const fallback: { cat: Cat; title: string; desc: string; goals: string[]; duration: string; image: string }[] = [
    {
      cat: "children", title: isEn ? "Emotion Detectives" : "בלשי הרגשות",
      desc: isEn ? "Experiential workshop teaching kids to recognize and name what they feel through play, art and movement." : "סדנה חווייתית שמלמדת ילדים לזהות ולתת שם לרגשות דרך משחק, יצירה ותנועה.",
      goals: isEn ? ["Emotional vocabulary", "Self-awareness", "Confidence"] : ["שפה רגשית", "מודעות עצמית", "ביטחון"],
      duration: isEn ? "90 min · grades 1–4" : "90 דק׳ · א׳–ד׳", image: workshopChildren,
    },
    {
      cat: "teens", title: isEn ? "Real Talk — Identity & Belonging" : "שיח אמיתי — זהות ושייכות",
      desc: isEn ? "Open conversation circle on identity, social pressure and choices, in a language teens trust." : "מעגל שיח פתוח על זהות, לחץ חברתי ובחירות — בשפה שנוער מתחבר אליה.",
      goals: isEn ? ["Belonging", "Self-expression", "Coping with change"] : ["שייכות", "ביטוי עצמי", "התמודדות עם שינוי"],
      duration: isEn ? "120 min · ages 13–18" : "120 דק׳ · גילאי 13–18", image: workshopTeens,
    },
    {
      cat: "schools", title: isEn ? "Annual Resilience Program" : "תוכנית חוסן שנתית",
      desc: isEn ? "Multi-session program for entire grades — combines staff training, class workshops and parent evenings." : "תוכנית רב-מפגשית לשכבות שלמות — משלבת הכשרת צוות, סדנאות כיתתיות וערבי הורים.",
      goals: isEn ? ["Shared school language", "Staff tools", "Whole-grade impact"] : ["שפה בית-ספרית", "כלים לצוות", "השפעה רוחבית"],
      duration: isEn ? "Annual · tailored" : "שנתי · מותאם", image: school,
    },
    {
      cat: "communities", title: isEn ? "Community Dialogue Circles" : "מעגלי שיח קהילתיים",
      desc: isEn ? "Evening sessions for community centers — open conversation, mutual listening, shared language." : "ערבי שיח לקהילות ולמתנ\"סים — שיחה פתוחה, הקשבה הדדית ובניית שפה משותפת.",
      goals: isEn ? ["Belonging", "Trust", "Community language"] : ["שייכות", "אמון", "שפה קהילתית"],
      duration: isEn ? "2 hrs · evening" : "כשעתיים · ערב", image: community,
    },
    {
      cat: "parents", title: isEn ? "Parents' Toolkit" : "ארגז הכלים של ההורים",
      desc: isEn ? "Practical evening for parents — tools for emotional conversations, boundaries and connection at home." : "מפגש פרקטי להורים — כלים לשיחות רגשיות, הצבת גבולות וחיבור בבית.",
      goals: isEn ? ["Family communication", "Boundaries", "Connection"] : ["תקשורת משפחתית", "גבולות", "חיבור"],
      duration: isEn ? "2 hrs · evening" : "כשעתיים · ערב", image: parents,
    },
    {
      cat: "schools", title: isEn ? "Staff Training Day" : "יום הכשרה לצוות",
      desc: isEn ? "Hands-on training for teachers and counselors — how to lead emotional dialogue in the classroom." : "הכשרה מעשית למורים ומחנכים — איך להוביל שיח רגשי בכיתה.",
      goals: isEn ? ["Facilitation tools", "Group management", "Safe space"] : ["כלי הנחיה", "ניהול קבוצה", "מרחב בטוח"],
      duration: isEn ? "Half day · 4–6 hrs" : "חצי יום · 4–6 שעות", image: facilitator,
    },
  ];

  type Row = { id?: string; name_he?: string; name_en?: string | null; desc_he?: string | null; desc_en?: string | null; full_description?: string | null; image_url?: string | null; category?: string | null; duration_text?: string | null; audience?: string | null; goals_list?: string | null };
  type WS = { title: string; desc: string; full: string; goals: string[]; duration: string; image: string; cat: Cat };
  const workshops: WS[] = (dbWorkshops && dbWorkshops.length > 0)
    ? (dbWorkshops as Row[]).map((r) => ({
        cat: ((["children", "teens", "schools", "communities", "parents"].includes(r.category || "")) ? r.category : "children") as Cat,
        title: (isEn ? (r.name_en || r.name_he) : (r.name_he || r.name_en)) || "",
        desc: (isEn ? (r.desc_en || r.desc_he) : (r.desc_he || r.desc_en)) || "",
        full: r.full_description || "",
        goals: (r.goals_list || "").split(",").map((s) => s.trim()).filter(Boolean),
        duration: r.duration_text || r.audience || "",
        image: r.image_url || workshopChildren,
      }))
    : fallback.map((f) => ({ ...f, full: "" }));

  const filtered = filter === "all" ? workshops : workshops.filter((w) => w.cat === filter);
  const [openWs, setOpenWs] = useState<WS | null>(null);

  const process = [
    { icon: Phone, title: isEn ? "Intro call" : "שיחת היכרות", desc: isEn ? "We listen to the setting, audience and what you're hoping for." : "מקשיבים למסגרת, לקהל ולמה אתם מקווים לקבל." },
    { icon: Search, title: isEn ? "Mapping the need" : "הבנת הצורך", desc: isEn ? "We map the challenges, age and group dynamics together." : "ממפים יחד את האתגרים, הגיל והדינמיקה בקבוצה." },
    { icon: Wand2, title: isEn ? "Tailoring" : "התאמה", desc: isEn ? "We design a session that fits your group's age, time and goal." : "בונים סדנה שמתאימה לגיל, לזמן ולמטרה שלכם." },
    { icon: Sparkles, title: isEn ? "Experiential session" : "מפגש חווייתי", desc: isEn ? "Warm, professional facilitation that leaves real impact." : "הנחיה חמה ומקצועית שמשאירה השפעה אמיתית." },
  ];

  const gains = [
    { icon: Heart, title: isEn ? "Emotional expression" : "ביטוי רגשות" },
    { icon: ShieldCheck, title: isEn ? "Self-confidence" : "ביטחון עצמי" },
    { icon: Users, title: isEn ? "Belonging" : "שייכות" },
    { icon: MessagesSquare, title: isEn ? "Communication" : "תקשורת" },
    { icon: Compass, title: isEn ? "Coping tools" : "כלים להתמודדות" },
  ];

  return (
    <>
      <PageHero
        label={isEn ? "Workshops & Activities" : "סדנאות ופעילויות"}
        title={pick("workshops.title", isEn ? "Workshops tailored to age, group and need" : "סדנאות שמותאמות לגיל, לקבוצה ולצורך")}
        intro={pick("workshops.subtitle", isEn
          ? "Every workshop is built together with you. Choose by audience, see how it works, and book a tailored session for your school, group or community."
          : "כל סדנה נבנית יחד איתכם. בחרו לפי קהל יעד, ראו איך התהליך עובד והזמינו מפגש מותאם לבית הספר, לקבוצה או לקהילה שלכם.")}
        ctaLabel={isEn ? "Book a workshop" : "להזמנת סדנה"}
        ctaTo="/contact"
        background="cream"
      />

      {/* Category filter */}
      <section className="px-6 py-10 md:py-12" style={{ background: "#EAE3DA" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>{isEn ? "All" : "הכל"}</FilterPill>
            {CATEGORIES.map((c) => (
              <FilterPill key={c} active={filter === c} onClick={() => setFilter(c)}>{catLabel[c]}</FilterPill>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((w, i) => (
              <Reveal key={i} delay={(i % 3) * 0.06}>
                <button
                  type="button"
                  onClick={() => setOpenWs(w)}
                  className="text-right bg-white rounded-2xl overflow-hidden border border-[#E0D8CC] h-full flex flex-col card-hover w-full"
                  style={{ borderRight: "3px solid rgba(229,163,173,0.5)" }}
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={w.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] tracking-[0.18em] uppercase text-[#BA9B78] mb-2">{catLabel[w.cat]}</span>
                    <h3 className="text-lg text-[#461C5B] mb-2">{w.title}</h3>
                    <p className="text-sm text-[#4A3D30] font-light leading-relaxed mb-4">{w.desc}</p>
                    {w.duration && <div className="text-xs text-[#A0907A] mb-3">{w.duration}</div>}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {w.goals.map((g) => (
                        <span key={g} className="text-[11px] px-2 py-1 rounded-full bg-[#F7E8EA] text-[#461C5B]">{g}</span>
                      ))}
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm text-[#461C5B]">
                      {isEn ? "What this workshop includes" : "מה הסדנה כוללת"} <ArrowRight className="w-4 h-4 rotate-180" />
                    </span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop details modal */}
      {openWs && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start md:items-center justify-center p-4 overflow-y-auto" onClick={() => setOpenWs(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-[16/8] overflow-hidden">
              <img src={openWs.image} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setOpenWs(null)} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#461C5B]" aria-label="סגירה">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 md:p-8">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#BA9B78]">{catLabel[openWs.cat]}</span>
              <h3 className="text-2xl md:text-3xl font-light text-[#461C5B] mt-2 mb-3">{openWs.title}</h3>
              <p className="text-[#4A3D30] leading-relaxed mb-4">{openWs.desc}</p>
              {openWs.duration && <div className="text-sm text-[#A0907A] mb-4">⏱ {openWs.duration}</div>}
              {openWs.full ? (
                <div className="text-[#4A3D30] leading-relaxed whitespace-pre-wrap mb-5 border-t border-[#E0D8CC] pt-5">
                  {openWs.full}
                </div>
              ) : (
                <p className="text-sm text-[#A0907A] mb-5 italic">
                  {isEn ? "Tailored for your group — talk to us about goals, age and time." : "כל סדנה מותאמת אישית לקבוצה — דברו איתנו על הגיל, המטרה והזמן."}
                </p>
              )}
              {openWs.goals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {openWs.goals.map((g) => (
                    <span key={g} className="text-[11px] px-2 py-1 rounded-full bg-[#F7E8EA] text-[#461C5B]">{g}</span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <a
                  href={buildContactUrl({ type: "workshop", itemTitle: openWs.title, source: "workshops" })}
                  className="px-5 py-2.5 rounded-full bg-[#461C5B] text-white text-sm hover:opacity-90 transition"
                >
                  {isEn ? "Request a tailored workshop" : "להזמנת סדנה מותאמת"}
                </a>
                <button onClick={() => setOpenWs(null)} className="px-5 py-2.5 rounded-full border border-[#E0D8CC] text-[#461C5B] text-sm hover:bg-[#F5F0E8]">
                  {isEn ? "Close" : "סגירה"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* How we adapt */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#FDFBF7" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Our Process" : "התהליך"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "How we adapt every workshop" : "איך אנחנו מתאימים כל סדנה"}</h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="relative bg-white rounded-2xl border border-[#E0D8CC] p-6 h-full">
                  <div className="absolute -top-3 right-5 w-7 h-7 rounded-full bg-[#461C5B] text-white text-xs flex items-center justify-center">{i + 1}</div>
                  <p.icon className="w-6 h-6 text-[#BA9B78] mb-3" />
                  <h3 className="text-[#461C5B] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#4A3D30] font-light leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What participants gain */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#F7E8EA" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "What Participants Gain" : "מה המשתתפים מקבלים"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "Five things people take with them" : "חמישה דברים שיוצאים איתם מהסדנה"}</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {gains.map((g, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="bg-white/80 backdrop-blur rounded-2xl border border-[#E0D8CC] p-5 text-center h-full flex flex-col items-center justify-center">
                  <g.icon className="w-7 h-7 text-[#C8636E] mb-2" />
                  <p className="text-sm text-[#461C5B]">{g.title}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title={isEn ? "Want a tailored workshop?" : "רוצים להזמין סדנה מותאמת?"}
        sub={isEn ? "Tell us about your group — we'll design a session that fits." : "ספרו לנו על הקבוצה שלכם — ונבנה מפגש שמתאים."}
        primaryLabel={isEn ? "Contact us" : "צרו קשר"}
        whatsappLabel={t.final_cta.whatsapp}
        variant="purple"
        context={{ type: "workshop", source: "workshops" }}
      />

    </>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition ${active ? "bg-[#461C5B] text-white" : "bg-white border border-[#E0D8CC] text-[#4A3D30] hover:border-[#BA9B78]"}`}
    >
      {children}
    </button>
  );
}
