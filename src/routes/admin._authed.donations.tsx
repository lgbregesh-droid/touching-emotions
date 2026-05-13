import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { AdminShell, AdminCard, SecondaryButton } from "@/components/admin/AdminShell";
import { listDonations } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { ExternalLink, Info } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/donations")({
  head: () => ({ meta: [{ title: "תרומות | ניהול" }] }),
  component: DonationsAdmin,
});

type D = { id: string; created_at: string; donor_name?: string | null; email?: string | null; amount: number; type: "one_time" | "recurring"; status: string };

function DonationsAdmin() {
  const fn = useServerFn(listDonations);
  const { data } = useQuery({ queryKey: ["admin-donations"], queryFn: () => fn({ data: { token: getAdminToken()! } }) });
  const [month, setMonth] = useState<string>("");
  const [type, setType] = useState<"all" | "one_time" | "recurring">("all");

  const filtered = useMemo(() => {
    return ((data?.rows || []) as D[]).filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (month) {
        const d = new Date(r.created_at);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (m !== month) return false;
      }
      return true;
    });
  }, [data, month, type]);

  const exportCSV = () => {
    const lines = [["תאריך", "שם", "מייל", "סכום", "סוג", "סטטוס"].join(",")];
    for (const r of filtered) lines.push([r.created_at, r.donor_name, r.email, r.amount, r.type, r.status].map((x) => `"${(x ?? "").toString().replace(/"/g, '""')}"`).join(","));
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" });
    const u = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = u; a.download = `donations-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(u);
  };

  return (
    <AdminShell title="תרומות">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Stat label="סה״כ החודש" value={`₪${(data?.month ?? 0).toLocaleString()}`} />
        <Stat label="סה״כ השנה" value={`₪${(data?.year ?? 0).toLocaleString()}`} />
        <Stat label="הוראות קבע פעילות" value={String(data?.recurring ?? 0)} />
      </div>

      <div className="bg-[#4E8C85]/10 border border-[#4E8C85]/35 rounded-lg p-4 mb-4 flex items-start gap-3 text-sm text-[#2D1B3D]">
        <Info className="w-5 h-5 text-[#4E8C85] flex-shrink-0 mt-0.5" />
        <div>
          לביטול הוראת קבע, החזרים, או פרטים נוספים — יש להיכנס ל-Stripe Dashboard.
          <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#BA9B78] hover:underline mr-2">
            פתיחת Stripe <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <AdminCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
          <select value={type} onChange={(e) => setType(e.target.value as "all" | "one_time" | "recurring")} className="px-3 py-2 border border-[#E0D8CC] rounded-md text-sm bg-white">
            <option value="all">כל הסוגים</option><option value="one_time">חד פעמי</option><option value="recurring">חוזר</option>
          </select>
          <div className="flex-1" />
          <SecondaryButton onClick={exportCSV}>ייצוא CSV</SecondaryButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-right text-xs text-[#A0907A] border-b border-[#E0D8CC]">
              <th className="py-2 px-2">תאריך</th><th className="py-2 px-2">שם</th><th className="py-2 px-2">מייל</th>
              <th className="py-2 px-2">סכום</th><th className="py-2 px-2">סוג</th><th className="py-2 px-2">סטטוס</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-[#A0907A]">אין תרומות לתצוגה. תרומות יסונכרנו אוטומטית כש-Stripe יחובר.</td></tr>}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#E0D8CC]/60">
                  <td className="py-2 px-2 text-[#A0907A]">{new Date(r.created_at).toLocaleDateString("he-IL")}</td>
                  <td className="py-2 px-2">{r.donor_name || "—"}</td><td className="py-2 px-2">{r.email || "—"}</td>
                  <td className="py-2 px-2">₪{r.amount}</td>
                  <td className="py-2 px-2">{r.type === "recurring" ? "חוזר" : "חד פעמי"}</td>
                  <td className="py-2 px-2"><span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{r.status === "success" ? "הצלחה" : "נכשל"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <AdminCard><div className="text-xs text-[#A0907A] mb-2">{label}</div><div className="text-2xl font-light text-[#2D1B3D]">{value}</div></AdminCard>;
}
