import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

type Settings = {
  fontScale: number; // 1 = 100%
  highContrast: boolean;
  invertColors: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
  highlightFocus: boolean;
  pauseAnimations: boolean;
  largeCursor: boolean;
};

const STORAGE_KEY = "lgr_a11y_v1";

const DEFAULTS: Settings = {
  fontScale: 1,
  highContrast: false,
  invertColors: false,
  grayscale: false,
  underlineLinks: false,
  readableFont: false,
  highlightFocus: false,
  pauseAnimations: false,
  largeCursor: false,
};

function load(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function save(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function apply(s: Settings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.fontSize = `${s.fontScale * 100}%`;

  const body = document.body;
  body.classList.toggle("a11y-high-contrast", s.highContrast);
  body.classList.toggle("a11y-invert", s.invertColors);
  body.classList.toggle("a11y-grayscale", s.grayscale);
  body.classList.toggle("a11y-underline-links", s.underlineLinks);
  body.classList.toggle("a11y-readable-font", s.readableFont);
  body.classList.toggle("a11y-highlight-focus", s.highlightFocus);
  body.classList.toggle("a11y-pause-animations", s.pauseAnimations);
  body.classList.toggle("a11y-large-cursor", s.largeCursor);
}

// Inject required styles once
function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("a11y-widget-styles")) return;
  const style = document.createElement("style");
  style.id = "a11y-widget-styles";
  style.textContent = `
    body.a11y-high-contrast { background: #000 !important; color: #fff !important; }
    body.a11y-high-contrast * { background-color: transparent !important; color: #fff !important; border-color: #fff !important; }
    body.a11y-high-contrast a, body.a11y-high-contrast a * { color: #ffeb3b !important; }
    body.a11y-invert { filter: invert(1) hue-rotate(180deg); }
    body.a11y-invert img, body.a11y-invert video, body.a11y-invert picture { filter: invert(1) hue-rotate(180deg); }
    body.a11y-grayscale { filter: grayscale(1); }
    body.a11y-underline-links a { text-decoration: underline !important; }
    body.a11y-readable-font, body.a11y-readable-font * { font-family: Arial, Helvetica, sans-serif !important; letter-spacing: 0.02em !important; }
    body.a11y-highlight-focus *:focus { outline: 3px solid #ffeb3b !important; outline-offset: 2px !important; }
    body.a11y-pause-animations *, body.a11y-pause-animations *::before, body.a11y-pause-animations *::after {
      animation: none !important; transition: none !important; scroll-behavior: auto !important;
    }
    body.a11y-large-cursor, body.a11y-large-cursor * { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='M4 2 L4 32 L12 24 L18 36 L24 34 L18 22 L30 22 Z' fill='black' stroke='white' stroke-width='2'/></svg>") 4 2, auto !important; }
  `;
  document.head.appendChild(style);
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    ensureStyles();
    const s = load();
    setSettings(s);
    apply(s);
  }, []);

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    save(next);
    apply(next);
  };

  const reset = () => {
    setSettings(DEFAULTS);
    save(DEFAULTS);
    apply(DEFAULTS);
  };

  return (
    <>
      <button
        type="button"
        aria-label="פתיחת תפריט נגישות"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 left-4 z-[95] w-12 h-12 rounded-full bg-[#2D1B3D] hover:bg-[#3d2750] text-white shadow-lg flex items-center justify-center"
      >
        {/* Universal access icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <path
            d="M4 8h16M12 8v5m0 0l-4 8m4-8l4 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <div
          dir="rtl"
          role="dialog"
          aria-label="הגדרות נגישות"
          className="fixed bottom-20 left-4 z-[95] w-[330px] max-h-[75vh] overflow-y-auto rounded-2xl bg-white border border-[#E0D8CC] shadow-2xl p-4 text-right"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-medium text-[#2D1B3D]">נגישות</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="סגירה"
              className="text-[#A0907A] hover:text-[#2D1B3D] text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 text-[13px] text-[#4A3D30]">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-[#A0907A] uppercase tracking-wider">גודל טקסט</span>
                <span className="text-[#A0907A] text-[12px]">{Math.round(settings.fontScale * 100)}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => update({ fontScale: Math.max(0.85, +(settings.fontScale - 0.1).toFixed(2)) })}
                  className="py-2 border border-[#E0D8CC] rounded-lg hover:bg-[#F5F0E8] text-lg font-light"
                  aria-label="הקטנת טקסט"
                >
                  −
                </button>
                <button
                  onClick={() => update({ fontScale: 1 })}
                  className="py-2 border border-[#E0D8CC] rounded-lg hover:bg-[#F5F0E8] text-[12px]"
                >
                  רגיל
                </button>
                <button
                  onClick={() => update({ fontScale: Math.min(1.6, +(settings.fontScale + 0.1).toFixed(2)) })}
                  className="py-2 border border-[#E0D8CC] rounded-lg hover:bg-[#F5F0E8] text-lg font-light"
                  aria-label="הגדלת טקסט"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <div className="text-[12px] text-[#A0907A] uppercase tracking-wider mb-1.5">תצוגה</div>
              <div className="grid grid-cols-2 gap-2">
                <OptionTile label="ניגודיות גבוהה" icon="◐" active={settings.highContrast} onClick={() => update({ highContrast: !settings.highContrast })} />
                <OptionTile label="היפוך צבעים" icon="◑" active={settings.invertColors} onClick={() => update({ invertColors: !settings.invertColors })} />
                <OptionTile label="גווני אפור" icon="◍" active={settings.grayscale} onClick={() => update({ grayscale: !settings.grayscale })} />
                <OptionTile label="הדגשת קישורים" icon="A̲" active={settings.underlineLinks} onClick={() => update({ underlineLinks: !settings.underlineLinks })} />
                <OptionTile label="גופן קריא" icon="Aa" active={settings.readableFont} onClick={() => update({ readableFont: !settings.readableFont })} />
                <OptionTile label="הדגשת מיקוד" icon="⊡" active={settings.highlightFocus} onClick={() => update({ highlightFocus: !settings.highlightFocus })} />
                <OptionTile label="עצירת אנימציות" icon="⏸" active={settings.pauseAnimations} onClick={() => update({ pauseAnimations: !settings.pauseAnimations })} />
                <OptionTile label="סמן מוגדל" icon="➤" active={settings.largeCursor} onClick={() => update({ largeCursor: !settings.largeCursor })} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E0D8CC]">
              <Link to="/accessibility" className="text-[#BA9B78] text-[12px]" onClick={() => setOpen(false)}>
                הצהרת נגישות
              </Link>
              <button
                onClick={reset}
                className="px-3 py-1 text-[12px] rounded-full border border-[#E0D8CC] hover:bg-[#F5F0E8]"
              >
                איפוס
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OptionTile({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-lg border transition-all text-center ${
        active
          ? "bg-[#2D1B3D] border-[#2D1B3D] text-white shadow-sm"
          : "bg-white border-[#E0D8CC] text-[#4A3D30] hover:bg-[#F5F0E8] hover:border-[#BA9B78]"
      }`}
    >
      <span className="text-base leading-none" aria-hidden="true">{icon}</span>
      <span className="text-[11px] leading-tight">{label}</span>
    </button>
  );
}
