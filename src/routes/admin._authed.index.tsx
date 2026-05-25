import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { getDashboard } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { Linkedin, Calendar, Image as ImageIcon, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/")({
  head: () => ({ meta: [{ title: "לוח בקרה | ניהול" }] }),
  component: Dashboard,
});

function timeAgo(iso: string) {
  const diff = Date.now() - +new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} ד׳`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש׳`;
  const d = Math.floor(h / 24);
  return `לפני ${d} ימים`;
}

const monthsHe = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"];

function Skeleton({ h = 80 }: { h?: number }) {
  return <div className="bg-gradient-to-r from-[#EDE6DC] via-[#F5F0E8] to-[#EDE6DC] animate-pulse rounded-xl" style={{ height: h }} />;
}

function aiIcon(ai?: string | null, urgency?: string | null) {
  if (ai === "failed") return <span title="ניתוח AI נכשל" className="text-red-600 text-[13px]">⚠️</span>;
  if (ai === "pending") return <span className="text-[13px]">⏳</span>;
  if (ai === "completed") {
    if (urgency === "דורשת מענה מהיר") return <span className="text-[13px]">🔴</span>;
    if (urgency === "חשובה") return <span className="text-[13px]">🟡</span>;
    return <span className="text-[13px]">✨</span>;
  }
  return null;
}
function emailIcon(s?: string | null) {
  if (s === "sent") return <span className="text-green-600 text-[13px]">✉️</span>;
  if (s === "failed") return <span title="מייל לא נשלח" className="text-red-600 text-[13px]">⚠️</span>;
  if (s === "pending") return <span className="text-gray-400 text-[13px]">⏳</span>;
  return null;
}

const dotColor: Record<string, string> = {
  contact: "#BA9B78",
  volunteer: "#4E8C85",
  registration: "#2D1B3D",
  active_volunteer: "#4E8C85",
  order: "#BA9B78",
  linkedin: "#6B3FA0",
};

const kindRoute: Record<string, string> = {
  contact: "/admin/inquiries",
  volunteer: "/admin/inquiries",
  registration: "/admin/events",
  active_volunteer: "/admin/volunteers",
  order: "/admin/shop",
  linkedin: "/admin/linkedin",
};

