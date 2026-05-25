import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/use-cms";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { Gallery } from "@/components/Gallery";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "גלריה | לגעת ברגש" }, { name: "description", content: "תמונות מסדנאות, הרצאות ופעילויות קהילתיות של לגעת ברגש." }] }),
  component: GalleryPage,
});

function GalleryPage() {
  const { t, lang } = useLanguage();
  const isEn = lang === "en";
  const { data: cms } = useSiteContent();
  const pick = (key: string, fb: string) => { const v = cms?.[key]; return v ? ((isEn ? v.en : v.he) || fb) : fb; };
  return (
    <>
      <PageHero
        label={pick("gallery.label", isEn ? "Gallery" : "גלריה")}
        title={pick("gallery.title", isEn ? "Moments we create together" : "הרגעים שאנחנו יוצרים יחד")}
        intro={pick("gallery.intro", isEn
          ? "Photos from our workshops, lectures, community gatherings and youth activities — a small window into the work we love."
          : "תמונות מהסדנאות, ההרצאות, המפגשים הקהילתיים והפעילויות עם הנוער — חלון קטן לעשייה שאנחנו אוהבים.")}
        background="cream"
      />

      <section className="px-6 pb-16 md:pb-20" style={{ background: "#2D1B3D" }}>
        <div className="max-w-7xl mx-auto pt-10">
          <Gallery count={12} featuredOnly={false} />
        </div>
        <span className="hidden">{t.gallery.title}</span>
      </section>

      <CTABand
        title={pick("gallery.cta.title", isEn ? "Want to host a similar activity?" : "רוצים להזמין פעילות דומה?")}
        sub={pick("gallery.cta.sub", isEn ? "Tell us about your group and we'll tailor it." : "ספרו לנו על הקבוצה ונבנה משהו שמתאים.")}
        primaryLabel={isEn ? "Contact us" : "צרו קשר"}
        whatsappLabel={t.final_cta.whatsapp}
        variant="blush"
      />
    </>
  );
}
