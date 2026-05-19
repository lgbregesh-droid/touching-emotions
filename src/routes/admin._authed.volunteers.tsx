import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell, AdminCard, SecondaryButton } from "@/components/admin/AdminShell";
import { listInquiries, setInquiryStatus, deleteInquiry } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/volunteers")({
  head: () => ({ meta: [{ title: "פניות מתנדבים | ניהול" }] }),
  component: VolunteersAdmin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any> & { id: string; name: string; created_at: string; status: string };

function VolunteersAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listInquiries);
  const statusFn = useServerFn(setInquiryStatus);
  const delFn = useServerFn(deleteInquiry);

  const { data, isLoading } = useQuery({
    queryKey: ["volunteers"],
    queryFn: () => listFn({ data: { token: getAdminToken()!, kind: "volunteer" } }),
  });
  const rows = (data?.rows || []) as Row[];

  const [filter, setFilter] = useState<"all" | "new" | "handled">("all");
  const [q, setQ] = useState("");
  const filtered = rows
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  const toggle = async (r: Row) => {
    try {
      await statusFn({ data: { token: getAdminToken()!, kind: "volunteer", id: r.id, status: r.status === "new" ? "handled" : "new" } });
      qc.invalidateQueries({ queryKey: ["volunteers"] });
    } catch (e) { toast.error((e as Error).message); }
  };
  const remove = async (r: Row) => {
    if (!confirm("למחוק את הפנייה?")) return;
    try {
      await delFn({ data: { token: getAdminToken()!, kind: "volunteer", id: r.id } });
      qc.invalidateQueries({ queryKey: ["volunteers"] });
      toast.success("נמחק");
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <AdminShell title="פניות מתנדבים">
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "new", "handled"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-md text-sm ${filter === s ? "bg-[#2D1B3D] text-white" : "bg-white border border-[#E0D8CC] text-[#2D1B3D]"}`}>
            {s === "all" ? "הכל" : s === "new" ? "חדשות" : "טופלו"}
          </button>
        ))}
        <input dir="rtl" placeholder="חיפוש..." value={q} onChange={(e) => setQ(e.target.value)}
          className="px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm flex-1 min-w-[200px]" />
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-[#A0907A]">טוען...</div>
      ) : filtered.length === 0 ? (
        <AdminCard className="text-center py-12 text-[#A0907A]">אין פניות מתנדבים כרגע.</AdminCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <AdminCard key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#2D1B3D]">{r.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "new" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>
                      {r.status === "new" ? "חדש" : "טופל"}
                    </span>
                  </div>
                  <div className="text-xs text-[#A0907A] mb-2">{new Date(r.created_at).toLocaleString("he-IL")}</div>
                  <div className="text-sm text-[#2D1B3D] space-y-0.5">
                    {r.phone && <div>📞 {r.phone}</div>}
                    {r.email && <div>✉ {r.email}</div>}
                    {r.profession && <div>תחום: {r.profession}</div>}
                    {r.age && <div>גיל: {r.age}</div>}
                    {r.location && <div>אזור: {r.location}</div>}
                    {r.interests && <div>תחומי עניין: {r.interests}</div>}
                    {r.interest && <div>{r.interest}</div>}
                    {r.message && <div className="mt-2 p-2 bg-[#F5F0E8] rounded">{r.message}</div>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <SecondaryButton onClick={() => toggle(r)}>{r.status === "new" ? "סמן כטופל" : "סמן כחדש"}</SecondaryButton>
                  <button onClick={() => remove(r)} className="p-2 rounded text-red-600 hover:bg-red-50 self-end"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
