// Helpers for building contextual CTA links into the contact form
// and contextual WhatsApp messages. Keeps behavior consistent everywhere.

import { buildWhatsAppLink } from "@/lib/site-settings";

export type CtaType =
  | "workshop"
  | "lecture"
  | "support_item"
  | "donation"
  | "volunteer"
  | "event"
  | "general";

export type CtaContext = {
  type: CtaType;
  itemId?: string | null;
  itemTitle?: string | null;
  source?: string | null;
};

export const INQUIRY_TYPE_HE: Record<CtaType, string> = {
  workshop: "הזמנת סדנה",
  lecture: "הרצאה / מפגש",
  support_item: "תמיכה בעשייה",
  donation: "תרומה",
  volunteer: "התנדבות",
  event: "הרשמה לאירוע",
  general: "שאלה כללית",
};

export function buildContactMessage(ctx: CtaContext): string {
  const title = ctx.itemTitle?.trim();
  switch (ctx.type) {
    case "workshop":
      return title
        ? `שלום, אשמח לקבל פרטים על הסדנה: ${title}.`
        : "שלום, אשמח לקבל פרטים על סדנה.";
    case "lecture":
      return title
        ? `שלום, אשמח לקבל פרטים על ההרצאה / המפגש: ${title}.`
        : "שלום, אשמח לקבל פרטים על הרצאה / מפגש.";
    case "support_item":
      return title
        ? `שלום, אשמח לקבל פרטים על הפריט לתמיכה בעשייה: ${title}.`
        : "שלום, אשמח לקבל פרטים על אפשרויות תמיכה בעשייה.";
    case "donation":
      return "שלום, אשמח לקבל פרטים על אפשרויות תרומה.";
    case "volunteer":
      return "שלום, אשמח לקבל פרטים על אפשרות להתנדבות.";
    case "event":
      return title
        ? `שלום, אשמח לקבל פרטים על האירוע: ${title}.`
        : "שלום, אשמח לקבל פרטים על אירוע קרוב.";
    default:
      return "";
  }
}

export function buildContactUrl(ctx: CtaContext): string {
  const params = new URLSearchParams();
  params.set("type", ctx.type);
  if (ctx.itemId) params.set("itemId", String(ctx.itemId));
  if (ctx.itemTitle) params.set("itemTitle", ctx.itemTitle);
  if (ctx.source) params.set("source", ctx.source);
  return `/contact?${params.toString()}`;
}

export function buildContextWhatsApp(
  whatsappNumber: string | null | undefined,
  ctx: CtaContext,
): string {
  const msg = buildContactMessage(ctx);
  return buildWhatsAppLink(whatsappNumber, msg);
}

export function contextNoticeText(ctx: CtaContext): string {
  const title = ctx.itemTitle?.trim();
  switch (ctx.type) {
    case "workshop":
      return title ? `הגעת מטופס התעניינות בסדנה: ${title}` : "הגעת מהתעניינות בסדנאות";
    case "lecture":
      return title ? `הגעת מהתעניינות בהרצאה / מפגש: ${title}` : "הגעת מהתעניינות בהרצאות";
    case "support_item":
      return title ? `הגעת מהתעניינות בתמיכה בעשייה: ${title}` : "הגעת מהתעניינות בתמיכה בעשייה";
    case "donation":
      return "הגעת מהתעניינות בתרומה";
    case "volunteer":
      return "הגעת מהתעניינות בהתנדבות";
    case "event":
      return title ? `הגעת מהתעניינות באירוע: ${title}` : "הגעת מהתעניינות באירועים";
    default:
      return "";
  }
}

export function isCtaType(v: unknown): v is CtaType {
  return (
    typeof v === "string" &&
    ["workshop", "lecture", "support_item", "donation", "volunteer", "event", "general"].includes(v)
  );
}
