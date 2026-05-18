import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "lgr_cookie_consent_v1";

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Consent;
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    window.dispatchEvent(new CustomEvent("lgr-consent", { detail: c }));
  } catch {
    /* ignore */
  }
}

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!readConsent()) setShow(true);
  }, []);

  if (!show) return null;

  const acceptAll = () => {
    writeConsent({ essential: true, analytics: true, marketing: true });
    setShow(false);
  };
  const rejectAll = () => {
    writeConsent({ essential: true, analytics: false, marketing: false });
    setShow(false);
  };
  const savePrefs = () => {
    writeConsent({ essential: true, analytics, marketing });
    setShow(false);
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-live="polite"
      aria-label="הודעת עוגיות"
      className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:left-6 z-[90] mx-auto max-w-3xl rounded-2xl bg-white border border-[#E0D8CC] shadow-xl p-5 md:p-6"
    >
      <h2 className="text-base md:text-lg font-medium text-[#2D1B3D] mb-1">
        אנחנו משתמשים בעוגיות 🍪
      </h2>
      <p className="text-sm text-[#4A3D30] leading-relaxed">
        האתר משתמש בעוגיות חיוניות לתפקודו, ובאישורך גם בעוגיות אנליטיקה כדי
        לשפר את החוויה. ניתן לקרוא עוד ב
        <Link to="/cookies" className="text-[#BA9B78] mx-1">מדיניות עוגיות</Link>
        וב
        <Link to="/privacy" className="text-[#BA9B78] mx-1">מדיניות פרטיות</Link>.
      </p>

      {manage && (
        <div className="mt-4 space-y-2 text-sm text-[#4A3D30] border-t border-[#E0D8CC] pt-4">
          <label className="flex items-center gap-2 opacity-70">
            <input type="checkbox" checked readOnly />
            עוגיות חיוניות (תמיד פעילות)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            עוגיות אנליטיקה
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            עוגיות שיווק
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        {!manage && (
          <button
            onClick={() => setManage(true)}
            className="px-4 py-2 rounded-full border border-[#E0D8CC] text-sm text-[#4A3D30] hover:bg-[#F5F0E8]"
          >
            ניהול העדפות
          </button>
        )}
        {manage && (
          <button
            onClick={savePrefs}
            className="px-4 py-2 rounded-full border border-[#E0D8CC] text-sm text-[#4A3D30] hover:bg-[#F5F0E8]"
          >
            שמירת העדפות
          </button>
        )}
        <button
          onClick={rejectAll}
          className="px-4 py-2 rounded-full border border-[#E0D8CC] text-sm text-[#4A3D30] hover:bg-[#F5F0E8]"
        >
          דחייה
        </button>
        <button
          onClick={acceptAll}
          className="px-5 py-2 rounded-full bg-[#BA9B78] hover:bg-[#a98968] text-white text-sm"
        >
          אישור הכל
        </button>
      </div>
    </div>
  );
}

export function getConsent(): Consent | null {
  return readConsent();
}
