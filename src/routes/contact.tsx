import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { FAQ } from "@/components/FAQ";
import { submitContact } from "@/lib/forms.functions";
import { PrivacyConsent, MarketingConsent } from "@/components/PrivacyConsent";
import { EmergencyBox } from "@/routes/disclaimer";
import { useSiteSettings, buildWhatsAppLink } from "@/lib/site-settings";
import { useFaq } from "@/hooks/use-cms";
import {
  buildContactMessage,
  contextNoticeText,
  INQUIRY_TYPE_HE,
  isCtaType,
  type CtaContext,
} from "@/lib/contact-link";
import { Mail, MessageCircle, Facebook, FileText, Inbox, Search, PhoneCall, CheckCircle2, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>) => ({
    type: typeof search.type === "string" ? search.type : undefined,
    itemId: typeof search.itemId === "string" ? search.itemId : undefined,
    itemTitle: typeof search.itemTitle === "string" ? search.itemTitle : undefined,
    source: typeof search.source === "string" ? search.source : undefined,
  }),
  head: () => ({
    meta: [
      { title: "צור קשר | לגעת ברגש" },
      { name: "description", content: "נשמח לשמוע מכם — הזמנת סדנה, הרצאה, התנדבות, תרומה או שאלה כללית." },
    ],
  }),
  component: Contact,
});

const SUBJECTS_HE = ["הזמנת סדנה", "הרצאה / מפגש", "התנדבות", "תרומה", "תמיכה בעשייה", "הרשמה לאירוע", "שאלה כללית"];
const SUBJECTS_EN = ["Workshop booking", "Lecture / meetup", "Volunteer", "Donation", "Support our work", "Event registration", "General question"];

