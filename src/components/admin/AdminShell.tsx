import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Mail, Calendar, ShoppingBag, Heart, FileText, Image, LogOut, Menu, X, Mic, MessageSquare, HelpCircle, Settings, BookOpen, Activity } from "lucide-react";
import { clearAdminToken } from "@/lib/admin/session";

const items = [
  { to: "/admin", label: "לוח בקרה", icon: LayoutDashboard, exact: true },
  { to: "/admin/content", label: "ניהול עמודים", icon: FileText },
  { to: "/admin/knowledge-base", label: "בסיס ידע", icon: BookOpen },
  { to: "/admin/workshops", label: "סדנאות ופעילויות", icon: Calendar },
  { to: "/admin/events", label: "הרצאות, מפגשים ואירועים", icon: Mic },
  { to: "/admin/testimonials", label: "המלצות", icon: MessageSquare },
  { to: "/admin/gallery", label: "גלריה", icon: Image },
  { to: "/admin/support", label: "תמיכה בעשייה", icon: ShoppingBag },
  { to: "/admin/faq", label: "שאלות נפוצות", icon: HelpCircle },
  { to: "/admin/inquiries", label: "פניות וטפסים", icon: Mail },
  { to: "/admin/shop", label: "מוצרים", icon: ShoppingBag },
  { to: "/admin/donations", label: "תרומות", icon: Heart },
  { to: "/admin/integration-logs", label: "יומני אינטגרציות", icon: Activity },
  { to: "/admin/settings", label: "הגדרות אתר", icon: Settings },
];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    clearAdminToken();
    nav({ to: "/admin/login" });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex" dir="rtl">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#2D1B3D] text-[#F5F0E8] flex-col fixed top-0 right-0 bottom-0 z-30">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="text-lg font-light tracking-wider">לגעת ברגש</div>
          <div className="text-xs text-white/50 mt-1">פאנל ניהול</div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {items.map((it) => {
            const Icon = it.icon;
            const active = isActive(it.to, it.exact);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition relative ${
                  active
                    ? "bg-[#BA9B78]/15 text-[#F5F0E8]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && <span className="absolute right-0 top-0 bottom-0 w-1 bg-[#BA9B78]" />}
                <Icon className="w-5 h-5" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside className="absolute top-0 right-0 bottom-0 w-72 bg-[#2D1B3D] text-[#F5F0E8] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="text-lg font-light">פאנל ניהול</div>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 py-2 overflow-y-auto">
              {items.map((it) => {
                const Icon = it.icon;
                const active = isActive(it.to, it.exact);
                return (
                  <Link key={it.to} to={it.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 text-sm ${active ? "bg-[#BA9B78]/15" : "text-white/70"}`}>
                    <Icon className="w-5 h-5" /><span>{it.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:mr-64 flex flex-col min-w-0">
        <header className="bg-[#F5F0E8] border-b border-[#E0D8CC] px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#2D1B3D]" onClick={() => setMobileOpen(true)}><Menu className="w-6 h-6" /></button>
            <h1 className="text-xl md:text-2xl font-light text-[#2D1B3D]">{title}</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-[#2D1B3D] hover:text-[#BA9B78]">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">התנתקות</span>
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-[#E0D8CC] rounded-xl p-5 ${className}`}>{children}</div>;
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button {...props} className={`px-5 py-2 rounded-md bg-[#BA9B78] text-white text-sm hover:bg-[#a78865] disabled:opacity-50 transition ${props.className || ""}`}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button {...props} className={`px-5 py-2 rounded-md border border-[#BA9B78] text-[#BA9B78] text-sm hover:bg-[#BA9B78]/5 disabled:opacity-50 transition ${props.className || ""}`}>
      {children}
    </button>
  );
}
