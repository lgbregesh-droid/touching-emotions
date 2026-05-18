import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { HomeGallery } from "@/components/HomeGallery";
import { Link as RLink } from "@tanstack/react-router";
import { EventsHomeSection } from "@/components/EventsHomeSection";
import { Users, Sparkles, Heart, MessageCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: Home });

function useGalleryStrip(limit = 8) {
  const [imgs, setImgs] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("gallery")
        .select("url,order_index")
        .order("order_index", { ascending: true })
        .limit(limit);
      if (!active) return;
      setImgs((data || []).map((r: { url: string }) => r.url));
    })();
    return () => { active = false; };
  }, [limit]);
  return imgs;
}

function Home() {
  const { t } = useLanguage();
  const stripImgs = useGalleryStrip(10);

  return (
    <>
      {/* HERO — tighter, image-rich */}
      <section className="relative min-h-[78svh] flex items-center justify-center overflow-hidden -mt-16 md:-mt-20 pt-16 md:pt-20">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D1B3D]/85 via-[#2D1B3D]/65 to-[#2D1B3D]/90" />
        <div className="absolute top-[10%] right-[8%] w-[340px] h-[340px] rounded-full blur-3xl float-orb-1" style={{ background: "radial-gradient(circle, rgba(106,60,160,0.30), transparent 70%)" }} />
        <div className="absolute bottom-[12%] left-[6%] w-[260px] h-[260px] rounded-full blur-3xl float-orb-2" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.18), transparent 70%)" }} />

        <div className="relative z-10 text-center px-6 max-w-2xl py-10">
          <span className="hero-anim-badge inline-block px-3 py-1 text-[10px] tracking-[0.25em] uppercase text-[#F5F0E8]/70 border border-[#BA9B78]/50 rounded-full mb-5">
            {t.hero.badge}
          </span>
          <h1 className="hero-anim-title text-3xl md:text-5xl lg:text-6xl font-extralight text-[#F5F0E8] tracking-wide mb-3">
            {t.hero.title}
          </h1>
          <div className="flex justify-center mb-4">
            <span className="hero-anim-line gold-divider" />
          </div>
          <p className="hero-anim-sub text-sm md:text-base text-[#F5F0E8]/80 max-w-lg mx-auto leading-relaxed mb-6 font-light">
            {t.hero.sub}
          </p>
          <div className="hero-anim-cta flex flex-col sm:flex-row gap-2.5 justify-center items-stretch sm:items-center">
            <Link to="/contact" className="btn-pulse px-6 py-2.5 bg-[#BA9B78] text-white rounded-full text-xs tracking-wider hover:bg-[#a98968] transition-colors">
              {t.hero.cta_primary}
            </Link>
            <Link to="/workshops" className="px-6 py-2.5 border border-[#F5F0E8]/35 text-[#F5F0E8] rounded-full text-xs tracking-wider hover:bg-[#F5F0E8]/10 transition-colors">
              {t.hero.cta_secondary}
            </Link>
          </div>
        </div>

        {/* Image strip on the bottom of hero */}
        {stripImgs.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 z-10 overflow-hidden border-t border-[#BA9B78]/20 bg-[#2D1B3D]/40 backdrop-blur-sm">
            <div className="marquee-track flex gap-2 w-max py-2">
              {[...stripImgs, ...stripImgs].map((src, i) => (
                <div key={i} className="w-[140px] h-[80px] md:w-[180px] md:h-[100px] shrink-0 overflow-hidden rounded-md ring-1 ring-[#BA9B78]/25">
                  <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ABOUT + COLLAGE — side by side, denser */}
      <section className="bg-[#EDE6DC] py-12 md:py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 items-center">
          <Reveal className="md:col-span-7">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#BA9B78] mb-2">— {t.about_teaser.heading} —</p>
            <h2 className="text-2xl md:text-3xl font-light text-[#2D1B3D] mb-4 leading-tight">
              {t.about_teaser.heading}
            </h2>
            <p className="text-[#4A3D30] text-sm md:text-base leading-relaxed font-light">
              {t.about_teaser.text}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="px-3 py-1 text-[10px] tracking-wider rounded-full border border-[#BA9B78] text-[#2D1B3D]">{t.about_teaser.pill1}</span>
              <span className="px-3 py-1 text-[10px] tracking-wider rounded-full border border-[rgba(78,140,133,0.5)] text-[#2D1B3D]">{t.about_teaser.pill2}</span>
              <span className="px-3 py-1 text-[10px] tracking-wider rounded-full border border-[#BA9B78] text-[#2D1B3D]">{t.about_teaser.pill3}</span>
            </div>
            <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#2D1B3D] hover:text-[#BA9B78] transition group">
              עוד עלינו <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </Reveal>

          {/* Image collage */}
          <Reveal className="md:col-span-5">
            <div className="grid grid-cols-3 grid-rows-3 gap-2 h-[280px] md:h-[360px]">
              {stripImgs.slice(0, 5).map((src, i) => {
                const layouts = [
                  "col-span-2 row-span-2",
                  "col-span-1 row-span-1",
                  "col-span-1 row-span-1",
                  "col-span-1 row-span-1",
                  "col-span-2 row-span-1",
                ];
                return (
                  <div
                    key={i}
                    className={`${layouts[i]} overflow-hidden rounded-lg ring-1 ring-[#BA9B78]/30 shadow-md group`}
                    style={{ animation: `fade-in 0.6s ease-out ${i * 0.08}s both` }}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  </div>
                );
              })}
              {stripImgs.length === 0 && (
                <div className="col-span-3 row-span-3 bg-gradient-to-br from-[#BA9B78]/30 to-[#2D1B3D]/30 rounded-lg" />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES — denser grid with hover gleam */}
      <section className="relative py-12 md:py-16 px-6" style={{ background: "linear-gradient(135deg, #EDE6DC 60%, rgba(78,140,133,0.10) 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#BA9B78] mb-1">— {t.services.label} —</p>
                <h2 className="text-2xl md:text-3xl font-light text-[#2D1B3D]">{t.services.label}</h2>
              </div>
              <Link to="/workshops" className="text-xs tracking-[0.2em] uppercase text-[#2D1B3D]/70 hover:text-[#BA9B78] transition">
                כל הסדנאות →
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: Users, label: t.services.s1, bg: "#F0F5F3", stroke: "#4E8C85" },
              { icon: Sparkles, label: t.services.s2, bg: "#F5F0E8", stroke: "#2D1B3D" },
              { icon: Heart, label: t.services.s3, bg: "#F0F5F3", stroke: "#2D1B3D" },
              { icon: MessageCircle, label: t.services.s4, bg: "#F5F0E8", stroke: "#2D1B3D" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="card-hover relative overflow-hidden bg-white border border-[#E0D8CC] rounded-xl p-4 md:p-5 h-full flex flex-col items-start gap-3 group">
                    <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity" style={{ background: s.stroke }} />
                    <div className="relative w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                      <Icon size={18} color={s.stroke} strokeWidth={1.5} />
                    </div>
                    <h3 className="relative text-sm md:text-base text-[#2D1B3D] font-normal leading-snug">{s.label}</h3>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* IN ACTION — full-bleed parallax image band */}
      {stripImgs.length >= 3 && (
        <section className="relative h-[260px] md:h-[340px] overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-5 gap-0">
            {stripImgs.slice(0, 5).map((src, i) => (
              <div key={i} className={`relative overflow-hidden ${i > 2 ? "hidden md:block" : ""}`}>
                <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-[1.2s] hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-[#2D1B3D]/40 hover:bg-[#2D1B3D]/10 transition-colors" />
              </div>
            ))}
          </div>
          <div className="relative h-full flex items-center justify-center px-6 pointer-events-none">
            <div className="text-center">
              <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#F5F0E8]/80 mb-2">— הרגעים שלנו —</p>
              <h3 className="text-xl md:text-2xl font-light text-[#F5F0E8] tracking-wide drop-shadow-lg">
                {t.gallery.title}
              </h3>
            </div>
          </div>
        </section>
      )}

      {/* UPCOMING EVENTS */}
      <EventsHomeSection />

      {/* QUOTE — small, inline ribbon */}
      <section className="relative bg-[#2D1B3D] py-10 md:py-14 px-6">
        <div className="absolute top-0 inset-x-0 shimmer-line" />
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <span className="text-2xl text-[#BA9B78] opacity-60 font-serif leading-none">"</span>
            <p className="text-sm md:text-base text-[#F5F0E8]/75 leading-relaxed font-light italic mt-1">
              {t.quote.text}
            </p>
            <div className="flex justify-center mt-3">
              <span className="inline-block w-[18px] h-px bg-[#BA9B78] opacity-50" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA BANNER — tighter */}
      <section className="py-12 md:py-16 px-6" style={{ background: "linear-gradient(135deg, #EDE6DC 55%, rgba(78,140,133,0.10) 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <h2 className="text-xl md:text-2xl text-[#2D1B3D] font-light mb-5">{t.cta_banner.text}</h2>
            <Link to="/contact" className="btn-pulse inline-block px-8 py-3 bg-[#BA9B78] text-white rounded-full text-xs tracking-wider hover:bg-[#a98968] transition-colors">
              {t.cta_banner.btn}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* GALLERY */}
      <section className="relative bg-[#2D1B3D] py-12 md:py-16 px-6 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.12), transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-2 gap-4 flex-wrap">
            <Reveal>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#F5F0E8]/50 mb-1">— {t.gallery.sub} —</p>
              <h2 className="text-2xl md:text-3xl font-extralight text-[#F5F0E8] tracking-wide">{t.gallery.title}</h2>
            </Reveal>
            <RLink to="/gallery" className="text-xs tracking-[0.2em] uppercase text-[#F5F0E8]/70 hover:text-[#BA9B78] transition">
              {t.gallery.btn} →
            </RLink>
          </div>
          <HomeGallery count={8} />
        </div>
      </section>
    </>
  );
}
