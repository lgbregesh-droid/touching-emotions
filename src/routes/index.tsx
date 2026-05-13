import { createFileRoute, Link } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { HomeGallery } from "@/components/HomeGallery";
import { Link as RLink } from "@tanstack/react-router";
import { EventsHomeSection } from "@/components/EventsHomeSection";
import { Users, Sparkles, Heart, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t } = useLanguage();
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden -mt-16 md:-mt-20 pt-16 md:pt-20">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          poster=""
        />
        <div className="absolute inset-0 bg-[#2D1B3D]/75" />
        {/* Floating orbs */}
        <div className="absolute top-[10%] right-[8%] w-[420px] h-[420px] rounded-full blur-3xl float-orb-1" style={{ background: "radial-gradient(circle, rgba(106,60,160,0.25), transparent 70%)" }} />
        <div className="absolute top-[15%] left-[5%] w-[360px] h-[360px] rounded-full blur-3xl float-orb-2" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.13), transparent 70%)" }} />
        <div className="absolute bottom-[8%] right-[20%] w-[300px] h-[300px] rounded-full blur-3xl float-orb-3" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.09), transparent 70%)" }} />

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <span className="hero-anim-badge inline-block px-4 py-1.5 text-xs tracking-[0.2em] uppercase text-[#F5F0E8]/60 border border-[#BA9B78]/40 rounded-full mb-8">
            {t.hero.badge}
          </span>
          <h1 className="hero-anim-title text-5xl md:text-7xl lg:text-8xl font-extralight text-[#F5F0E8] tracking-wider mb-6">
            {t.hero.title}
          </h1>
          <div className="flex justify-center mb-6">
            <span className="hero-anim-line gold-divider" />
          </div>
          <p className="hero-anim-sub text-base md:text-lg text-[#F5F0E8]/75 max-w-xl mx-auto leading-relaxed mb-10 font-light">
            {t.hero.sub}
          </p>
          <div className="hero-anim-cta flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <Link to="/contact" className="btn-pulse px-8 py-3.5 bg-[#BA9B78] text-white rounded-full text-sm tracking-wide hover:bg-[#a98968] transition-colors">
              {t.hero.cta_primary}
            </Link>
            <Link to="/workshops" className="px-8 py-3.5 border border-[#F5F0E8]/30 text-[#F5F0E8] rounded-full text-sm tracking-wide hover:bg-[#F5F0E8]/10 transition-colors">
              {t.hero.cta_secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="bg-[#EDE6DC] py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#A0907A] text-center mb-4">— {t.about_teaser.heading} —</p>
            <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#E0D8CC] shadow-sm" style={{ borderRight: "3px solid rgba(78,140,133,0.30)" }}>
              <p className="text-[#4A3D30] text-lg leading-loose font-light">{t.about_teaser.text}</p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <span className="px-4 py-1.5 text-xs tracking-wider rounded-full border border-[#BA9B78] text-[#2D1B3D]">{t.about_teaser.pill1}</span>
                <span className="px-4 py-1.5 text-xs tracking-wider rounded-full border border-[rgba(78,140,133,0.5)] text-[#2D1B3D]">{t.about_teaser.pill2}</span>
                <span className="px-4 py-1.5 text-xs tracking-wider rounded-full border border-[#BA9B78] text-[#2D1B3D]">{t.about_teaser.pill3}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="relative py-20 md:py-28 px-6" style={{ background: "linear-gradient(135deg, #EDE6DC 60%, rgba(78,140,133,0.08) 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#A0907A] text-center mb-12">— {t.services.label} —</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, label: t.services.s1, bg: "#F0F5F3", stroke: "#4E8C85" },
              { icon: Sparkles, label: t.services.s2, bg: "#F5F0E8", stroke: "#2D1B3D" },
              { icon: Heart, label: t.services.s3, bg: "#F0F5F3", stroke: "#2D1B3D" },
              { icon: MessageCircle, label: t.services.s4, bg: "#F5F0E8", stroke: "#2D1B3D" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="card-hover bg-white border border-[#E0D8CC] rounded-2xl p-7 h-full flex flex-col items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                      <Icon size={22} color={s.stroke} strokeWidth={1.4} />
                    </div>
                    <h3 className="text-lg text-[#2D1B3D] font-normal">{s.label}</h3>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <EventsHomeSection />

      {/* QUOTE */}
      <section className="relative bg-[#2D1B3D] py-24 md:py-32 px-6">
        <div className="absolute top-0 inset-x-0 shimmer-line" />
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="text-5xl text-[#BA9B78] opacity-55 leading-none mb-4 font-serif">"</div>
            <p className="text-lg md:text-xl text-[#F5F0E8]/70 leading-[1.9] font-light">{t.quote.text}</p>
            <div className="flex justify-center mt-8">
              <span className="inline-block w-[22px] h-px bg-[#BA9B78] opacity-40" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 md:py-24 px-6" style={{ background: "linear-gradient(135deg, #EDE6DC 55%, rgba(78,140,133,0.10) 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <h2 className="text-2xl md:text-3xl text-[#2D1B3D] font-light mb-8">{t.cta_banner.text}</h2>
            <Link to="/contact" className="btn-pulse inline-block px-10 py-3.5 bg-[#BA9B78] text-white rounded-full text-sm tracking-wide hover:bg-[#a98968] transition-colors">
              {t.cta_banner.btn}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* GALLERY */}
      <section className="relative bg-[#2D1B3D] py-20 md:py-28 px-6 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.12), transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-extralight text-[#F5F0E8] tracking-wider">{t.gallery.title}</h2>
              <div className="flex justify-center my-4">
                <span className="inline-block w-[26px] h-px bg-[#BA9B78] opacity-55" />
              </div>
              <p className="text-xs tracking-[0.25em] uppercase text-[#F5F0E8]/45">{t.gallery.sub}</p>
            </Reveal>
          </div>
          <Gallery count={8} />
        </div>
      </section>
    </>
  );
}
