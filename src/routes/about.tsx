import { createFileRoute, Link } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/use-cms";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { InfoCard } from "@/components/InfoCard";
import { CTABand } from "@/components/CTABand";
import { Ear, MessageCircleHeart, Shield, Users, Sparkles, GraduationCap, HeartHandshake, Home as HomeIcon, Building2 } from "lucide-react";
import community from "@/assets/home/community.jpg";
import facilitator from "@/assets/home/facilitator.jpg";
import school from "@/assets/home/school.jpg";
import workshopChildren from "@/assets/home/workshop-children.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "אודות | לגעת ברגש" },
      { name: "description", content: "מרכז להעצמה רגשית ובניית חוסן — סדנאות, הרצאות ומפגשים לילדים, נוער, מוסדות חינוך וקהילות." },
    ],
  }),
  component: About,
});

function About() {
  const { t, lang } = useLanguage();
  const { data: cms } = useSiteContent();
  const isEn = lang === "en";
  const aboutMain = cms?.["about.main"];
  const aboutMainText = aboutMain ? (isEn ? aboutMain.en : aboutMain.he) : "";


  const approach = [
    { icon: Ear, title: isEn ? "Listening" : "הקשבה", desc: isEn ? "A real space where children, teens and adults are heard — without judgment, without rushing." : "מרחב שבו ילדים, נוער ומבוגרים מרגישים שמקשיבים להם באמת — בלי שיפוטיות ובלי למהר." },
    { icon: MessageCircleHeart, title: isEn ? "Emotional Expression" : "ביטוי רגשי", desc: isEn ? "Building a precise emotional language that allows naming what you feel and sharing it." : "פיתוח שפה רגשית מדויקת שמאפשרת לתת שם למה שמרגישים ולחלוק את זה." },
    { icon: Shield, title: isEn ? "Inner Resilience" : "חוסן פנימי", desc: isEn ? "Practical tools for everyday challenges, change and uncertainty — at any age." : "כלים פרקטיים להתמודדות עם אתגרים יומיומיים, שינוי ואי-ודאות — בכל גיל." },
    { icon: Users, title: isEn ? "Group Empowerment" : "העצמה קבוצתית", desc: isEn ? "Strengthening belonging, trust and a shared language inside the group and the community." : "חיזוק שייכות, אמון ושפה משותפת בתוך הקבוצה והקהילה." },
  ];

  const audiences = [
    { icon: HeartHandshake, title: isEn ? "Children" : "ילדים", desc: isEn ? "Experiential workshops for ages 6+ — emotions, friendship, self-confidence." : "סדנאות חווייתיות מגיל 6 — רגשות, חברות וביטחון עצמי." },
    { icon: Sparkles, title: isEn ? "Teens" : "נוער", desc: isEn ? "Open meetings about identity, belonging and choices in their language." : "מפגשים פתוחים על זהות, שייכות ובחירות — בשפה שלהם." },
    { icon: GraduationCap, title: isEn ? "Educational Teams" : "צוותים חינוכיים", desc: isEn ? "Training and tools for teachers, coordinators and counselors." : "הכשרות וכלים למורים, רכזים ומדריכים." },
    { icon: Building2, title: isEn ? "Schools & Organizations" : "מוסדות וארגונים", desc: isEn ? "Annual programs, lectures and tailored activities." : "תוכניות שנתיות, הרצאות ופעילויות מותאמות." },
    { icon: HomeIcon, title: isEn ? "Parents & Communities" : "הורים וקהילות", desc: isEn ? "Parent guidance, dialogue circles and community evenings." : "הדרכות הורים, מעגלי שיח וערבי קהילה." },
  ];

  return (
    <>
      <PageHero
        label={isEn ? "About Us" : "על לגעת ברגש"}
        title={isEn ? "An emotional home for children, teens and communities" : "בית רגשי לילדים, לנוער ולקהילות"}
        intro={isEn
          ? "Touching Emotion is a center for emotional empowerment and resilience-building. We work with children, teens, schools, organizations and parents — through workshops, lectures and tailored programs."
          : "‎לגעת ברגש הוא מרכז להעצמה רגשית ולבניית חוסן. אנחנו עובדים עם ילדים, נוער, בתי ספר, ארגונים והורים — דרך סדנאות, הרצאות ותוכניות מותאמות."}
        ctaLabel={isEn ? "Get in touch" : "השאירו פרטים"}
        ctaTo="/contact"
        imageSlot={
          <div className="grid grid-cols-2 gap-3">
            <img src={workshopChildren} alt="" className="rounded-2xl aspect-[3/4] object-cover col-span-1 row-span-2" />
            <img src={facilitator} alt="" className="rounded-2xl aspect-square object-cover" />
            <img src={community} alt="" className="rounded-2xl aspect-square object-cover" />
          </div>
        }
      />

      {/* Brand story */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#FDFBF7" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Our Story" : "הסיפור שלנו"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "Why we built this place" : "למה הקמנו את המקום הזה"}</h2>
            </div>
            <div className="bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-10 leading-loose text-[#4A3D30] font-light" style={{ borderRight: "3px solid rgba(78,140,133,0.3)" }}>
              <p className="mb-4">
                {isEn
                  ? "Touching Emotion was born from a simple insight: too many children, teens and adults carry feelings they have no language for. They grow up in classrooms, families and communities that never made room to talk about what's happening inside."
                  : "‎לגעת ברגש נולד מתובנה פשוטה: יותר מדי ילדים, נוער ומבוגרים נושאים בתוכם רגשות שאין להם מילים אליהם. הם גדלים בכיתות, במשפחות ובקהילות שלא תמיד נתנו מקום לדבר על מה שקורה בפנים."}
              </p>
              <p>
                {isEn
                  ? "Our mission is to bring emotional awareness, expression, resilience and empowerment into the places where life actually happens — schools, youth groups, family homes and community spaces. Not as a lecture, but as a lived experience."
                  : "‎המשימה שלנו היא להכניס מודעות רגשית, ביטוי, חוסן והעצמה אל המקומות שבהם החיים באמת קורים — בתי ספר, תנועות נוער, בתים וקהילות. לא כהרצאה, אלא כחוויה חיה."}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The approach */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#EAE3DA" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Our Approach" : "הגישה שלנו"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "Four pillars that guide every session" : "ארבעה עוגנים שמובילים כל מפגש"}</h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {approach.map((a, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <InfoCard icon={a.icon} title={a.title} desc={a.desc} accent={["teal", "blush", "purple", "gold"][i] as "teal" | "blush" | "purple" | "gold"} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#FDFBF7" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Who We Work With" : "עם מי אנחנו עובדים"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "Tailored to each audience" : "מותאם לכל קהל"}</h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {audiences.map((a, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <InfoCard icon={a.icon} title={a.title} desc={a.desc} accent={(["gold", "teal", "purple", "blush", "gold"] as const)[i]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#F7E8EA" }}>
        <Reveal>
          <blockquote className="max-w-3xl mx-auto text-center">
            <span className="block text-5xl md:text-6xl font-serif text-[#D4A373] leading-none mb-3">"</span>
            <p className="text-xl md:text-2xl font-light text-[#461C5B] leading-relaxed">
              {isEn
                ? "Starting a new path is hard — but not as hard as staying in a place that doesn't fit you."
                : "התחלה של דרך חדשה היא קשה, אבל לא כמו להישאר במצב שלא מתאים לך."}
            </p>
            <span className="mt-5 inline-block text-xs tracking-[0.25em] uppercase text-[#BA9B78]">— {isEn ? "Touching Emotion" : "לגעת ברגש"}</span>
          </blockquote>
        </Reveal>
      </section>

      {/* Image strip */}
      <section className="px-6 py-12 md:py-16" style={{ background: "#FDFBF7" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          <img src={workshopChildren} alt="" className="rounded-2xl aspect-[4/3] object-cover" />
          <img src={school} alt="" className="rounded-2xl aspect-[4/3] object-cover" />
          <img src={community} alt="" className="rounded-2xl aspect-[4/3] object-cover col-span-2 md:col-span-1" />
        </div>
        <div className="text-center mt-6">
          <Link to="/gallery" className="text-sm text-[#BA9B78] hover:underline">{isEn ? "Visit our gallery →" : "לכל הגלריה ←"}</Link>
        </div>
      </section>

      <CTABand
        title={isEn ? "Want to understand which activity fits you?" : "רוצים להבין איזו פעילות מתאימה לכם?"}
        sub={isEn ? "Leave your details and we'll get back to you with a tailored suggestion." : "השאירו פרטים ונחזור אליכם עם הצעה מותאמת אישית."}
        primaryLabel={isEn ? "Leave details" : "השאירו פרטים"}
        whatsappLabel={t.final_cta.whatsapp}
        variant="purple"
      />

      {/* Hidden t reference to silence unused */}
      <span className="hidden">{t.about_page.heading}</span>
    </>
  );
}
