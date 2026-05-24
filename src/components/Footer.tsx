import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteSettings } from "@/lib/site-settings";
import logo from "@/assets/logo.png";

export function Footer() {
  const { t } = useLanguage();
  const { data: s } = useSiteSettings();
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
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-2 space-y-2">
            <img src={logo} alt="לגעת ברגש" className="h-10 w-auto brightness-0 invert" />
            <p className="text-xs text-[#F5F0E8]/50 tracking-wide max-w-xs">{t.footer.tagline}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] text-[#F5F0E8]/40 uppercase tracking-wider mb-0.5">ניווט</p>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-xs text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] text-[#F5F0E8]/40 uppercase tracking-wider mb-0.5">משפטי</p>
            {legalLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-xs text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] text-[#F5F0E8]/40 uppercase tracking-wider mb-0.5">צרו קשר</p>
            {s?.address && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`} target="_blank" rel="noreferrer noopener" className="text-xs text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors">{s.address}</a>
            )}
            {s?.email && (
              <a href={`mailto:${s.email}`} className="text-xs text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors break-all">{s.email}</a>
            )}
            {s?.phone && (
              <a href={`tel:${s.phone}`} className="text-xs text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors" dir="ltr">{s.phone}</a>
            )}
            {s?.facebook_url && (
              <a href={s.facebook_url} target="_blank" rel="noreferrer noopener" className="text-xs text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors">Facebook</a>
            )}
            {s?.instagram_url && (
              <a href={s.instagram_url} target="_blank" rel="noreferrer noopener" className="text-xs text-[#F5F0E8]/55 hover:text-[#BA9B78] transition-colors">Instagram</a>
            )}
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-[#BA9B78]/20 text-center text-[10px] text-[#F5F0E8]/35 tracking-wide">
          {s?.footer_text || t.footer.rights}
          {s?.association_number ? ` · ע״ר ${s.association_number}` : ""}
        </div>
      </div>
    </footer>
  );
}
