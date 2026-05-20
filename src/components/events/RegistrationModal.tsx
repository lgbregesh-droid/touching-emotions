import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useLanguage } from "@/i18n/LanguageContext";
import { registerForEvent } from "@/lib/events.functions";
import { useQueryClient } from "@tanstack/react-query";
import type { EventRow } from "./EventCard";
import { formatDateParts, toCalendarEvent } from "./EventCard";
import { PrivacyConsent } from "@/components/PrivacyConsent";
import { CalendarActions } from "./CalendarActions";
import { trackCalendar } from "@/lib/calendar";

export function RegistrationModal({ event, onClose }: { event: EventRow; onClose: () => void }) {
  const { lang, t } = useLanguage();
  const qc = useQueryClient();
  const fn = useServerFn(registerForEvent);
  const title = lang === "en" ? event.title_en || event.title_he : event.title_he;
  const { day, month, year } = formatDateParts(event.date, lang);
  const time = event.time?.slice(0, 5);

  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setErrMsg("יש לאשר את מדיניות הפרטיות"); setStatus("error"); return; }
    setStatus("sending");
    setErrMsg("");
    try {
      await fn({ data: { event_id: event.id, ...form } });
      trackCalendar("event_registration_submitted", { id: event.id, title });
      setStatus("success");
      qc.invalidateQueries({ queryKey: ["events"] });
    } catch (err) {
      const m = (err as Error).message;
      if (m === "DUPLICATE") setErrMsg(t.registration_modal.duplicate);
      else if (m === "FULL") setErrMsg(t.registration_modal.full);
      else setErrMsg(t.registration_modal.error);
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/55 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-[480px] w-full p-6 my-8 relative" onClick={(e) => e.stopPropagation()} dir={lang === "he" ? "rtl" : "ltr"}>
        <button onClick={onClose} className="absolute top-4 left-4 text-[#A0907A] hover:text-[#2D1B3D]" aria-label="close">
          <X size={20} />
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-14 h-14 text-[#4E8C85] mx-auto mb-3" />
            <h3 className="text-xl text-[#2D1B3D] font-light mb-2">{t.registration_modal.success}</h3>
            <p className="text-sm text-[#A0907A] mb-4">
              {lang === "he" ? "ההרשמה התקבלה בהצלחה. אפשר להוסיף את האירוע ליומן." : t.registration_modal.success_sub}
            </p>
            <div className="bg-[#F5F0E8] rounded-lg p-4 text-sm text-[#2D1B3D] mb-5 text-start">
              <div className="font-medium">{title}</div>
              <div className="text-xs text-[#A0907A] mt-1">{day} {month} {year}{time ? ` · ${time}` : ""}</div>
            </div>
            <div className="flex justify-center mb-5">
              <CalendarActions event={toCalendarEvent(event, lang)} size="md" />
            </div>
            <button onClick={onClose} className="px-6 py-2 rounded-full bg-[#461C5B] text-white text-sm hover:bg-[#5a2476] transition">{t.registration_modal.close}</button>
          </div>
        ) : (
          <>
            <h3 className="text-xl text-[#2D1B3D] font-light mb-1">{t.registration_modal.title}</h3>
            <div className="text-sm text-[#A0907A] mb-5">
              <div className="text-[#2D1B3D]">{title}</div>
              <div className="text-xs">{day} {month} {year}{time ? ` · ${time}` : ""}</div>
            </div>
            <form onSubmit={submit} className="space-y-3 text-sm">
              <Input label={t.registration_modal.field_name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Input label={t.registration_modal.field_phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
              <Input label={t.registration_modal.field_email} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <label className="block">
                <span className="text-xs text-[#A0907A] block mb-1">{t.registration_modal.field_notes}</span>
                <textarea rows={2} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white"
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </label>
              <PrivacyConsent checked={agreed} onChange={setAgreed} />
              {errMsg && <div className="text-sm text-red-600">{errMsg}</div>}
              <button type="submit" disabled={status === "sending"}
                className="w-full py-3 rounded-full bg-[#BA9B78] text-white text-sm hover:bg-[#a78865] disabled:opacity-50 transition">
                {status === "sending" ? t.registration_modal.sending : t.registration_modal.submit}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs text-[#A0907A] block mb-1">{label}{required && " *"}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white" />
    </label>
  );
}
