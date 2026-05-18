import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { submitContact } from "@/lib/forms.functions";
import { PrivacyConsent, MarketingConsent } from "@/components/PrivacyConsent";
import { EmergencyBox } from "@/routes/disclaimer";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "צור קשר | לגעת ברגש" }] }),
  component: Contact,
});

function Contact() {
  const { t } = useLanguage();
  const submit = useServerFn(submitContact);
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [agreed, setAgreed] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    if (!agreed) { toast.error("יש לאשר את מדיניות הפרטיות"); return; }
    setLoading(true);
    try {
      await submit({ data: form });
      setDone(true);
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
      toast.success(t.contact_page.success);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-24 px-6 bg-[#F5F0E8]">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-extralight text-[#2D1B3D] text-center mb-3">{t.contact_page.heading}</h1>
          <div className="flex justify-center mb-12"><span className="w-[26px] h-px bg-[#BA9B78] opacity-65" /></div>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Reveal>
              {done ? (
                <div className="bg-white rounded-2xl border border-[#E0D8CC] p-10 text-center" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
                  <p className="text-[#2D1B3D] text-lg font-light">{t.contact_page.success}</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-10 space-y-5" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label={t.contact_page.field_name} required value={form.name} onChange={upd("name")} />
                    <Field label={t.contact_page.field_phone} value={form.phone} onChange={upd("phone")} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label={t.contact_page.field_email} type="email" value={form.email} onChange={upd("email")} />
                    <Field label={t.contact_page.field_subject} value={form.subject} onChange={upd("subject")} />
                  </div>
                  <Field label={t.contact_page.field_message} required as="textarea" value={form.message} onChange={upd("message")} />
                  <div className="space-y-2 pt-1">
                    <PrivacyConsent checked={agreed} onChange={setAgreed} />
                    <MarketingConsent checked={marketing} onChange={setMarketing} />
                  </div>
                  <button disabled={loading} className="w-full py-3.5 bg-[#BA9B78] hover:bg-[#a98968] disabled:opacity-60 text-white rounded-full text-sm tracking-wide transition-colors">
                    {loading ? t.contact_page.sending : t.contact_page.btn}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="bg-[#F0F5F3] rounded-2xl border border-[#E0D8CC] p-7 space-y-5 h-fit">
              <h3 className="text-lg text-[#2D1B3D] font-normal">{t.contact_page.info_heading}</h3>
              <div>
                <p className="text-xs text-[#A0907A] tracking-wider uppercase mb-1">{t.contact_page.email}</p>
                <a href="mailto:l.g.bregesh@gmail.com" className="text-[#2D1B3D] hover:text-[#BA9B78] transition-colors text-sm break-all">l.g.bregesh@gmail.com</a>
              </div>
              <div>
                <p className="text-xs text-[#A0907A] tracking-wider uppercase mb-1">{t.contact_page.facebook}</p>
                <a href="https://www.facebook.com/share/17ZD8v1ADv/" target="_blank" rel="noreferrer noopener" className="text-[#2D1B3D] hover:text-[#BA9B78] transition-colors text-sm">facebook.com/לגעת ברגש</a>
              </div>
            </div>
          </Reveal>
        </div>
        <div className="mt-10">
          <EmergencyBox />
        </div>
      </div>
    </section>
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
