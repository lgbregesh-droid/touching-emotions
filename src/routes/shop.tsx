import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { InfoCard } from "@/components/InfoCard";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Heart, Share2, Users, BookOpen, Package } from "lucide-react";
import community from "@/assets/home/community.jpg";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "תמיכה בעשייה | לגעת ברגש" },
      { name: "description", content: "פריטים סמליים, תרומות, התנדבות והזמנת סדנה — דרכים לתמוך בפעילות של לגעת ברגש." },
    ],
  }),
  component: Shop,
});

type Product = {
  id: string;
  name_he: string;
  name_en: string | null;
  desc_he: string | null;
  desc_en: string | null;
  price: number;
  image_url: string | null;
  in_stock: boolean;
};

function Shop() {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name_he,name_en,desc_he,desc_en,price,image_url,in_stock")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  const otherWays = [
    { icon: Heart, title: isEn ? "Donate" : "תרומה", desc: isEn ? "Direct financial support for workshops and materials." : "תמיכה כספית ישירה לפעילות, סדנאות וחומרים.", to: "/donations" },
    { icon: Users, title: isEn ? "Volunteer" : "התנדבות", desc: isEn ? "Join the team — facilitation, logistics, content, more." : "הצטרפו לצוות — הנחיה, לוגיסטיקה, תוכן ועוד.", to: "/volunteers" },
    { icon: Share2, title: isEn ? "Share" : "שיתוף", desc: isEn ? "Spread the word — every share opens a door for another child." : "הפיצו הלאה — כל שיתוף פותח דלת לעוד ילד.", to: "/contact" },
    { icon: BookOpen, title: isEn ? "Book a workshop" : "הזמנת סדנה", desc: isEn ? "Bring a workshop to your school, organization or community." : "הביאו סדנה לבית הספר, לארגון או לקהילה שלכם.", to: "/contact" },
  ];

  return (
    <>
      <PageHero
        label={isEn ? "Support Our Work" : "תמיכה בעשייה"}
        title={isEn ? "Small items, real support" : "פריטים קטנים, תמיכה אמיתית"}
        intro={isEn
          ? "Our companion items aren't a shop. They're symbolic objects that carry our emotional language — and every purchase helps us reach more children, teens and communities."
          : "הפריטים שלנו הם לא חנות. הם חפצים סמליים שנושאים את השפה הרגשית שלנו — וכל רכישה עוזרת לנו להגיע לעוד ילדים, נוער וקהילות."}
        ctaLabel={isEn ? "Get in touch" : "צרו קשר"}
        ctaTo="/contact"
        background="cream"
      />

      {/* Why support */}
      <section className="px-6 py-14 md:py-16" style={{ background: "#EAE3DA" }}>
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <Sparkles className="w-8 h-8 text-[#BA9B78] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-light text-[#461C5B] mb-4">{isEn ? "Why support matters" : "למה התמיכה משנה"}</h2>
            <p className="text-[#4A3D30] font-light leading-relaxed max-w-2xl mx-auto">
              {isEn
                ? "Every workshop, every staff training, every parent evening — costs real resources. Your support, whether through a symbolic item or a donation, lets us keep showing up in schools and communities that need it most."
                : "כל סדנה, כל הכשרת צוות, כל ערב הורים — דורשים משאבים אמיתיים. התמיכה שלכם, בין שדרך פריט סמלי ובין שדרך תרומה, מאפשרת לנו להמשיך להגיע לבתי ספר וקהילות שהכי זקוקים."}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Symbolic items */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#FDFBF7" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Symbolic Items" : "פריטים סמליים"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "Take a piece of our language home" : "קחו הביתה משהו מהשפה שלנו"}</h2>
            </div>
          </Reveal>

          {isLoading && <div className="text-center text-[#A0907A] text-sm py-12">…</div>}

          {!isLoading && products.length === 0 && (
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#E0D8CC] p-8 text-center" style={{ borderRight: "3px solid rgba(229,163,173,0.5)" }}>
              <Package className="w-10 h-10 text-[#BA9B78] mx-auto mb-3" />
              <p className="text-[#4A3D30] font-light">{isEn ? "Symbolic items are on the way. In the meantime, you can support us in other ways below." : "הפריטים בדרך. בינתיים אפשר לתמוך בדרכים אחרות למטה."}</p>
            </div>
          )}

          {products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const name = lang === "en" && p.name_en ? p.name_en : p.name_he;
                const desc = lang === "en" && p.desc_en ? p.desc_en : p.desc_he;
                return (
                  <Reveal key={p.id}>
                    <div className="bg-white rounded-2xl border border-[#E0D8CC] overflow-hidden flex flex-col h-full card-hover" style={{ borderRight: "3px solid rgba(186,155,120,0.4)" }}>
                      <div className="relative aspect-square bg-gradient-to-br from-[#F7E8EA] via-[#EAE3DA] to-[#FDFBF7] overflow-hidden">
                        {p.image_url ? (
                          <img src={p.image_url} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-[#461C5B]/40 text-xs tracking-[0.25em] uppercase px-4 text-center">{name}</span>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-lg text-[#461C5B] mb-2">{name}</h3>
                        {desc && <p className="text-sm text-[#4A3D30] font-light leading-relaxed flex-1">{desc}</p>}
                        <div className="flex items-center justify-between mt-5">
                          <span className="text-xl font-serif text-[#D4A373]">₪{Number(p.price).toLocaleString()}</span>
                          {!p.in_stock && <span className="text-xs text-[#A0907A]">{t.shop_page.out_of_stock}</span>}
                        </div>
                        <a href="/contact" className="mt-4 px-6 py-2.5 bg-[#461C5B] hover:bg-[#5a2674] text-white rounded-full text-sm tracking-wide text-center transition-colors">
                          {isEn ? "Details / Order" : "לפרטים / רכישה"}
                        </a>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Other ways to support */}
      <section className="px-6 py-16 md:py-20" style={{ background: "#F7E8EA" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#BA9B78]">{isEn ? "Other Ways" : "דרכים נוספות"}</span>
              <h2 className="text-2xl md:text-4xl font-light text-[#461C5B] mt-3">{isEn ? "More ways to support" : "עוד דרכים לתמוך"}</h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {otherWays.map((w, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <a href={w.to} className="block h-full">
                  <InfoCard icon={w.icon} title={w.title} desc={w.desc} accent={(["blush", "teal", "gold", "purple"] as const)[i]} />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip */}
      <section className="px-6" style={{ background: "#FDFBF7" }}>
        <div className="max-w-5xl mx-auto py-10">
          <img src={community} alt="" className="rounded-2xl w-full aspect-[16/6] object-cover" />
        </div>
      </section>

      <CTABand
        title={isEn ? "Want to support in a way that fits you?" : "רוצים לתמוך בדרך שמתאימה לכם?"}
        sub={isEn ? "Tell us a little — we'll find the right way together." : "ספרו לנו טיפה — נמצא יחד את הדרך שמתאימה."}
        primaryLabel={isEn ? "Contact us" : "צרו קשר"}
        whatsappLabel={t.final_cta.whatsapp}
        variant="purple"
      />
    </>
  );
}
