import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell, AdminCard } from "@/components/admin/AdminShell";
import { getDashboard } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { Mail, Heart, Calendar, Users, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/")({
  head: () => ({ meta: [{ title: "לוח בקרה | ניהול" }] }),
  component: Dashboard,
});

const kindLabel: Record<string, string> = {
  inquiry: "פנייה",
  volunteer: "מתנדב/ת",
  order: "הזמנה",
  donation: "תרומה",
};
const kindColor: Record<string, string> = {
  inquiry: "bg-orange-100 text-orange-800",
  volunteer: "bg-purple-100 text-purple-800",
  order: "bg-blue-100 text-blue-800",
  donation: "bg-pink-100 text-pink-800",
};
const kindLink: Record<string, string> = {
  inquiry: "/admin/inquiries",
  volunteer: "/admin/inquiries",
  order: "/admin/shop",
  donation: "/admin/donations",
};

function Dashboard() {
  const fn = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fn({ data: { token: getAdminToken()! } }),
  });

  return (
    <AdminShell title="לוח בקרה">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard icon={Mail} label="פניות חדשות שלא טופלו" value={data?.newInquiries ?? "—"} to="/admin/inquiries" />
        <SummaryCard icon={Users} label="מתנדבים חדשים השבוע" value={data?.newVolunteers ?? "—"} to="/admin/inquiries" />
        <SummaryCard icon={Heart} label="תרומות החודש" value={data ? `₪${data.donationTotal.toLocaleString()}` : "—"} to="/admin/donations" />
        <SummaryCard
          icon={Calendar}
          label="הסדנה הקרובה"
          value={data?.nextWorkshop ? `${data.nextWorkshop.name_he} · ${data.nextWorkshop.date}` : "אין"}
          to="/admin/workshops"
        />
      </div>

      <AdminCard>
        <h2 className="text-lg font-light text-[#2D1B3D] mb-4">פעילות אחרונה</h2>
        {isLoading ? (
          <div className="text-sm text-[#A0907A]">טוען...</div>
        ) : !data?.activity?.length ? (
          <div className="text-sm text-[#A0907A]">אין עדיין פעילות.</div>
        ) : (
          <div className="divide-y divide-[#E0D8CC]">
            {data.activity.map((a) => (
              <Link key={`${a.kind}-${a.id}`} to={kindLink[a.kind]} className="flex items-center justify-between py-3 hover:bg-[#F5F0E8]/40 px-2 -mx-2 rounded">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${kindColor[a.kind]}`}>{kindLabel[a.kind]}</span>
                  <span className="text-sm text-[#2D1B3D] truncate">{a.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#A0907A]">
                  <span>{new Date(a.date).toLocaleDateString("he-IL")}</span>
                  <span className="bg-[#EDE6DC] px-2 py-0.5 rounded">{a.status || "—"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}

function SummaryCard({ icon: Icon, label, value, to }: { icon: typeof Mail; label: string; value: string | number; to: string }) {
  return (
    <Link to={to}>
      <AdminCard className="hover:shadow-md transition cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-[#A0907A] mb-2">{label}</div>
            <div className="text-2xl font-light text-[#2D1B3D]">{value}</div>
          </div>
          <Icon className="w-6 h-6 text-[#BA9B78]" />
        </div>
      </AdminCard>
    </Link>
  );
}

void ShoppingBag;
