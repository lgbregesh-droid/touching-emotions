import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { AdminShell, AdminCard, SecondaryButton } from "@/components/admin/AdminShell";
import { listInquiries, setInquiryStatus, deleteInquiry } from "@/lib/admin/data.functions";
import { listActiveVolunteers } from "@/lib/admin/team.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Eye, Trash2, Check, UserPlus } from "lucide-react";
import { AnalysisPanel } from "@/components/admin/AnalysisPanel";

export const Route = createFileRoute("/admin/_authed/inquiries")({
  head: () => ({ meta: [{ title: "פניות וטפסים | ניהול" }] }),
  component: Inquiries,
});

type Row = Record<string, string | null>;

function Inquiries() {
  const [tab, setTab] = useState<"contact" | "volunteer">("contact");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "handled">("all");
  const [open, setOpen] = useState<Row | null>(null);
  const qc = useQueryClient();

  const navigate = useNavigate();
  const listFn = useServerFn(listInquiries);
  const setStatusFn = useServerFn(setInquiryStatus);
  const delFn = useServerFn(deleteInquiry);
  const listVolsFn = useServerFn(listActiveVolunteers);

  const { data } = useQuery({
    queryKey: ["inquiries", tab],
    queryFn: () => listFn({ data: { token: getAdminToken()!, kind: tab } }),
  });

  const { data: volsData } = useQuery({
    queryKey: ["active-volunteers"],
    queryFn: () => listVolsFn({ data: { token: getAdminToken()! } }),
    enabled: tab === "volunteer",
  });
  const linkedSet = useMemo(() => {
    const s = new Set<string>();
    for (const v of (volsData?.rows || []) as Array<{ source_inquiry_id?: string | null }>) {
      if (v.source_inquiry_id) s.add(v.source_inquiry_id);
    }
    return s;
  }, [volsData]);

  const rows = (data?.rows || []) as Row[];
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const hay = `${r.name || ""} ${r.email || ""} ${r.message || ""} ${r.interest || ""}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, statusFilter, search]);

  const toggle = async (r: Row) => {
    const next = r.status === "new" ? "handled" : "new";
    await setStatusFn({ data: { token: getAdminToken()!, kind: tab, id: r.id!, status: next as "new" | "handled" } });
    toast.success("הסטטוס עודכן");
    qc.invalidateQueries({ queryKey: ["inquiries", tab] });
  };

  const remove = async (r: Row) => {
    if (!confirm("למחוק לצמיתות?")) return;
    await delFn({ data: { token: getAdminToken()!, kind: tab, id: r.id! } });
    toast.success("נמחק");
    qc.invalidateQueries({ queryKey: ["inquiries", tab] });
  };

  const exportCSV = () => {
    const headers = tab === "contact"
      ? ["תאריך", "שם", "טלפון", "מייל", "נושא", "הודעה", "סטטוס"]
      : ["תאריך", "שם", "טלפון", "תחום", "מתעניינ/ת ב", "סטטוס"];
    const lines = [headers.join(",")];
    for (const r of filtered) {
      const fields = tab === "contact"
        ? [r.created_at, r.name, r.phone, r.email, r.subject, r.message, r.status]
        : [r.created_at, r.name, r.phone, r.profession, r.interest, r.status];
      lines.push(fields.map((f) => `"${(f || "").toString().replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${tab}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="פניות וטפסים">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setTab("contact")}
          className={`px-4 py-2 rounded-md text-sm ${tab === "contact" ? "bg-[#2D1B3D] text-white" : "bg-white border border-[#E0D8CC] text-[#2D1B3D]"}`}>
          צור קשר
        </button>
        <button onClick={() => setTab("volunteer")}
          className={`px-4 py-2 rounded-md text-sm ${tab === "volunteer" ? "bg-[#2D1B3D] text-white" : "bg-white border border-[#E0D8CC] text-[#2D1B3D]"}`}>
          מתנדבים
        </button>
        <div className="flex-1" />
        <SecondaryButton onClick={exportCSV}>ייצוא CSV</SecondaryButton>
      </div>

      <AdminCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            placeholder="חיפוש..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 border border-[#E0D8CC] rounded-md text-sm"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "new" | "handled")}
            className="px-3 py-2 border border-[#E0D8CC] rounded-md text-sm bg-white">
            <option value="all">כל הסטטוסים</option>
            <option value="new">חדש</option>
            <option value="handled">טופל</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-right text-xs text-[#A0907A] border-b border-[#E0D8CC]">
              <tr>
                <th className="py-2 px-2">תאריך</th>
                <th className="py-2 px-2">שם</th>
                <th className="py-2 px-2">טלפון</th>
                {tab === "contact" ? (<><th className="py-2 px-2">מייל</th><th className="py-2 px-2">נושא</th><th className="py-2 px-2">הודעה</th></>)
                  : (<><th className="py-2 px-2">תחום</th><th className="py-2 px-2">מתעניינ/ת ב</th></>)}
                <th className="py-2 px-2">סטטוס</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-6 text-center text-[#A0907A]">אין רשומות.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id!} className="border-b border-[#E0D8CC]/60">
                  <td className="py-2 px-2 whitespace-nowrap text-[#A0907A]">{new Date(r.created_at!).toLocaleDateString("he-IL")}</td>
                  <td className="py-2 px-2">{r.name}</td>
                  <td className="py-2 px-2">{r.phone || "—"}</td>
                  {tab === "contact" ? (
                    <>
                      <td className="py-2 px-2">{r.email || "—"}</td>
                      <td className="py-2 px-2">{r.subject || "—"}</td>
                      <td className="py-2 px-2 max-w-xs truncate">{r.message}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-2">{r.profession || "—"}</td>
                      <td className="py-2 px-2 max-w-xs truncate">{r.interest || "—"}</td>
                    </>
                  )}
                  <td className="py-2 px-2">
                    <button onClick={() => toggle(r)}
                      className={`px-2 py-1 rounded-full text-xs ${r.status === "new" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>
                      {r.status === "new" ? "חדש" : "טופל"}
                    </button>
                  </td>
                  <td className="py-2 px-2 whitespace-nowrap">
                    <button title="פתח" onClick={() => setOpen(r)} className="p-1 hover:text-[#BA9B78]"><Eye className="w-4 h-4" /></button>
                    {r.status === "new" && (
                      <button title="סמן כטופל" onClick={() => toggle(r)} className="p-1 hover:text-green-700"><Check className="w-4 h-4" /></button>
                    )}
                    <button title="מחיקה" onClick={() => remove(r)} className="p-1 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-[#2D1B3D] mb-3">{open.name}</h3>
            <dl className="space-y-2 text-sm">
              {Object.entries(open).filter(([k]) => !["id"].includes(k)).map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-2">
                  <dt className="text-[#A0907A]">{k}</dt>
                  <dd className="col-span-2 text-[#2D1B3D] whitespace-pre-wrap break-words">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <AnalysisPanel kind={tab} id={open.id!} />
            <div className="text-end mt-4">
              <SecondaryButton onClick={() => setOpen(null)}>סגירה</SecondaryButton>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
