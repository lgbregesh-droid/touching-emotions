import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useFaq } from "@/hooks/use-cms";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  question_en?: string | null;
  answer_en?: string | null;
};

export function HomeFAQ() {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const { data } = useFaq();
  const [open, setOpen] = useState<string | null>(null);

  const items = ((data || []) as FaqRow[]).slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section className="relative px-6 py-14 md:py-20" style={{ background: "#F5F0E8" }}>
      <div
        aria-hidden
        className="absolute inset-x-0 top-0"
        style={{
          height: 1.5,
          background:
            "linear-gradient(90deg, transparent, rgba(78,140,133,0.35), rgba(186,155,120,0.25), transparent)",
        }}
      />
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <p
            className="text-center mb-2"
            style={{
              color: "#A0907A",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {isEn ? "FAQ" : "שאלות נפוצות"}
          </p>
          <h2
            className="text-center mb-8"
            style={{
              color: "#2D1B3D",
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 300,
            }}
          >
            {isEn ? "Have Questions?" : "יש לכם שאלות?"}
          </h2>
        </Reveal>

        <div className="space-y-3">
          {items.map((it, i) => {
            const isOpen = open === it.id;
            const q = (isEn && it.question_en) || it.question;
            const a = (isEn && it.answer_en) || it.answer;
            return (
              <Reveal key={it.id} delay={i * 0.05}>
                <div
                  className="bg-white overflow-hidden transition-colors"
                  style={{
                    border: `0.5px solid ${isOpen ? "#BA9B78" : "#E0D8CC"}`,
                    borderRadius: 10,
                  }}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : it.id)}
                    className="w-full flex items-center justify-between gap-4 text-right"
                    style={{
                      padding: "14px 18px",
                      fontSize: 14,
                      fontWeight: 500,
                      color: isOpen ? "#BA9B78" : "#2D1B3D",
                      background: "transparent",
                    }}
                    aria-expanded={isOpen}
                  >
                    <span>{q}</span>
                    <span style={{ color: "#BA9B78", fontSize: 18, lineHeight: 1 }}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    style={{
                      maxHeight: isOpen ? 600 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.3s ease",
                      background: "#F5F0E8",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 18px",
                        fontSize: 13,
                        color: "#4A3D30",
                        lineHeight: 1.8,
                      }}
                    >
                      {a}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/contact"
            style={{ color: "#BA9B78", fontSize: 13 }}
            className="hover:underline"
          >
            {isEn ? "See all questions ←" : "לכל השאלות ←"}
          </Link>
        </div>
      </div>
    </section>
  );
}