function Contact() {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";
  const submit = useServerFn(submitContact);
  const { data: s } = useSiteSettings();
  const search = Route.useSearch();
  const ctx: CtaContext | null = isCtaType(search.type)
    ? { type: search.type, itemId: search.itemId, itemTitle: search.itemTitle, source: search.source }
    : null;

  const initialSubject = ctx ? INQUIRY_TYPE_HE[ctx.type] : "";
  const initialMessage = ctx ? buildContactMessage(ctx) : "";

  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: initialSubject, message: initialMessage });
  const [agreed, setAgreed] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Re-apply prefill if URL params change (e.g. user clicks another CTA without remounting)
  useEffect(() => {
    if (!ctx) return;
    setForm((f) => ({
      ...f,
      subject: INQUIRY_TYPE_HE[ctx.type],
      message: buildContactMessage(ctx),
    }));
    // scroll to form
    if (typeof window !== "undefined") {
      const el = document.getElementById("contact-form");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.type, search.itemId, search.itemTitle]);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    if (!agreed) { toast.error("יש לאשר את מדיניות הפרטיות"); return; }
    setLoading(true);
    try {
      await submit({
        data: {
          ...form,
          inquiry_type: form.subject || (ctx ? INQUIRY_TYPE_HE[ctx.type] : "שאלה כללית"),
          source_page: ctx?.source || "contact",
          related_item_type: ctx?.type && ctx.type !== "general" ? ctx.type : "",
          related_item_id: ctx?.itemId || "",
          related_item_title: ctx?.itemTitle || "",
        },
      });
      setDone(true);
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
      toast.success(t.contact_page.success);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };


  const subjects = isEn ? SUBJECTS_EN : SUBJECTS_HE;

  const waUrl = buildWhatsAppLink(s?.whatsapp_number);
  const channels = [
    waUrl && { icon: MessageCircle, title: isEn ? "WhatsApp" : "וואטסאפ", desc: isEn ? "Fastest reply during the day." : "הכי מהיר במהלך היום.", href: waUrl, accent: "#25D366" },
    s?.email && { icon: Mail, title: isEn ? "Email" : "אימייל", desc: s.email, href: `mailto:${s.email}`, accent: "#BA9B78" },
    s?.facebook_url && { icon: Facebook, title: isEn ? "Facebook" : "פייסבוק", desc: isEn ? "Follow our updates" : "עקבו אחרי העדכונים", href: s.facebook_url, accent: "#1877F2" },
    s?.address && { icon: MapPin, title: isEn ? "Location" : "כתובת", desc: s.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`, accent: "#2D7D4F" },
    { icon: FileText, title: isEn ? "Form" : "טופס פנייה", desc: isEn ? "Below — we reply within 48h." : "כאן למטה — נחזור תוך 48 שעות.", href: "#contact-form", accent: "#461C5B" },
  ].filter(Boolean) as { icon: typeof Mail; title: string; desc: string; href: string; accent: string }[];

  const next = [
    { icon: Inbox, title: isEn ? "We receive" : "מקבלים את הפנייה" },
    { icon: Search, title: isEn ? "We understand the need" : "מבינים את הצורך" },
    { icon: PhoneCall, title: isEn ? "We get back to you" : "חוזרים אליכם" },
    { icon: CheckCircle2, title: isEn ? "We tailor an activity" : "מתאימים פעילות" },
  ];

  const { data: dbFaq } = useFaq();
  const fallbackFaq = isEn
    ? [
        { q: "How do I book a workshop?", a: "Send us a message via the form, WhatsApp or email. We'll have a short intro call, understand the need, and build a tailored session for your group." },
        { q: "Are activities suitable for schools?", a: "Yes — we work with schools, community centers, dorms and youth movements. Most programs are designed in coordination with the school's staff." },
        { q: "How do I get a price quote?", a: "After a short intro call we send a tailored quote based on group size, location, duration and goal." },
      ]
    : [
        { q: "איך מזמינים סדנה?", a: "שולחים לנו הודעה דרך הטופס, וואטסאפ או מייל. נערוך שיחת היכרות קצרה, נבין את הצורך ונבנה מפגש מותאם לקבוצה שלכם." },
        { q: "האם הפעילות מתאימה לבתי ספר?", a: "בהחלט — אנחנו עובדים עם בתי ספר, מתנ\"סים, פנימיות ותנועות נוער. רוב התוכניות נבנות בתיאום עם הצוות החינוכי." },
        { q: "איך מקבלים הצעת מחיר?", a: "אחרי שיחת היכרות קצרה אנחנו שולחים הצעת מחיר מותאמת לפי גודל הקבוצה, מיקום, משך ומטרה." },
      ];
  type FaqRow = { question?: string; answer?: string };
  const faqs = (dbFaq && dbFaq.length > 0)
    ? (dbFaq as FaqRow[]).map((r) => ({ q: r.question || "", a: r.answer || "" }))
    : fallbackFaq;

  return (
    <>
      {/* Form — primary */}
      <section id="contact-form" className="px-6 pt-8 pb-14 md:pt-12 md:pb-20" style={{ background: "#FDFBF7" }}>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-6">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Contact" : "צרו קשר"}</span>
              <h1 className="text-3xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "Send a message" : "שלחו הודעה"}</h1>
            </div>
          </Reveal>
          {ctx && !done && (
            <Reveal>
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#E5A3AD]/40 bg-[#FBF4EE] p-4 text-[#461C5B]" style={{ borderRight: "3px solid rgba(229,163,173,0.6)" }}>
                <Sparkles className="w-5 h-5 mt-0.5 shrink-0 text-[#BA9B78]" />
                <div className="text-sm leading-relaxed">
                  <div className="font-medium">{contextNoticeText(ctx)}</div>
                  <div className="text-[#A0907A] text-xs mt-1">הטופס מולא מראש לפי הבקשה שלך. אפשר לערוך את ההודעה לפני השליחה.</div>
                </div>
              </div>
            </Reveal>
          )}
          <Reveal>

            {done ? (
              <div className="bg-white rounded-2xl border border-[#E0D8CC] p-10 text-center" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
                <p className="text-[#461C5B] text-lg font-light">{t.contact_page.success}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-10 space-y-5 shadow-sm" style={{ borderRight: "3px solid rgba(229,163,173,0.5)" }}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label={t.contact_page.field_name} required value={form.name} onChange={upd("name")} />
                  <Field label={t.contact_page.field_phone} value={form.phone} onChange={upd("phone")} />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label={t.contact_page.field_email} type="email" value={form.email} onChange={upd("email")} />
                  <label className="block">
                    <span className="block text-sm text-[#4A3D30] mb-1.5">{isEn ? "Inquiry type" : "סוג פנייה"}</span>
                    <select value={form.subject} onChange={upd("subject")} className="w-full px-4 py-3 rounded-xl border border-[#E0D8CC] bg-white text-[#4A3D30] outline-none focus:border-[#BA9B78] transition">
                      <option value="">{isEn ? "Choose..." : "בחרו..."}</option>
                      {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
                <Field label={t.contact_page.field_message} required as="textarea" value={form.message} onChange={upd("message")} />
                <div className="space-y-2 pt-1">
                  <PrivacyConsent checked={agreed} onChange={setAgreed} />
                  <MarketingConsent checked={marketing} onChange={setMarketing} />
                </div>
                <button disabled={loading} className="w-full py-3.5 bg-[#461C5B] hover:bg-[#5a2674] disabled:opacity-60 text-white rounded-full text-sm tracking-wide transition-colors">
                  {loading ? t.contact_page.sending : t.contact_page.btn}
                </button>
              </form>
            )}
          </Reveal>

          {/* Secondary: alternative channels */}
          <Reveal delay={0.05}>
            <div className="mt-10">
              <div className="text-center mb-4">
                <span className="text-[11px] tracking-[0.22em] uppercase text-[#A0907A]">{isEn ? "Other ways to reach us" : "דרכים נוספות ליצירת קשר"}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {channels.filter((c) => c.href !== "#contact-form").map((c, i) => (
                  <a
                    key={i}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#E0D8CC] text-xs text-[#461C5B] hover:border-[#BA9B78] transition-colors"
                  >
                    <c.icon className="w-3.5 h-3.5" style={{ color: c.accent }} />
                    <span>{c.title}</span>
                    <span className="text-[#A0907A] hidden sm:inline">·</span>
                    <span className="text-[#A0907A] hidden sm:inline break-all">{c.desc}</span>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="mt-10">
            <EmergencyBox />
          </div>
        </div>
      </section>

      {/* What happens next */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#EAE3DA" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "What Happens Next" : "מה קורה אחר כך"}</span>
              <h2 className="text-2xl md:text-3xl font-light text-[#461C5B] mt-3">{isEn ? "After you send your message" : "אחרי ששולחים את הפנייה"}</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {next.map((n, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="bg-white rounded-2xl border border-[#E0D8CC] p-5 text-center h-full">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#F7E8EA] flex items-center justify-center mb-3">
                    <n.icon className="w-5 h-5 text-[#461C5B]" />
                  </div>
                  <div className="text-xs text-[#BA9B78] mb-1">{String(i + 1).padStart(2, "0")}</div>
                  <p className="text-sm text-[#461C5B]">{n.title}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#FDFBF7" }}>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-8">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "FAQ" : "שאלות נפוצות"}</span>
              <h2 className="text-2xl md:text-3xl font-light text-[#461C5B] mt-3">{isEn ? "Common questions" : "שאלות שחוזרות"}</h2>
            </div>
          </Reveal>
          <FAQ items={faqs} />
        </div>
      </section>
    </>
  );
}

function Field({ label, as, type = "text", required, value, onChange }: { label: string; as?: "textarea"; type?: string; required?: boolean; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
  const cn = "w-full px-4 py-3 rounded-xl border border-[#E0D8CC] bg-white text-[#4A3D30] outline-none focus:border-[#BA9B78] transition";
  return (
    <label className="block">
      <span className="block text-sm text-[#4A3D30] mb-1.5">{label}{required && <span className="text-[#BA9B78]"> *</span>}</span>
      {as === "textarea" ? (
        <textarea rows={5} required={required} value={value} onChange={onChange} className={cn} />
      ) : (
        <input type={type} required={required} value={value} onChange={onChange} className={cn} />
      )}
    </label>
  );
}
