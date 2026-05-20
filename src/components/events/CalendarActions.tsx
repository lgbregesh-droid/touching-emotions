import { CalendarPlus, Download } from "lucide-react";
import { googleCalendarUrl, downloadIcs, trackCalendar, type CalendarEvent } from "@/lib/calendar";

type Size = "sm" | "md";

export function CalendarActions({
  event,
  size = "sm",
  variant = "outline",
  className = "",
}: {
  event: CalendarEvent;
  size?: Size;
  variant?: "outline" | "solid";
  className?: string;
}) {
  const base =
    size === "sm"
      ? "text-[11px] px-2.5 py-1 gap-1"
      : "text-sm px-4 py-2 gap-1.5";
  const iconSize = size === "sm" ? 12 : 14;

  const outlineCls =
    "inline-flex items-center rounded-full border border-[#BA9B78] text-[#461C5B] hover:bg-[#461C5B] hover:text-white hover:border-[#461C5B] transition";
  const solidCls =
    "inline-flex items-center rounded-full bg-[#461C5B] text-white hover:bg-[#5a2476] transition";

  const cls = `${variant === "solid" ? solidCls : outlineCls} ${base} ${className}`;

  const onGoogle = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    trackCalendar("calendar_google_clicked", { id: event.id, title: event.title });
  };
  const onIcs = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    trackCalendar("calendar_ics_downloaded", { id: event.id, title: event.title });
    downloadIcs(event);
  };

  return (
    <div className={`flex flex-wrap gap-1.5`}>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onGoogle}
        className={cls}
        aria-label="הוספה ליומן Google"
      >
        <CalendarPlus size={iconSize} aria-hidden />
        <span>הוספה ליומן Google</span>
      </a>
      <button type="button" onClick={onIcs} className={cls} aria-label="הורדת קובץ יומן">
        <Download size={iconSize} aria-hidden />
        <span>הורדת קובץ יומן</span>
      </button>
    </div>
  );
}