function Dashboard() {
  const fn = useServerFn(getDashboard);
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-v2"],
    queryFn: () => fn({ data: { token: getAdminToken()! } }),
  });

  const stats = data?.stats;
  const urgent = (data?.urgent || []).filter(Boolean) as Array<{ id: string; name: string; inquiry_type: string; urgency_level: string; short_summary: string; created_at: string }>;
  const ne = data?.nextEvent;
  const last = data?.lastLinkedin;

  return (
    <AdminShell title="לוח בקרה">
      <div className="max-w-[900px] mx-auto">
        {/* Urgent */}
        {urgent.length > 0 && (
          <section className="bg-white rounded-xl p-4 mb-4" style={{ borderRight: "3px solid #C4622D", border: "0.5px solid #E0D8CC", borderRight: "3px solid #C4622D" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-[#2D1B3D]">🔴 דורשות טיפול עכשיו</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fef3e2", color: "#b45309" }}>{urgent.length}</span>
            </div>
            <div className="divide-y divide-[#E0D8CC]">
              {urgent.map((u) => (
                <Link key={u.id} to="/admin/inquiries" className="flex items-start gap-3 py-2 hover:bg-[#fef9f0] -mx-2 px-2 rounded cursor-pointer">
                  <span className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={u.urgency_level === "דורשת מענה מהיר" ? { backgroundColor: "#fef3e2", color: "#C4622D" } : { backgroundColor: "#fef9e7", color: "#b45309" }}>
                    {u.urgency_level === "דורשת מענה מהיר" ? "דחוף" : "חשוב"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#2D1B3D] truncate">{u.name} · {(u.inquiry_type || "").slice(0, 40)}</div>
                    {u.short_summary && <div className="text-[11px] text-[#A0907A] truncate">AI: {u.short_summary}</div>}
                  </div>
                  <span className="text-[11px] text-[#A0907A] whitespace-nowrap">{timeAgo(u.created_at)}</span>
                  <span className="text-[12px] text-[#BA9B78] whitespace-nowrap">טפל ↗</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        <h2 className="text-[13px] font-semibold text-[#2D1B3D] mt-5 mb-2.5">סקירה מהירה</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {isLoading ? (
            <><Skeleton /><Skeleton /><Skeleton /><Skeleton /></>
          ) : (
            <>
              <StatCard to="/admin/inquiries" value={stats?.pendingContacts ?? 0} valueColor={(stats?.pendingContacts ?? 0) > 0 ? "#C4622D" : "#2D1B3D"} badge="● לא טופלו" badgeBg="#fef3e2" badgeColor="#b45309" label="פניות חדשות" />
              <StatCard to="/admin/inquiries" value={stats?.newVolunteers ?? 0} valueColor="#2D1B3D" badge="● השבוע" badgeBg="#f0fdf4" badgeColor="#166534" label="מתנדבים נרשמו" />
              <StatCard to="/admin/shop" value={stats?.pendingOrders ?? 0} valueColor="#2D1B3D" badge="● ממתינות" badgeBg="#f0f9ff" badgeColor="#0369a1" label="הזמנות ממתינות" />
              <StatCard to="/admin/events" value={stats?.upcomingEvents ?? 0} valueColor="#2D1B3D" badge="● קרובים" badgeBg="#EDE6DC" badgeColor="#A0907A" label="אירועים קרובים" />
            </>
          )}
        </div>

        {/* Next event */}
        <h2 className="text-[13px] font-semibold text-[#2D1B3D] mt-5 mb-2.5">האירוע הקרוב הבא</h2>
        {isLoading ? <Skeleton h={80} /> : ne ? (
          <div className="bg-white rounded-xl p-[14px_16px] flex items-center gap-4" style={{ border: "0.5px solid #E0D8CC" }}>
            <div className="text-center flex-shrink-0">
              <div className="text-[28px] font-light text-[#2D1B3D] leading-none">{new Date(ne.date).getDate()}</div>
              <div className="text-[11px] text-[#A0907A] mt-1">{monthsHe[new Date(ne.date).getMonth()]}</div>
            </div>
            <div className="w-px h-12 bg-[#E0D8CC]" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-[#2D1B3D] truncate">{ne.title_he}</div>
              <div className="text-[12px] text-[#A0907A] truncate">🕐 {ne.time?.slice(0, 5)} {ne.location_he && <>· 📍 {ne.location_he}</>}</div>
            </div>
            <div className="text-left flex-shrink-0">
              {ne.max_spots > 0 && (
                <>
                  <div className="text-[12px]" style={{ color: (ne.max_spots - ne.spots_remaining) / ne.max_spots > 0.8 ? "#BA9B78" : "#A0907A" }}>
                    {ne.max_spots - ne.spots_remaining} נרשמו
                  </div>
                  <div className="text-[10px] text-[#A0907A]">מתוך {ne.max_spots}</div>
                </>
              )}
              <Link to="/admin/events" className="text-[12px] text-[#BA9B78] hover:underline">נהל ↗</Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#F5F0E8] rounded-xl p-[14px_16px] text-center">
            <div className="text-[#A0907A] text-sm mb-2">אין אירועים קרובים</div>
            <Link to="/admin/events" className="inline-block px-4 py-2 rounded-md border border-[#BA9B78] text-[#BA9B78] text-sm">הוסף אירוע ראשון</Link>
          </div>
        )}

        {/* Quick actions */}
        <h2 className="text-[13px] font-semibold text-[#2D1B3D] mt-5 mb-2.5">פעולות מהירות</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction onClick={() => nav({ to: "/admin/linkedin", search: { new: "1" } as never })} icon={<Linkedin className="w-5 h-5" />} label="צור פוסט לינקדאין" />
          <QuickAction onClick={() => nav({ to: "/admin/events", search: { new: "1" } as never })} icon={<Calendar className="w-5 h-5" />} label="הוסף אירוע" />
          <QuickAction onClick={() => nav({ to: "/admin/gallery" })} icon={<ImageIcon className="w-5 h-5" />} label="העלה לגלריה" />
          <QuickAction onClick={() => nav({ to: "/admin/volunteers", search: { new: "1" } as never })} icon={<UserPlus className="w-5 h-5" />} label="הוסף מתנדב" />
        </div>

        {/* Activity */}
        <h2 className="text-[13px] font-semibold text-[#2D1B3D] mt-5 mb-2.5">פעילות אחרונה</h2>
        <div className="bg-white rounded-xl p-3" style={{ border: "0.5px solid #E0D8CC" }}>
          {isLoading ? <Skeleton h={200} /> : !data?.activity?.length ? (
            <div className="text-sm text-[#A0907A] text-center py-4">אין עדיין פעילות.</div>
          ) : (
            data.activity.map((a, i) => (
              <Link key={`${a.kind}-${a.id}-${i}`} to={kindRoute[a.kind] || "/admin"} className="flex items-start gap-2.5 py-[9px] border-b border-[#E0D8CC] last:border-b-0 cursor-pointer hover:bg-[#F5F0E8] -mx-1 px-1 rounded">
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: dotColor[a.kind] || "#A0907A" }} />
                <div className="flex-1 min-w-0 text-[12px] text-[#2D1B3D] truncate">{a.title}</div>
                {aiIcon(a.ai_status, a.urgency)}
                {emailIcon(a.email_status)}
                <span className="text-[11px] text-[#A0907A] whitespace-nowrap">{timeAgo(a.date)}</span>
              </Link>
            ))
          )}
        </div>

        {/* LinkedIn last */}
        <h2 className="text-[13px] font-semibold text-[#2D1B3D] mt-5 mb-2.5">לינקדאין — פוסט אחרון</h2>
        {isLoading ? <Skeleton h={70} /> : last ? (
          <div className="bg-white rounded-xl p-[12px_16px] flex items-center gap-3" style={{ border: "0.5px solid #E0D8CC" }}>
            <span className="text-xl">💼</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-[#2D1B3D] truncate">{(last.final_text_he || last.final_text_en || last.topic || "—").slice(0, 60)}</div>
              <div className="text-[11px] text-[#A0907A]">
                {last.linkedin_status === "published" && last.published_at ? `פורסם ${timeAgo(last.published_at)} · ${last.published_language === "en" ? "English" : "עברית"}` : "טיוטה"}
                <span className={`mr-2 text-[10px] px-2 py-0.5 rounded-full ${last.linkedin_status === "published" ? "bg-green-100 text-green-800" : last.linkedin_status === "failed" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"}`}>
                  {last.linkedin_status === "published" ? "פורסם" : last.linkedin_status === "failed" ? "נכשל" : "טיוטה"}
                </span>
              </div>
            </div>
            <Link to="/admin/linkedin" className="text-[11px] text-[#BA9B78] whitespace-nowrap hover:underline">פוסט חדש ↗</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-[12px_16px] flex items-center justify-between" style={{ border: "0.5px solid #E0D8CC" }}>
            <span className="text-[12px] text-[#A0907A]">עדיין לא פורסמו פוסטים</span>
            <Link to="/admin/linkedin" className="text-[11px] text-[#BA9B78] hover:underline">צור פוסט ראשון ↗</Link>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({ to, value, valueColor, badge, badgeBg, badgeColor, label }: { to: string; value: number; valueColor: string; badge: string; badgeBg: string; badgeColor: string; label: string }) {
  return (
    <Link to={to} className="bg-white rounded-xl p-[14px_16px] block transition hover:-translate-y-0.5" style={{ border: "0.5px solid #E0D8CC" }}>
      <div className="flex items-start justify-between mb-1">
        <span className="text-2xl font-light" style={{ color: valueColor }}>{value}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: badgeBg, color: badgeColor }}>{badge}</span>
      </div>
      <div className="text-[11px] text-[#A0907A]">{label}</div>
    </Link>
  );
}

function QuickAction({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="bg-[#F5F0E8] hover:bg-[#EDE6DC] rounded-[10px] p-[14px_12px] text-center transition flex flex-col items-center gap-1.5" style={{ border: "0.5px solid #E0D8CC" }}>
      <span className="text-[#2D1B3D]">{icon}</span>
      <span className="text-[12px] text-[#2D1B3D]">{label}</span>
    </button>
  );
}
