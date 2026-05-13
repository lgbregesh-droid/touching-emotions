import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { submitVolunteer } from "@/lib/forms.functions";

export const Route = createFileRoute("/volunteers")({
  head: () => ({ meta: [{ title: "מתנדבים | לגעת ברגש" }] }),
  component: Volunteers,
});

function Volunteers() {
  const { t } = useLanguage();
  const submit = useServerFn(submitVolunteer);
  const [form, setForm] = useState({ name: "", phone: "", profession: "", interest: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await submit({ data: form });
      setDone(true);
      setForm({ name: "", phone: "", profession: "", interest: "" });
      toast.success(t.volunteers_page.success);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-24 px-6 bg-[#F5F0E8]">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-extralight text-[#2D1B3D] text-center mb-3">{t.volunteers_page.heading}</h1>
          <div className="flex justify-center mb-6"><span className="w-[26px] h-px bg-[#BA9B78] opacity-65" /></div>
          <p className="text-center text-[#4A3D30] font-light mb-12">{t.volunteers_page.intro}</p>
        </Reveal>

        <Reveal>
          {done ? (
            <div className="bg-white rounded-2xl border border-[#E0D8CC] p-10 text-center" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
              <p className="text-[#2D1B3D] text-lg font-light">{t.volunteers_page.success}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-10 space-y-5" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
              <Field label={t.volunteers_page.field_name} required value={form.name} onChange={upd("name")} />
              <Field label={t.volunteers_page.field_phone} value={form.phone} onChange={upd("phone")} />
              <Field label={t.volunteers_page.field_role} value={form.profession} onChange={upd("profession")} />
              <Field label={t.volunteers_page.field_interest} as="textarea" value={form.interest} onChange={upd("interest")} />
              <button disabled={loading} className="w-full py-3.5 bg-[#BA9B78] hover:bg-[#a98968] disabled:opacity-60 text-white rounded-full text-sm tracking-wide transition-colors">
                {loading ? t.volunteers_page.sending : t.volunteers_page.btn}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Field({ label, as, required, value, onChange }: { label: string; as?: "textarea"; required?: boolean; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
  const cn = "w-full px-4 py-3 rounded-xl border border-[#E0D8CC] bg-white text-[#4A3D30] outline-none focus:border-[#BA9B78] transition";
  return (
    <label className="block">
      <span className="block text-sm text-[#4A3D30] mb-1.5">{label}{required && <span className="text-[#BA9B78]"> *</span>}</span>
      {as === "textarea" ? (
        <textarea rows={4} required={required} value={value} onChange={onChange} className={cn} />
      ) : (
        <input type="text" required={required} value={value} onChange={onChange} className={cn} />
      )}
    </label>
  );
}
