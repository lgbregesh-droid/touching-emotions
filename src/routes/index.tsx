import { createFileRoute, Link } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { HomeGallery } from "@/components/HomeGallery";
import { Link as RLink } from "@tanstack/react-router";
import { EventsHomeSection } from "@/components/EventsHomeSection";
import {
  Baby, Users, School, GraduationCap, HomeIcon,
  ShieldCheck, MessagesSquare, Heart, HandHeart, Sparkles, Network,
  MessageCircle,
} from "lucide-react";
import { AudienceCard } from "@/components/home/AudienceCard";
import { ServiceCard } from "@/components/home/ServiceCard";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { ImpactGrid } from "@/components/home/ImpactGrid";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { TextEffect } from "@/components/ui/text-effect";
import { SupportTeaser } from "@/components/home/SupportTeaser";

import imgChildren from "@/assets/home/workshop-children.jpg";
import imgTeens from "@/assets/home/workshop-teens.jpg";
import imgFacilitator from "@/assets/home/facilitator.jpg";
import imgSchool from "@/assets/home/school.jpg";
import imgParents from "@/assets/home/parents.jpg";
import imgCommunity from "@/assets/home/community.jpg";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t } = useLanguage();

  const audiences = [
    { icon: Baby, title: t.audiences.a1_title, desc: t.audiences.a1_desc },
    { icon: Users, title: t.audiences.a2_title, desc: t.audiences.a2_desc },
    { icon: School, title: t.audiences.a3_title, desc: t.audiences.a3_desc },
    { icon: GraduationCap, title: t.audiences.a4_title, desc: t.audiences.a4_desc },
    { icon: HomeIcon, title: t.audiences.a5_title, desc: t.audiences.a5_desc },
  ];

  const services = [
    { image: imgChildren, title: t.offer.s1_title, desc: t.offer.s1_desc, audience: `${t.offer.audience_label}: ${t.offer.s1_aud}`, to: "/workshops" as const },
    { image: imgTeens, title: t.offer.s2_title, desc: t.offer.s2_desc, audience: `${t.offer.audience_label}: ${t.offer.s2_aud}`, to: "/workshops" as const },
    { image: imgSchool, title: t.offer.s3_title, desc: t.offer.s3_desc, audience: `${t.offer.audience_label}: ${t.offer.s3_aud}`, to: "/events" as const },
    { image: imgCommunity, title: t.offer.s4_title, desc: t.offer.s4_desc, audience: `${t.offer.audience_label}: ${t.offer.s4_aud}`, to: "/events" as const },
    { image: imgFacilitator, title: t.offer.s5_title, desc: t.offer.s5_desc, audience: `${t.offer.audience_label}: ${t.offer.s5_aud}`, to: "/workshops" as const },
    { image: imgParents, title: t.offer.s6_title, desc: t.offer.s6_desc, audience: `${t.offer.audience_label}: ${t.offer.s6_aud}`, to: "/workshops" as const },
  ];

  const processSteps = [
    { title: t.process.p1_title, desc: t.process.p1_desc },
    { title: t.process.p2_title, desc: t.process.p2_desc },
    { title: t.process.p3_title, desc: t.process.p3_desc },
    { title: t.process.p4_title, desc: t.process.p4_desc },
  ];

  const impactItems = [
    { icon: ShieldCheck, title: t.impact.i1_title, desc: t.impact.i1_desc },
    { icon: MessagesSquare, title: t.impact.i2_title, desc: t.impact.i2_desc },
    { icon: Heart, title: t.impact.i3_title, desc: t.impact.i3_desc },
    { icon: HandHeart, title: t.impact.i4_title, desc: t.impact.i4_desc },
    { icon: Sparkles, title: t.impact.i5_title, desc: t.impact.i5_desc },
    { icon: Network, title: t.impact.i6_title, desc: t.impact.i6_desc },
  ];

  const testimonials = [
    { quote: t.testimonials.t1_quote, name: t.testimonials.t1_name, role: t.testimonials.t1_role },
    { quote: t.testimonials.t2_quote, name: t.testimonials.t2_name, role: t.testimonials.t2_role },
    { quote: t.testimonials.t3_quote, name: t.testimonials.t3_name, role: t.testimonials.t3_role },
    { quote: t.testimonials.t4_quote, name: t.testimonials.t4_name, role: t.testimonials.t4_role },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20 md:pt-24 pb-12">
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
        <div className="absolute top-[10%] right-[8%] w-[420px] h-[420px] rounded-full blur-3xl float-orb-1" style={{ background: "radial-gradient(circle, rgba(106,60,160,0.25), transparent 70%)" }} />
        <div className="absolute top-[15%] left-[5%] w-[360px] h-[360px] rounded-full blur-3xl float-orb-2" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.13), transparent 70%)" }} />
        <div className="absolute bottom-[8%] right-[20%] w-[300px] h-[300px] rounded-full blur-3xl float-orb-3" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.09), transparent 70%)" }} />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <span className="hero-anim-badge inline-block px-4 py-1.5 text-xs tracking-[0.2em] uppercase text-[#F5F0E8]/70 border border-[#BA9B78]/40 rounded-full mb-6">
            {t.hero.badge}
          </span>
          <h1 className="hero-anim-title text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extralight text-[#F5F0E8] tracking-wide leading-tight mb-5">
            {t.hero.title}
          </h1>
          <div className="flex justify-center mb-5">
            <span className="hero-anim-line gold-divider" />
          </div>
          <p className="hero-anim-sub text-base md:text-lg text-[#F5F0E8]/80 max-w-2xl mx-auto leading-relaxed mb-8 font-light">
            {t.hero.sub}
          </p>
          <div className="hero-anim-cta flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center mb-8">
            <Link to="/contact" className="btn-pulse px-8 py-3.5 bg-[#BA9B78] text-white rounded-full text-sm tracking-wide hover:bg-[#a98968] transition-colors">
              {t.hero.cta_primary}
            </Link>
            <Link to="/workshops" className="px-8 py-3.5 border border-[#F5F0E8]/30 text-[#F5F0E8] rounded-full text-sm tracking-wide hover:bg-[#F5F0E8]/10 transition-colors">
              {t.hero.cta_secondary}
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[t.hero.badge1, t.hero.badge2, t.hero.badge3].map((b, i) => (
              <span key={i} className="px-3.5 py-1.5 text-[11px] tracking-wider rounded-full bg-white/8 backdrop-blur-md border border-[#BA9B78]/35 text-[#F5F0E8]/85">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT TEASER + QUOTE */}
      <section className="bg-[#EDE6DC] py-14 md:py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1.3fr_1fr] gap-8 items-stretch">
          <Reveal>
            <div className="h-full">
              <p className="text-xs tracking-[0.25em] uppercase text-[#A0907A] mb-2">— {t.about_teaser.heading} —</p>
              <p className="mb-5 font-serif italic text-lg md:text-xl" style={{ background: "linear-gradient(90deg, #BA9B78, #4E8C85, #2D1B3D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {t.about_teaser.tagline}
              </p>
              <p className="text-[#4A3D30] text-base leading-loose font-light mb-5">{t.about_teaser.text}</p>
              <div className="flex flex-wrap gap-2.5">
                <span className="px-3.5 py-1.5 text-xs tracking-wider rounded-full border border-[#BA9B78] text-[#2D1B3D] bg-white/40">{t.about_teaser.pill1}</span>
                <span className="px-3.5 py-1.5 text-xs tracking-wider rounded-full border border-[rgba(78,140,133,0.5)] text-[#2D1B3D] bg-white/40">{t.about_teaser.pill2}</span>
                <span className="px-3.5 py-1.5 text-xs tracking-wider rounded-full border border-[#BA9B78] text-[#2D1B3D] bg-white/40">{t.about_teaser.pill3}</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative bg-white rounded-2xl p-6 md:p-7 border border-[#E0D8CC] shadow-sm h-full flex items-center" style={{ borderRight: "4px solid #BA9B78" }}>
              <div className="absolute -top-3 right-5 text-6xl text-[#BA9B78] font-serif leading-none">"</div>
              <TextEffect
                per="word"
                preset="blur"
                as="p"
                className="text-[#2D1B3D] text-base md:text-lg font-serif italic leading-relaxed"
              >
                {t.about_teaser.quote}
              </TextEffect>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="bg-[#F5F0E8] py-14 md:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#BA9B78] text-center mb-2">— {t.audiences.label} —</p>
            <h2 className="text-2xl md:text-4xl font-extralight text-[#2D1B3D] text-center mb-10">{t.audiences.heading}</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {audiences.map((a, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <AudienceCard icon={a.icon} title={a.title} desc={a.desc} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OFFER */}
      <section className="bg-[#EDE6DC] py-14 md:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#BA9B78] text-center mb-2">— {t.offer.label} —</p>
            <h2 className="text-2xl md:text-4xl font-extralight text-[#2D1B3D] text-center mb-2">{t.offer.heading}</h2>
            <p className="text-center text-[#4A3D30] font-light max-w-2xl mx-auto mb-10">{t.offer.sub}</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <Reveal key={i} delay={(i % 3) * 0.08}>
                <ServiceCard image={s.image} title={s.title} desc={s.desc} audience={s.audience} cta={t.offer.cta} to={s.to} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="relative bg-[#2D1B3D] py-14 md:py-20 px-6 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(186,155,120,0.18), transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.15), transparent 70%)" }} />
        <div className="relative max-w-6xl mx-auto">
          <Reveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#BA9B78] text-center mb-2">— {t.process.label} —</p>
            <h2 className="text-2xl md:text-4xl font-extralight text-[#F5F0E8] text-center mb-2">{t.process.heading}</h2>
            <p className="text-center text-[#F5F0E8]/70 font-light max-w-2xl mx-auto mb-10">{t.process.sub}</p>
          </Reveal>
          <ProcessTimeline steps={processSteps} />
        </div>
      </section>

      {/* IMPACT */}
      <section className="bg-[#EDE6DC] py-14 md:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#BA9B78] text-center mb-2">— {t.impact.label} —</p>
            <h2 className="text-2xl md:text-4xl font-extralight text-[#2D1B3D] text-center mb-10">{t.impact.heading}</h2>
          </Reveal>
          <ImpactGrid items={impactItems} />
        </div>
      </section>

      {/* GALLERY */}
      <section className="relative bg-[#2D1B3D] py-12 md:py-16 px-6 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(78,140,133,0.12), transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-2">
            <Reveal>
              <h2 className="text-2xl md:text-3xl font-extralight text-[#F5F0E8] tracking-wider">{t.gallery.title}</h2>
              <div className="flex justify-center my-3">
                <span className="inline-block w-[26px] h-px bg-[#BA9B78] opacity-55" />
              </div>
              <p className="text-xs tracking-[0.25em] uppercase text-[#F5F0E8]/45">{t.gallery.sub}</p>
            </Reveal>
          </div>
          <div className="mt-4 flex justify-end">
            <RLink to="/gallery" className="text-xs tracking-[0.2em] uppercase text-[#F5F0E8]/70 hover:text-[#BA9B78] transition">
              {t.gallery.btn} →
            </RLink>
          </div>
          <HomeGallery count={8} />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#F5F0E8] py-14 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#BA9B78] text-center mb-2">— {t.testimonials.label} —</p>
            <h2 className="text-2xl md:text-4xl font-extralight text-[#2D1B3D] text-center mb-10">{t.testimonials.heading}</h2>
          </Reveal>
          <StaggerTestimonials
            items={testimonials.map((t) => ({
              testimonial: t.quote,
              by: `${t.name} · ${t.role}`,
            }))}
          />
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <EventsHomeSection />

      {/* SUPPORT */}
      <section className="bg-[#EDE6DC] py-14 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <SupportTeaser
              label={t.support.label}
              title={t.support.heading}
              desc={t.support.desc}
              cta={t.support.cta}
              donateCta={t.support.donate_cta}
            />
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative bg-[#2D1B3D] py-14 md:py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 50%, rgba(186,155,120,0.35), transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="text-xs tracking-[0.25em] uppercase text-[#BA9B78] mb-3">— {t.final_cta.label} —</p>
            <h2 className="text-2xl md:text-4xl font-extralight text-[#F5F0E8] mb-3">{t.final_cta.heading}</h2>
            <p className="text-[#F5F0E8]/75 font-light mb-8 max-w-xl mx-auto">{t.final_cta.sub}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact" className="btn-pulse px-8 py-3.5 bg-[#BA9B78] text-white rounded-full text-sm tracking-wide hover:bg-[#a98968] transition-colors">
                {t.final_cta.cta}
              </Link>
              <a
                href="https://wa.me/972000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-[#F5F0E8]/30 text-[#F5F0E8] rounded-full text-sm tracking-wide hover:bg-[#F5F0E8]/10 transition-colors"
              >
                <MessageCircle size={16} />
                {t.final_cta.whatsapp}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
