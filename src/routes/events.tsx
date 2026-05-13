import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Reveal } from "@/components/Reveal";
import { listUpcomingEvents, listPastEvents } from "@/lib/events.functions";
import { EventCard, type EventRow } from "@/components/events/EventCard";
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
  const { t } = useLanguage();
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
    <div className="bg-[#F5F0E8] min-h-screen">
      <div className="h-[1.5px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(78,140,133,0.35), rgba(186,155,120,0.25), transparent)" }} />
      <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
        <Reveal>
          <p className="text-xs uppercase text-[#A0907A] text-center mb-3" style={{ letterSpacing: "0.08em" }}>— {t.events_page.label} —</p>
          <h1 className="text-4xl md:text-5xl font-light text-[#2D1B3D] text-center mb-4">{t.events_page.heading}</h1>
          <p className="text-center text-[#4A3D30] max-w-2xl mx-auto leading-relaxed">{t.events_page.sub}</p>
        </Reveal>

        <div className="flex gap-2 overflow-x-auto py-6 mt-8 -mx-6 px-6 md:justify-center">
          {filters.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm transition ${
                filter === f.id ? "bg-[#2D1B3D] text-white" : "border border-[#E0D8CC] text-[#A0907A] hover:text-[#2D1B3D]"
              }`}>{f.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-[#A0907A] py-16">{upcoming.length === 0 ? t.events_home.no_events : t.events_page.empty}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
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

      {selected && <RegistrationModal event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
