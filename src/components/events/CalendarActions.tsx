import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Download } from "lucide-react";
import { googleCalendarUrl, downloadIcs, trackCalendar, type CalendarEvent } from "@/lib/calendar";

type Size = "sm" | "md";

export function CalendarActions({
  event,
  size = "sm",
  variant = "outline",
  className = "",
  label = "שמירה ליומן",
}: {
  event: CalendarEvent;
  size?: Size;
  variant?: "outline" | "solid";
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const base =
    size === "sm"
      ? "text-[11px] px-2.5 py-1 gap-1"
      : "text-sm px-4 py-2 gap-1.5";
  const iconSize = size === "sm" ? 12 : 14;

  const outlineCls =
    "inline-flex items-center rounded-full border border-[#BA9B78] text-[#461C5B] hover:bg-[#461C5B] hover:text-white hover:border-[#461C5B] transition";
  const solidCls =
    "inline-flex items-center rounded-full bg-[#461C5B] text-white hover:bg-[#5a2476] transition";

  const btnCls = `${variant === "solid" ? solidCls : outlineCls} ${base} ${className}`;

  const onGoogle = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    trackCalendar("calendar_google_clicked", { id: event.id, title: event.title });
    setOpen(false);
  };
  const onIcs = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    trackCalendar("calendar_ics_downloaded", { id: event.id, title: event.title });
    downloadIcs(event);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className={btnCls}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
      >
        <CalendarPlus size={iconSize} aria-hidden />
        <span>{label}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute z-50 mt-1 end-0 min-w-[200px] bg-white border border-[#E0D8CC] rounded-xl shadow-lg p-1 text-right"
        >
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onGoogle}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#2D1B3D] hover:bg-[#F5F0E8] transition"
            role="menuitem"
          >
            <CalendarPlus size={14} className="text-[#BA9B78]" aria-hidden />
            <span>הוספה ליומן Google</span>
          </a>
          <button
            type="button"
            onClick={onIcs}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#2D1B3D] hover:bg-[#F5F0E8] transition"
            role="menuitem"
          >
            <Download size={14} className="text-[#BA9B78]" aria-hidden />
            <span>הורדת קובץ יומן (.ics)</span>
          </button>
        </div>
      )}
    </div>
  );
}
