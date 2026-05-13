import { Clock, MapPin, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export type EventRow = {
  id: string;
  title_he: string;
  title_en: string | null;
  description_he: string | null;
  description_en: string | null;
  type: "lecture" | "workshop" | "meetup" | "evening";
  date: string;
  time: string;
  location_he: string | null;
  location_en: string | null;
  price: number;
  max_spots: number;
  spots_remaining: number;
  status: string;
  image_url: string | null;
};

export function formatDateParts(dateStr: string, lang: "he" | "en") {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const month = d.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { month: "short" });
  const year = d.getFullYear();
  return { day, month, year };
}

export function EventCard({ event, onRegister, compact }: { event: EventRow; onRegister: (e: EventRow) => void; compact?: boolean }) {
  const { lang, t } = useLanguage();
  const title = lang === "en" ? event.title_en || event.title_he : event.title_he;
  const desc = lang === "en" ? event.description_en || event.description_he : event.description_he;
  const loc = lang === "en" ? event.location_en || event.location_he : event.location_he;
  const typeLabel = (t.event_types_he as Record<string, string>)[event.type] || event.type;
  const { day, month, year } = formatDateParts(event.date, lang);
  const isFull = event.spots_remaining <= 0;
  const lowSpots = event.spots_remaining > 0 && event.spots_remaining < 5;
  const time = event.time?.slice(0, 5);

  if (compact) {
    return (
      <div className="bg-white border border-[#E0D8CC] rounded-xl p-5 hover:-translate-y-1 hover:shadow-md transition flex flex-col h-full">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[#BA9B78] text-sm font-medium mb-3 w-fit"
          style={{ background: "rgba(186,155,120,0.08)" }}>
          {day} {month}
        </div>
        <span className="inline-block px-2.5 py-0.5 text-xs rounded-full border w-fit mb-2"
          style={{ borderColor: "rgba(78,140,133,0.4)", color: "#2D1B3D" }}>{typeLabel}</span>
        <h3 className="text-base font-medium text-[#2D1B3D] mb-1">{title}</h3>
        <div className="flex items-center gap-3 text-xs text-[#A0907A] mb-2 flex-wrap">
          {time && <span className="flex items-center gap-1"><Clock size={12} />{time}</span>}
          {loc && <span className="flex items-center gap-1"><MapPin size={12} />{loc}</span>}
        </div>
        {desc && <p className="text-xs text-[#4A3D30] leading-relaxed mb-3 line-clamp-2">{desc}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className={`text-xs ${lowSpots ? "text-[#BA9B78] font-medium" : "text-[#A0907A]"}`}>
            {isFull ? t.events_home.full : `${event.spots_remaining} ${t.events_page.spots_left}`}
          </span>
          <button
            onClick={() => onRegister(event)}
            disabled={isFull}
            className="text-xs px-4 py-1.5 rounded-full border border-[#BA9B78] text-[#BA9B78] hover:bg-[#BA9B78] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.events_home.register}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E0D8CC] rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition grid grid-cols-[auto_1fr] gap-5">
      <div className="text-center min-w-[64px]">
        <div className="text-3xl font-light text-[#2D1B3D] leading-none">{day}</div>
        <div className="text-xs text-[#A0907A] mt-1">{month}</div>
        <div className="text-[11px] text-[#E0D8CC] mt-0.5">{year}</div>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <span className="inline-block px-2.5 py-0.5 text-xs rounded-full border"
            style={{ borderColor: "rgba(78,140,133,0.4)", color: "#2D1B3D" }}>{typeLabel}</span>
          {event.price === 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(78,140,133,0.12)", color: "#4E8C85" }}>{t.events_page.free}</span>}
        </div>
        <h3 className="text-base font-medium text-[#2D1B3D] mb-1">{title}</h3>
        {desc && <p className="text-[13px] text-[#4A3D30] leading-relaxed mb-3 line-clamp-3">{desc}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A0907A] mb-3">
          {time && <span className="flex items-center gap-1"><Clock size={12} />{time}</span>}
          {loc && <span className="flex items-center gap-1"><MapPin size={12} />{loc}</span>}
          <span className="flex items-center gap-1"><Users size={12} />{isFull ? t.events_page.full : `${event.spots_remaining} ${t.events_page.spots_left}`}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">
            {event.price === 0 ? <span className="text-[#4E8C85]">{t.events_page.free}</span> : <span className="text-[#2D1B3D]">₪{event.price}</span>}
          </span>
          {isFull ? (
            <span className="text-xs px-4 py-2 rounded-full bg-gray-100 text-gray-500">{t.events_page.full}</span>
          ) : (
            <button
              onClick={() => onRegister(event)}
              className="text-sm px-5 py-2 rounded-full bg-[#BA9B78] text-white hover:bg-[#a78865] transition"
            >
              {t.events_page.register}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
