import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { CompactPageHeader } from "@/components/CompactPageHeader";
import { CTABand } from "@/components/CTABand";
import { listUpcomingEvents, listPastEvents } from "@/lib/events.functions";
import { EventCard, type EventRow } from "@/components/events/EventCard";
import { useSiteContent } from "@/hooks/use-cms";
import { RegistrationModal } from "@/components/events/RegistrationModal";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "אירועים קרובים — לגעת ברגש" },
      { name: "description", content: "הרצאות, סדנאות ומפגשים פתוחים לקהל הרחב — הירשמו וקבלו תזכורת." },
      { property: "og:title", content: "אירועים קרובים — לגעת ברגש" },
      { property: "og:description", content: "הרצאות, סדנאות ומפגשים פתוחים לקהל הרחב." },
    ],
  }),
  component: EventsPage,
});

type Filter = "all" | "lecture" | "workshop" | "meetup" | "evening";

function EventsPage() {
  const { t, lang } = useLanguage();
  const { data: cms } = useSiteContent();
  const isEn = lang === "en";
  const pick = (key: string, fallback: string) => {
    const v = cms?.[key];
    if (!v) return fallback;
    return (isEn ? v.en : v.he) || fallback;
  };
  const upFn = useServerFn(listUpcomingEvents);
  const pastFn = useServerFn(listPastEvents);
  const [filter, setFilter] = useState<Filter>("all");
  const [showPast, setShowPast] = useState(false);
  const [selected, setSelected] = useState<EventRow | null>(null);

  const { data: upData } = useQuery({ queryKey: ["events", "upcoming"], queryFn: () => upFn({ data: {} }) });
  const { data: pastData } = useQuery({ queryKey: ["events", "past"], queryFn: () => pastFn({ data: {} }), enabled: showPast });

  const upcoming = (upData?.rows || []) as EventRow[];
  const past = (pastData?.rows || []) as EventRow[];
  const filtered = filter === "all" ? upcoming : upcoming.filter((e) => e.type === filter);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t.events_page.filter_all },
    { id: "lecture", label: t.events_page.filter_lecture },
    { id: "workshop", label: t.events_page.filter_workshop },
    { id: "meetup", label: t.events_page.filter_meetup },
    { id: "evening", label: t.events_page.filter_evening },
  ];

  return (
    <div style={{ background: "#FDFBF7" }} className="min-h-screen">
      <CompactPageHeader
        label={isEn ? "Events Calendar" : "לוח אירועים"}
        title={isEn ? "Upcoming Events" : "אירועים קרובים"}
        subtitle={isEn ? "Open lectures, workshops and meetups" : "הרצאות, סדנאות ומפגשים פתוחים לקהל הרחב"}
      />

      <section className="py-10 md:py-14 px-6 max-w-6xl mx-auto">
        <div className="flex gap-2 overflow-x-auto py-2 -mx-6 px-6 md:justify-center">
          {filters.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm transition ${
                filter === f.id ? "bg-[#461C5B] text-white" : "bg-white border border-[#E0D8CC] text-[#4A3D30] hover:border-[#BA9B78]"
              }`}>{f.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-[#A0907A] py-16">{upcoming.length === 0 ? pick("events.empty", t.events_home.no_events) : t.events_page.empty}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {filtered.map((e) => <EventCard key={e.id} event={e} onRegister={setSelected} />)}
          </div>
        )}

        <div className="mt-12 text-center">
          <button onClick={() => setShowPast((v) => !v)} className="text-sm text-[#BA9B78] hover:underline">
            {showPast ? t.events_page.hide_past : t.events_page.show_past}
          </button>
        </div>

        {showPast && past.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 opacity-70">
            {past.map((e) => <EventCard key={e.id} event={e} onRegister={() => {}} />)}
          </div>
        )}
      </section>

      <CTABand
        title={pick("events.cta.title", t.final_cta.heading)}
        sub={pick("events.cta.sub", t.final_cta.sub)}
        primaryLabel={t.final_cta.cta}
        whatsappLabel={t.final_cta.whatsapp}
        variant="purple"
        context={{ type: "event", source: "events" }}
      />


      {selected && <RegistrationModal event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
