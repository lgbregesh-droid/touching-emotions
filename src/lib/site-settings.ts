import { useSiteSettings as useSiteSettingsBase } from "@/hooks/use-cms";

export { useSiteSettingsBase as useSiteSettings };

/**
 * Build a wa.me link from a phone number (any format) and optional message.
 * Returns empty string if number is falsy/invalid so callers can hide the link.
 */
export function buildWhatsAppLink(number: string | null | undefined, message?: string): string {
  if (!number) return "";
  const digits = number.replace(/\D/g, "");
  if (!digits) return "";
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Build a mailto link, returns "" if email missing */
export function buildMailto(email: string | null | undefined): string {
  return email ? `mailto:${email}` : "";
}

/** Hook returning a single setting value with fallback */
export function useSetting(key: string, fallback = ""): string {
  const { data } = useSiteSettingsBase();
  return data?.[key] || fallback;
}
