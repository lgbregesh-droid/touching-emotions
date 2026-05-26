// Shared form validation utilities
export type ValidationKey =
  | "name_required" | "name_too_short" | "name_invalid"
  | "email_required" | "email_invalid"
  | "phone_required" | "phone_invalid"
  | "message_required" | "message_too_short"
  | "subject_required" | "select_required"
  | "other_field_required" | "checkbox_required";

export const validators = {
  name: (value: string): ValidationKey | null => {
    const v = value.trim();
    if (!v) return "name_required";
    if (v.length < 2) return "name_too_short";
    if (v.length > 60) return "name_invalid";
    if (!/^[\u0590-\u05FFa-zA-Z\s\-']+$/.test(v)) return "name_invalid";
    return null;
  },
  email: (value: string, required = true): ValidationKey | null => {
    const v = value.trim();
    if (!v) return required ? "email_required" : null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "email_invalid";
    return null;
  },
  phone: (value: string, required = true): ValidationKey | null => {
    const v = value.trim();
    if (!v) return required ? "phone_required" : null;
    const digits = v.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 12) return "phone_invalid";
    if (!/^(0[2-9]\d{7,8}|972\d{8,9})$/.test(digits)) return "phone_invalid";
    return null;
  },
  message: (value: string, required = true): ValidationKey | null => {
    const v = value.trim();
    if (!v) return required ? "message_required" : null;
    if (v.length < 10) return "message_too_short";
    return null;
  },
  select: (value: string): ValidationKey | null => {
    if (!value || value === "" || value === "placeholder") return "select_required";
    return null;
  },
  required: (value: string, key: ValidationKey = "subject_required"): ValidationKey | null => {
    if (!value.trim()) return key;
    return null;
  },
};

export function scrollToFirstError(formEl: HTMLFormElement | null) {
  if (!formEl) return;
  const el = formEl.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => el.focus({ preventScroll: true }), 300);
  }
}
