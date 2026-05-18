import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/i18n/LanguageContext";
import { listUpcomingEvents } from "@/lib/events.functions";
import { EventCard, type EventRow } from "@/components/events/EventCard";
import { RegistrationModal } from "@/components/events/RegistrationModal";

export function EventsHomeSection() {
  const { t } = useLanguage();
  const fn = useServerFn(listUpcomingEvents);
  const [selected, setSelected] = useState<EventRow | null>(null);

  const { data } = useQuery({
    queryKey: ["events", "upcoming", "home"],
    queryFn: () => fn({ data: { limit: 3 } }),
  });
  const events = (data?.rows || []) as EventRow[];

  return (
    <section className="relative py-12 md:py-16 px-6" style={{ background: "linear-gradient(135deg, #F0F5F3 70%, rgba(78,140,133,0.10) 100%)" }}>
      <div className="absolute top-0 inset-x-0 h-[1.5px]" style={{ background: "linear-gradient(90deg, transparent, rgba(78,140,133,0.35), rgba(186,155,120,0.25), transparent)" }} />
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="text-xs uppercase text-[#A0907A] text-center mb-2" style={{ letterSpacing: "0.08em" }}>— {t.events_home.label} —</p>
          <h2 className="text-2xl md:text-3xl text-[#2D1B3D] text-center font-light mb-8">{t.events_home.heading}</h2>
        </Reveal>

        {events.length === 0 ? (
          <div className="text-center text-[#A0907A] py-6">{t.events_home.no_events}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {events.map((e) => (
              <Reveal key={e.id}>
                <EventCard event={e} onRegister={setSelected} compact />
              </Reveal>
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <Link to="/events" className="text-sm text-[#BA9B78] hover:underline">{t.events_home.view_all} ←</Link>
        </div>
      </div>

      {selected && <RegistrationModal event={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
