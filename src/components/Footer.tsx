import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import logo from "@/assets/logo.png";

export function Footer() {
  const { t } = useLanguage();
  const navLinks = [
    { to: "/", label: t.nav.home },
    { to: "/about", label: t.nav.about },
    { to: "/workshops", label: t.nav.workshops },
    { to: "/shop", label: t.nav.shop },
    { to: "/donations", label: t.nav.donations },
    { to: "/volunteers", label: t.nav.volunteers },
    { to: "/gallery", label: t.nav.gallery },
    { to: "/contact", label: t.nav.contact },
  ];
  const legalLinks = [
    { to: "/privacy", label: "מדיניות פרטיות" },
    { to: "/terms", label: "תנאי שימוש" },
    { to: "/accessibility", label: "הצהרת נגישות" },
    { to: "/cookies", label: "מדיניות עוגיות" },
    { to: "/disclaimer", label: "דיסקליימר" },
  ];
  return (
    <footer className="relative bg-[#2D1B3D] text-[#F5F0E8] mt-0">
      <div className="shimmer-line" />
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 md:py-20">
        <div className="grid md:grid-cols-4 gap-10 md:gap-12">
          <div className="space-y-4">
            <img src={logo} alt="לגעת ברגש" className="h-14 w-auto brightness-0 invert" />
            <p className="text-sm text-[#F5F0E8]/50 tracking-wide">{t.footer.tagline}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#F5F0E8]/40 uppercase tracking-wider mb-1">מידע משפטי</p>
            {legalLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-xs text-[#F5F0E8]/40 uppercase tracking-wider mb-1">צרו קשר</p>
            <p className="text-[#F5F0E8]/55">
              <a href="mailto:l.g.bregesh@gmail.com" className="hover:text-[#BA9B78] transition-colors">l.g.bregesh@gmail.com</a>
            </p>
            <p>
              <a href="https://www.facebook.com/share/17ZD8v1ADv/" target="_blank" rel="noreferrer noopener" className="text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors">Facebook</a>
            </p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-[#BA9B78]/20 text-center text-xs text-[#F5F0E8]/35 tracking-wide">
          {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
