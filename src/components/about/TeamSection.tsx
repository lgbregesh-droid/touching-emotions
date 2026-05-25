import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/i18n/LanguageContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type Member = {
  id: string;
  name_he: string; name_en: string;
  role_he: string; role_en: string;
  bio_he: string | null; bio_en: string | null;
  photo_url: string | null;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase() || "•";
}

function MemberCard({ m, isEn, delay }: { m: Member; isEn: boolean; delay: number }) {
  const [expanded, setExpanded] = useState(false);
  const name = (isEn ? m.name_en : m.name_he) || m.name_he;
  const role = (isEn ? m.role_en : m.role_he) || m.role_he;
  const bio = (isEn ? m.bio_en : m.bio_he) || "";
  const isLong = bio.length > 180;
  const visibleBio = expanded || !isLong ? bio : bio.slice(0, 180).trimEnd() + "…";

  return (
    <Reveal delay={delay}>
      <article
        className="group bg-white rounded-2xl p-6 md:p-7 text-center transition-transform duration-300 hover:-translate-y-1"
        style={{ border: "1px solid #E0D8CC", boxShadow: "0 1px 2px rgba(45,27,61,0.04)" }}
      >
        <div className="flex justify-center mb-4">
          {m.photo_url ? (
            <img
              src={m.photo_url}
              alt={name}
              className="w-[100px] h-[100px] rounded-full object-cover"
              style={{ border: "2px solid rgba(186,155,120,0.3)" }}
              loading="lazy"
            />
          ) : (
            <div
              className="w-[100px] h-[100px] rounded-full flex items-center justify-center text-2xl font-light"
              style={{ background: "#EDE6DC", color: "#2D1B3D", border: "2px solid rgba(186,155,120,0.3)" }}
              aria-label={name}
            >
              {initials(name)}
            </div>
          )}
        </div>
        <h3 className="text-[15px] font-medium text-[#2D1B3D]">{name}</h3>
        <p className="text-[12px] text-[#BA9B78] mt-1" style={{ letterSpacing: "0.04em" }}>{role}</p>
        <div className="mx-auto my-4 h-px w-5" style={{ background: "#BA9B78", opacity: 0.4 }} />
        {bio && (
          <>
            <p className="text-[13px] text-[#4A3D30] leading-[1.8] whitespace-pre-line">{visibleBio}</p>
            {isLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 text-[12px] text-[#BA9B78] hover:underline"
              >
                {expanded ? (isEn ? "Show less" : "הצג פחות") : (isEn ? "Read more" : "קרא עוד")}
              </button>
            )}
          </>
        )}
      </article>
    </Reveal>
  );
}

export function TeamSection() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const { data } = useQuery({
    queryKey: ["team-members-public"],
    queryFn: async () => {
      const { data, error } = await db
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as Member[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="px-6 py-16 md:py-20 relative" style={{ background: "#EDE6DC" }}>
      <div
        aria-hidden
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1.5px",
          background: "linear-gradient(90deg, transparent, rgba(78,140,133,0.35), rgba(186,155,120,0.25), transparent)",
        }}
      />
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase text-[#A0907A]" style={{ letterSpacing: "0.08em" }}>
              {isEn ? "Our Team" : "הצוות שלנו"}
            </span>
            <h2 className="text-2xl md:text-4xl font-light text-[#2D1B3D] mt-3">
              {isEn ? "The People Behind Touching Emotion" : "האנשים מאחורי לגעת ברגש"}
            </h2>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((m, i) => (
            <MemberCard key={m.id} m={m} isEn={isEn} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}
