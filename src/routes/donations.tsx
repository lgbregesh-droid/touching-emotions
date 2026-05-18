import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { Heart, Sparkles, Users, BookOpen, ArrowRight, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/donations")({
  head: () => ({ meta: [{ title: "תרומות | לגעת ברגש" }] }),
  component: Donations,
});

const ICONS = [Heart, Users, Sparkles, BookOpen];

function Donations() {
  const { t } = useLanguage();
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
    <section className="py-16 md:py-24 px-6 bg-[#F5F0E8]">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-extralight text-[#2D1B3D] text-center mb-3">{d.heading}</h1>
          <div className="flex justify-center mb-6">
            <span className="w-[26px] h-px bg-[#BA9B78] opacity-65" />
          </div>
          <p className="text-center text-[#4A3D30] font-light mb-14 max-w-2xl mx-auto leading-relaxed">{d.intro}</p>
        </Reveal>

        {/* Why donate */}
        <Reveal>
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-[#2D1B3D] text-center mb-2">{d.why_heading}</h2>
            <p className="text-center text-sm text-[#4A3D30] font-light mb-8 max-w-2xl mx-auto">{d.why_intro}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {d.impact.map((item, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <div key={i} className="bg-white rounded-2xl border border-[#E0D8CC] p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#BA9B78]/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#BA9B78]" />
                    </div>
                    <div>
                      <h3 className="text-[#2D1B3D] font-normal mb-1">{item.title}</h3>
                      <p className="text-sm text-[#4A3D30] font-light leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Action card */}
        <Reveal>
          <div className="bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-10" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
            {step === "choose" && (
              <>
                <div className="flex rounded-full border border-[#E0D8CC] p-1 mb-8 bg-[#F5F0E8]">
                  {[false, true].map((r) => (
                    <button
                      key={String(r)}
                      onClick={() => setRecurring(r)}
                      className={`flex-1 py-2.5 rounded-full text-sm transition-colors ${recurring === r ? "bg-[#BA9B78] text-white" : "text-[#4A3D30]"}`}
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
                      className={`py-4 rounded-xl border text-lg font-light transition ${amount === a ? "border-[#BA9B78] bg-[#BA9B78]/10 text-[#2D1B3D]" : "border-[#E0D8CC] text-[#4A3D30] hover:border-[#BA9B78]/60"}`}
                    >
                      ₪{a}
                    </button>
                  ))}
                  <button
                    onClick={() => setAmount("custom")}
                    className={`py-4 rounded-xl border text-sm transition ${amount === "custom" ? "border-[#BA9B78] bg-[#BA9B78]/10 text-[#2D1B3D]" : "border-[#E0D8CC] text-[#4A3D30] hover:border-[#BA9B78]/60"}`}
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
                  className="w-full py-3.5 bg-[#BA9B78] hover:bg-[#a88864] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-sm tracking-wide flex items-center justify-center gap-2 transition-colors"
                >
                  {d.btn}
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </>
            )}

            {step === "pay" && (
              <div>
                <button onClick={() => setStep("choose")} className="text-xs text-[#A0907A] hover:text-[#2D1B3D] mb-4 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  {d.back}
                </button>

                <div className="mb-6 pb-6 border-b border-[#E0D8CC]">
                  <p className="text-xs text-[#A0907A] mb-1">{recurring ? d.summary_monthly : d.summary_once}</p>
                  <p className="text-3xl font-light text-[#2D1B3D]">₪{finalAmount.toLocaleString()}</p>
                </div>

                <h3 className="text-lg text-[#2D1B3D] font-normal mb-2">{d.payment_heading}</h3>
                <p className="text-sm text-[#4A3D30] font-light leading-relaxed mb-5 bg-[#F5F0E8] border border-[#E0D8CC] rounded-lg p-4">
                  {d.payment_note}
                </p>

                <h4 className="text-sm text-[#2D1B3D] font-medium mb-3">{d.bank_heading}</h4>
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
      <span className="flex items-center gap-2 text-[#2D1B3D] font-medium">
        {value}
        {copyable && (
          <button onClick={onCopy} className="p-1 text-[#BA9B78] hover:text-[#2D1B3D] transition-colors" aria-label="העתק">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </span>
    </div>
  );
}
