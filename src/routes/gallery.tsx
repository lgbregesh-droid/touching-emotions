import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { Gallery } from "@/components/Gallery";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "גלריה | לגעת ברגש" }] }),
  component: GalleryPage,
});

function GalleryPage() {
  const { t } = useLanguage();
  return (
    <section className="relative bg-[#2D1B3D] py-20 md:py-28 px-6 min-h-[80vh] overflow-hidden -mt-16 md:-mt-20 pt-32 md:pt-40">
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.12), transparent 70%)" }} />
      <div className="relative max-w-7xl mx-auto">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-extralight text-[#F5F0E8] text-center tracking-wider">{t.gallery.title}</h1>
          <div className="flex justify-center my-5"><span className="w-[26px] h-px bg-[#BA9B78] opacity-55" /></div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#F5F0E8]/45 text-center">{t.gallery.sub}</p>
        </Reveal>
        <Gallery count={10} featuredOnly={false} />
      </div>
    </section>
  );
}
