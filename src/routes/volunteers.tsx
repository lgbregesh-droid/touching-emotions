import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { validators, scrollToFirstError, type ValidationKey } from "@/utils/validation";
import { ValidatedInput, ValidatedTextarea } from "@/components/forms/ValidatedField";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { CompactPageHeader } from "@/components/CompactPageHeader";
import { InfoCard } from "@/components/InfoCard";
import { CTABand } from "@/components/CTABand";
import { submitVolunteer } from "@/lib/forms.functions";
import { PrivacyConsent, MarketingConsent } from "@/components/PrivacyConsent";
import { Megaphone, HeartHandshake, Camera, Truck, Share2, Compass, Users, Sparkles } from "lucide-react";
import { useSiteContent } from "@/hooks/use-cms";


export const Route = createFileRoute("/volunteers")({
  head: () => ({
    meta: [
      { title: "מתנדבים | לגעת ברגש" },
      { name: "description", content: "הצטרפו לצוות המתנדבים של לגעת ברגש — הנחיה, ליווי, צילום, לוגיסטיקה וקהילה." },
    ],
  }),
  component: Volunteers,
});

function Volunteers() {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";
  const { data: cms } = useSiteContent();
  const pick = (key: string, fb: string) => { const v = cms?.[key]; return v ? ((isEn ? v.en : v.he) || fb) : fb; };
  const submit = useServerFn(submitVolunteer);
  const [form, setForm] = useState({ name: "", phone: "", profession: "", professionOther: "", interest: "" });

  const [agreed, setAgreed] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [k]: e.target.value });
    setErrors((er) => ({ ...er, [k]: null }));
  };
  const blurName = () => setErrors((er) => ({ ...er, name: validators.name(form.name) }));
  const blurPhone = () => setErrors((er) => ({ ...er, phone: validators.phone(form.phone, true) }));

  const otherKey = isEn ? "Other" : "אחר";
  const professionOptions: string[] = isEn
    ? ["Education & Teaching","Psychology & Therapy","Social Work","Management & Organization","Marketing & Communications","Technology & Computers","Art & Creativity","Health & Medicine","Law & Accounting","Student","Other"]
    : ["חינוך והוראה","פסיכולוגיה וטיפול","עבודה סוציאלית","ניהול וארגון","שיווק ותקשורת","טכנולוגיה ומחשבים","אמנות ויצירה","בריאות ורפואה","משפט וחשבונאות","סטודנט/ית","אחר"];

  type Errs = Partial<Record<"name" | "phone" | "profession" | "professionOther" | "agreed", ValidationKey | null>>;
  const [errors, setErrors] = useState<Errs>({});
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (): Errs => {
    const sel = validators.select(form.profession);
    return {
      name: validators.name(form.name),
      phone: validators.phone(form.phone, true),
      profession: sel,
      professionOther: form.profession === otherKey ? (form.professionOther.trim().length < 2 ? "other_field_required" : null) : null,
      agreed: agreed ? null : "checkbox_required",
    };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      if (!agreed && errs.agreed) toast.error(t.validation.checkbox_required.replace("✗ ", ""));
      setTimeout(() => scrollToFirstError(formRef.current), 50);
      return;
    }
    const professionValue = form.profession === otherKey ? form.professionOther.trim() : form.profession;
    setLoading(true);
    try {
      await submit({ data: { name: form.name, phone: form.phone, profession: professionValue, interest: form.interest } });
      setDone(true);
      setForm({ name: "", phone: "", profession: "", professionOther: "", interest: "" });
      setErrors({});
      toast.success(t.volunteers_page.success);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { icon: Megaphone, title: isEn ? "Facilitation" : "הדרכה", desc: isEn ? "Co-facilitating workshops with our team." : "סיוע בהנחיית סדנאות לצד הצוות שלנו." },
    { icon: HeartHandshake, title: isEn ? "Activity support" : "ליווי פעילות", desc: isEn ? "Helping during meetings, hosting, coordination." : "ליווי במפגשים, אירוח ותיאום." },
    { icon: Camera, title: isEn ? "Photo & content" : "צילום ותוכן", desc: isEn ? "Photography, video, social media content." : "צילום, וידאו ותוכן לרשתות." },
    { icon: Truck, title: isEn ? "Logistics" : "סיוע לוגיסטי", desc: isEn ? "Equipment, transport, materials, setup." : "ציוד, הסעות, חומרים והקמה." },
    { icon: Share2, title: isEn ? "Community & outreach" : "קהילה והפצה", desc: isEn ? "Connecting with schools, communities and partners." : "חיבור לבתי ספר, קהילות ושותפים." },
  ];

  const gains = [
    { icon: Sparkles, title: isEn ? "Meaning" : "משמעות", desc: isEn ? "Be part of something that touches real lives." : "להיות חלק ממשהו שנוגע בחיים אמיתיים." },
    { icon: Users, title: isEn ? "Community" : "קהילה", desc: isEn ? "Join a warm team of facilitators and partners." : "להצטרף לקהילה חמה של מנחים ושותפים." },
    { icon: HeartHandshake, title: isEn ? "Social impact" : "עשייה חברתית", desc: isEn ? "Real contribution to children, teens and families." : "תרומה אמיתית לילדים, נוער ומשפחות." },
    { icon: Compass, title: isEn ? "Connection" : "חיבור", desc: isEn ? "Meet people, places and stories that move you." : "להכיר אנשים, מקומות וסיפורים שמרגשים." },
  ];

  return (
    <>
      <CompactPageHeader
        label={isEn ? "Join Us" : "הצטרפו אלינו"}
        title={isEn ? "Volunteer" : "התנדבות"}
        subtitle={isEn ? "Any help supports our growth" : "כל סיוע יתמוך בהגדלת הפעילות ובצמיחה"}
      />

      {/* Jump to volunteer form */}
      <div className="px-6 pt-4 pb-2 text-center" style={{ background: "#FDFBF7" }}>
        <a
          href="#volunteer-form"
          className="inline-flex items-center gap-2 bg-[#BA9B78] hover:bg-[#a8875f] text-white transition-colors"
          style={{ borderRadius: 30, padding: "12px 28px", fontSize: 14 }}
        >
          {isEn ? "Volunteer Now ↓" : "להשארת פרטים — לחצו כאן ↓"}
        </a>
      </div>

      {/* Who can volunteer */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#EAE3DA" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Volunteer Roles" : "תפקידי התנדבות"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "How you can help" : "איך אפשר לעזור"}</h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((r, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <InfoCard icon={r.icon} title={r.title} desc={r.desc} accent={(["teal", "blush", "gold", "purple", "teal"] as const)[i]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What you gain */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#FDFBF7" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "What You Gain" : "מה מקבלים"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "What volunteers take with them" : "מה המתנדבים מקבלים בחזרה"}</h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gains.map((g, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <InfoCard icon={g.icon} title={g.title} desc={g.desc} accent="blush" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="volunteer-form" className="px-6 py-16 md:py-20 scroll-mt-24" style={{ background: "#F7E8EA" }}>
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="text-center mb-8">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Volunteer Form" : "טופס התנדבות"}</span>
              <h2 className="text-2xl md:text-3xl font-light text-[#461C5B] mt-3">{isEn ? "Leave your details" : "השאירו פרטים"}</h2>
              <p className="text-sm text-[#4A3D30] font-light mt-2">{isEn ? "We'll get back to you with a fitting role." : "נחזור אליכם עם תפקיד שמתאים."}</p>
            </div>
          </Reveal>
          <Reveal>
            {done ? (
              <div className="bg-white rounded-2xl border border-[#E0D8CC] p-10 text-center" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
                <p className="text-[#461C5B] text-lg font-light">{t.volunteers_page.success}</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate className="bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-10 space-y-5" style={{ borderRight: "3px solid rgba(229,163,173,0.5)" }}>
                <ValidatedInput label={t.volunteers_page.field_name} required value={form.name} onChange={upd("name")} onBlur={blurName} error={errors.name} />
                <ValidatedInput label={t.volunteers_page.field_phone} required value={form.phone} onChange={upd("phone")} onBlur={blurPhone} error={errors.phone} type="tel" />
                <label className="block">
                  <span className="block text-sm text-[#4A3D30] mb-1.5">{t.volunteers_page.field_role}<span className="text-[#BA9B78]"> *</span></span>
                  <select
                    value={form.profession}
                    onChange={upd("profession")}
                    aria-invalid={errors.profession ? "true" : "false"}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.profession ? "border-[#C4622D]" : "border-[#E0D8CC] focus:border-[#BA9B78]"} bg-white text-[#4A3D30] outline-none transition`}
                    dir={isEn ? "ltr" : "rtl"}
                    style={{ textAlign: isEn ? "left" : "right" }}
                  >
                    <option value="" disabled>{isEn ? "Select field" : "בחר תחום"}</option>
                    {professionOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.profession && <div role="alert" className="mt-1 text-[12px]" style={{ color: "#C4622D" }}>{t.validation.select_required}</div>}
                </label>
                {form.profession === otherKey && (
                  <ValidatedInput
                    label={isEn ? "Please describe" : "פירוט"}
                    required
                    value={form.professionOther}
                    onChange={upd("professionOther")}
                    error={errors.professionOther}
                    placeholder={isEn ? "Please describe your field" : "נא לפרט את תחום העיסוק"}
                    rounded="lg"
                  />
                )}

                <ValidatedTextarea label={t.volunteers_page.field_interest} value={form.interest} onChange={upd("interest")} rows={4} showCounter={false} />
                <div className="space-y-2 pt-1">
                  <PrivacyConsent checked={agreed} onChange={(v) => { setAgreed(v); if (v) setErrors((er) => ({ ...er, agreed: null })); }} />
                  {errors.agreed && <div role="alert" className="text-[12px]" style={{ color: "#C4622D" }}>{t.validation.checkbox_required}</div>}
                  <MarketingConsent checked={marketing} onChange={setMarketing} />
                </div>
                <button disabled={loading} className="w-full py-3.5 bg-[#461C5B] hover:bg-[#5a2674] disabled:opacity-60 text-white rounded-full text-sm tracking-wide transition-colors">
                  {loading ? t.validation.submitting : t.volunteers_page.btn}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <CTABand
        title={pick("volunteers.cta.title", isEn ? "Prefer a quick message?" : "מעדיפים הודעה מהירה?")}
        sub={pick("volunteers.cta.sub", isEn ? "Reach us on WhatsApp and we'll get back fast." : "אפשר לפנות אלינו בוואטסאפ וניצור קשר מהר.")}
        primaryLabel={isEn ? "Contact us" : "צרו קשר"}
        whatsappLabel={t.final_cta.whatsapp}
        variant="purple"
        context={{ type: "volunteer", source: "volunteers" }}
      />

    </>
  );
}
