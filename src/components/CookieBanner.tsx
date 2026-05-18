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
      className="fixed bottom-3 right-3 left-3 md:left-auto md:right-4 z-[90] w-auto md:w-[320px] rounded-xl bg-white border border-[#E0D8CC] shadow-lg p-3 md:p-4 text-right"
    >
      <p className="text-[13px] text-[#4A3D30] leading-relaxed">
        אנו משתמשים בעוגיות לשיפור החוויה. פרטים ב
        <Link to="/cookies" className="text-[#BA9B78] mx-1">מדיניות עוגיות</Link>.
      </p>

      {manage && (
        <div className="mt-3 space-y-1.5 text-[12px] text-[#4A3D30] border-t border-[#E0D8CC] pt-3">
          <label className="flex items-center gap-2 opacity-70">
            <input type="checkbox" checked readOnly />
            עוגיות חיוניות
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            אנליטיקה
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            שיווק
          </label>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 justify-end">
        {!manage ? (
          <button
            onClick={() => setManage(true)}
            className="px-3 py-1.5 rounded-full border border-[#E0D8CC] text-[12px] text-[#4A3D30] hover:bg-[#F5F0E8]"
          >
            בחירה ידנית
          </button>
        ) : (
          <button
            onClick={savePrefs}
            className="px-3 py-1.5 rounded-full border border-[#E0D8CC] text-[12px] text-[#4A3D30] hover:bg-[#F5F0E8]"
          >
            שמירה
          </button>
        )}
        <button
          onClick={acceptAll}
          className="px-4 py-1.5 rounded-full bg-[#BA9B78] hover:bg-[#a98968] text-white text-[12px]"
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
