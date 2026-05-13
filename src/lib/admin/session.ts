// Client-safe helpers for admin session storage.
const KEY = "lgbr_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem(KEY);
  if (!t) return null;
  const [expStr] = t.split(".");
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) {
    localStorage.removeItem(KEY);
    return null;
  }
  return t;
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, token);
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function isAdminAuthed(): boolean {
  return !!getAdminToken();
}
