// Calendar helpers — Google Calendar URL + ICS file download.
// No external APIs, no OAuth. Works for Apple/Outlook/Google/phone calendars.

export type CalendarEvent = {
  id?: string;
  title: string;
  description?: string | null;
  date: string;            // YYYY-MM-DD
  startTime?: string | null; // HH:mm[:ss]
  endTime?: string | null;   // HH:mm[:ss]
  location?: string | null;
  onlineLink?: string | null;
  url?: string | null;
};

const DEFAULT_DURATION_MIN = 90;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Returns { startUTC, endUTC } as Date objects. */
function resolveTimes(e: CalendarEvent) {
  const [y, m, d] = e.date.split("-").map(Number);
  const [sh = 9, sm = 0] = (e.startTime || "09:00").split(":").map(Number);
  // Treat input as Israel local time (UTC+2/+3). Use Date constructor which
  // interprets values in the runtime TZ — fine for client. For consistent
  // behavior we build an ISO string and let Date parse it.
  const start = new Date(`${e.date}T${pad(sh)}:${pad(sm)}:00`);
  let end: Date;
  if (e.endTime) {
    const [eh, em = 0] = e.endTime.split(":").map(Number);
    end = new Date(`${e.date}T${pad(eh)}:${pad(em)}:00`);
    if (end <= start) end = new Date(start.getTime() + DEFAULT_DURATION_MIN * 60_000);
  } else {
    end = new Date(start.getTime() + DEFAULT_DURATION_MIN * 60_000);
  }
  void y; void m; void d;
  return { start, end };
}

function toGoogleStamp(d: Date) {
  // YYYYMMDDTHHmmssZ (UTC)
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function buildDescription(e: CalendarEvent) {
  const parts: string[] = [];
  if (e.description) parts.push(e.description);
  if (e.onlineLink) parts.push(`קישור למפגש: ${e.onlineLink}`);
  if (e.url) parts.push(e.url);
  return parts.join("\n\n");
}

function buildLocation(e: CalendarEvent) {
  if (e.location && e.onlineLink) return `${e.location} · ${e.onlineLink}`;
  return e.location || e.onlineLink || "";
}

export function googleCalendarUrl(e: CalendarEvent) {
  const { start, end } = resolveTimes(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${toGoogleStamp(start)}/${toGoogleStamp(end)}`,
    details: buildDescription(e),
    location: buildLocation(e),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line: string) {
  // RFC 5545 line folding at 75 octets. Simple char-based fold is fine for UTF-8.
  if (line.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + 73);
    out.push(i === 0 ? chunk : " " + chunk);
    i += 73;
  }
  return out.join("\r\n");
}

export function buildIcs(e: CalendarEvent) {
  const { start, end } = resolveTimes(e);
  const uid = `${e.id || crypto.randomUUID?.() || Math.random().toString(36).slice(2)}@lagaat-baregesh`;
  const now = toGoogleStamp(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lagaat Baregesh//Events//HE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toGoogleStamp(start)}`,
    `DTEND:${toGoogleStamp(end)}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(buildDescription(e))}`,
    `LOCATION:${escapeIcs(buildLocation(e))}`,
  ];
  if (e.onlineLink) lines.push(`URL:${escapeIcs(e.onlineLink)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[\s\u00A0]+/g, "-")
    .replace(/[^a-z0-9\u0590-\u05FF-]/g, "")
    .slice(0, 60) || "event";
}

export function downloadIcs(e: CalendarEvent) {
  const ics = buildIcs(e);
  // BOM helps some Windows clients display Hebrew correctly.
  const blob = new Blob(["\uFEFF" + ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lagaat-baregesh-${slugify(e.title)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Lightweight analytics hook — no-op if no tracker is wired. */
export function trackCalendar(event: "calendar_google_clicked" | "calendar_ics_downloaded" | "event_registration_submitted", payload?: Record<string, unknown>) {
  try {
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
    if (typeof w.gtag === "function") w.gtag("event", event, payload || {});
    else if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...(payload || {}) });
  } catch {
    /* ignore */
  }
}
