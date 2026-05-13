import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import logo from "@/assets/logo.png";

export function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const isHome = loc.pathname === "/";
  const overHero = isHome && !scrolled;

  const items: Array<{ to: string; label: string }> = [
    { to: "/", label: t.nav.home },
    { to: "/about", label: t.nav.about },
    { to: "/workshops", label: t.nav.workshops },
    { to: "/shop", label: t.nav.shop },
    { to: "/donations", label: t.nav.donations },
    { to: "/volunteers", label: t.nav.volunteers },
    { to: "/gallery", label: t.nav.gallery },
    { to: "/contact", label: t.nav.contact },
  ];

  const navBg = overHero
    ? "bg-transparent"
    : "bg-[#F5F0E8]/95 backdrop-blur-md shadow-[0_2px_20px_rgba(45,27,61,0.06)]";
  const linkColor = overHero ? "text-[#F5F0E8]/85 hover:text-white" : "text-[#2D1B3D] hover:text-[#BA9B78]";

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="לגעת ברגש" className={`h-10 md:h-12 w-auto ${overHero ? "brightness-0 invert" : ""} transition`} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {items.map((it) => {
              const active = loc.pathname === it.to;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`text-sm tracking-wide transition-colors ${linkColor} ${
                    active ? "border-b-2 border-[#BA9B78] pb-1" : ""
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setLang(lang === "he" ? "en" : "he")}
              className={`text-xs tracking-widest ${overHero ? "text-[#F5F0E8]/70" : "text-[#A0907A]"} hover:opacity-100`}
            >
              <span className={lang === "en" ? "text-[#BA9B78] font-medium" : ""}>EN</span>
              <span className="mx-2 opacity-40">|</span>
              <span className={lang === "he" ? "text-[#BA9B78] font-medium" : ""}>עב</span>
            </button>
            <Link
              to="/contact"
              className={`px-5 py-2 text-sm rounded-full border transition-colors ${
                overHero
                  ? "border-[#BA9B78]/60 text-[#F5F0E8] hover:bg-[#BA9B78] hover:border-[#BA9B78]"
                  : "border-[#BA9B78] text-[#2D1B3D] hover:bg-[#BA9B78] hover:text-white"
              }`}
            >
              {t.nav.cta}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
            className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-lg backdrop-blur-md border transition-all ${
              scrolled
                ? "bg-[#F5F0E8]/95 border-[#E0D8CC] text-[#2D1B3D]"
                : "bg-[#2D1B3D]/75 border-[#BA9B78]/30 text-[#F5F0E8]"
            }`}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-[#2D1B3D]/45 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute top-0 bottom-0 w-[75vw] max-w-[300px] bg-[#F5F0E8] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            lang === "he"
              ? `right-0 border-l-[3px] border-l-[rgba(78,140,133,0.25)] ${open ? "translate-x-0" : "translate-x-full"}`
              : `left-0 border-r-[3px] border-r-[rgba(78,140,133,0.25)] ${open ? "translate-x-0" : "-translate-x-full"}`
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-[#E0D8CC]">
            <img src={logo} alt="" className="h-10 w-auto" />
            <button onClick={() => setOpen(false)} className="text-[#2D1B3D] p-2"><X size={20} /></button>
          </div>
          <nav className="flex flex-col">
            {items.map((it) => {
              const active = loc.pathname === it.to;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`px-6 py-4 text-base border-b border-[#E0D8CC] ${
                    active
                      ? `text-[#BA9B78] ${lang === "he" ? "border-r-[3px] border-r-[#BA9B78]" : "border-l-[3px] border-l-[#BA9B78]"}`
                      : "text-[#2D1B3D]"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-6 space-y-4">
            <Link
              to="/contact"
              className="block text-center w-full py-3 bg-[#BA9B78] text-white rounded-full text-sm tracking-wide"
            >
              {t.nav.cta}
            </Link>
            <button
              onClick={() => setLang(lang === "he" ? "en" : "he")}
              className="w-full text-center text-xs tracking-widest text-[#A0907A]"
            >
              <span className={lang === "en" ? "text-[#2D1B3D] font-medium" : ""}>EN</span>
              <span className="mx-2 opacity-40">|</span>
              <span className={lang === "he" ? "text-[#2D1B3D] font-medium" : ""}>עב</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
