import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { listActiveVolunteers, upsertActiveVolunteer, deleteActiveVolunteer } from "@/lib/admin/team.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, Mail } from "lucide-react";

type VolunteersSearch = {
  prefillId?: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
};

export const Route = createFileRoute("/admin/_authed/volunteers")({
  head: () => ({ meta: [{ title: "מתנדבים פעילים | ניהול" }] }),
  validateSearch: (s: Record<string, unknown>): VolunteersSearch => ({
    prefillId: typeof s.prefillId === "string" ? s.prefillId : undefined,
    name: typeof s.name === "string" ? s.name : undefined,
    phone: typeof s.phone === "string" ? s.phone : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
    role: typeof s.role === "string" ? s.role : undefined,
  }),
  component: VolunteersAdmin,
});

type Vol = {
  id: string;
  name: string; phone: string; email: string | null;
  role: string | null; area: string | null;
  start_date: string | null; notes: string | null;
  status: "active" | "paused" | "ended";
  created_at: string;
};

const STATUS_LABEL: Record<Vol["status"], string> = { active: "פעיל", paused: "בהפסקה", ended: "סיים" };
const STATUS_CLR: Record<Vol["status"], string> = {
  active: "bg-green-100 text-green-800",
  paused: "bg-amber-100 text-amber-800",
  ended: "bg-gray-100 text-gray-700",
};

function VolunteersAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listActiveVolunteers);
  const saveFn = useServerFn(upsertActiveVolunteer);
  const delFn = useServerFn(deleteActiveVolunteer);

  const { data } = useQuery({ queryKey: ["active-volunteers"], queryFn: () => listFn({ data: { token: getAdminToken()! } }) });
  const rows = (data?.rows || []) as Vol[];

  const [filter, setFilter] = useState<"active" | "paused" | "ended" | "all">("active");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Vol> | null>(null);

  const counts = useMemo(() => ({
    active: rows.filter((r) => r.status === "active").length,
    paused: rows.filter((r) => r.status === "paused").length,
    ended: rows.filter((r) => r.status === "ended").length,
  }), [rows]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search) {
      const hay = `${r.name} ${r.phone} ${r.email || ""} ${r.role || ""}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [rows, filter, search]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["active-volunteers"] });

  const startNew = () => setEditing({ status: "active" });

  const save = async () => {
    if (!editing?.name || !editing?.phone) return toast.error("שם וטלפון הם שדות חובה");
    try {
      await saveFn({ data: {
        token: getAdminToken()!,
        id: editing.id,
        values: {
          name: editing.name,
          phone: editing.phone,
          email: editing.email || null,
          role: editing.role || null,
          area: editing.area || null,
          start_date: editing.start_date || null,
          notes: editing.notes || null,
          status: editing.status || "active",
        },
      } });
      toast.success("נשמר");
      setEditing(null);
      invalidate();
    } catch (e) { toast.error((e as Error).message); }
  };

  const remove = async (v: Vol) => {
    if (!confirm(`למחוק את ${v.name}?`)) return;
    try { await delFn({ data: { token: getAdminToken()!, id: v.id } }); toast.success("נמחק"); invalidate(); }
    catch (e) { toast.error((e as Error).message); }
  };

  const exportCSV = () => {
    const lines = ["שם,טלפון,מייל,תפקיד,אזור,תאריך תחילה,סטטוס,הערות"];
    for (const r of filtered) {
      const f = [r.name, r.phone, r.email || "", r.role || "", r.area || "", r.start_date || "", STATUS_LABEL[r.status], r.notes || ""];
      lines.push(f.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","));
    }
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `volunteers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="מתנדבים פעילים">
      <div className="flex justify-between items-start gap-4 mb-4 flex-wrap">
        <p className="text-sm text-[#A0907A]">רשימת המתנדבים הפעילים בעמותה — נפרד מהפניות הנכנסות.</p>
        <div className="flex gap-2">
          <SecondaryButton onClick={exportCSV}>ייצוא CSV</SecondaryButton>
          <PrimaryButton onClick={startNew}><Plus className="w-4 h-4 inline mb-0.5" /> הוסף מתנדב</PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <AdminCard className="text-center"><div className="text-2xl font-light text-green-700">{counts.active}</div><div className="text-xs text-[#A0907A] mt-1">מתנדבים פעילים</div></AdminCard>
        <AdminCard className="text-center"><div className="text-2xl font-light text-amber-700">{counts.paused}</div><div className="text-xs text-[#A0907A] mt-1">בהפסקה זמנית</div></AdminCard>
        <AdminCard className="text-center"><div className="text-2xl font-light text-gray-600">{counts.ended}</div><div className="text-xs text-[#A0907A] mt-1">סיימו פעילות</div></AdminCard>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["active", "paused", "ended", "all"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-md text-sm ${filter === s ? "bg-[#2D1B3D] text-white" : "bg-white border border-[#E0D8CC] text-[#2D1B3D]"}`}>
            {s === "all" ? "הכל" : s === "active" ? "פעילים" : s === "paused" ? "בהפסקה" : "סיימו"}
          </button>
        ))}
        <input placeholder="חיפוש..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
      </div>

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-right text-xs text-[#A0907A] border-b border-[#E0D8CC]">
              <tr>
                <th className="py-2 px-2">שם</th><th className="py-2 px-2">טלפון</th><th className="py-2 px-2">מייל</th>
                <th className="py-2 px-2">תפקיד / תחום</th><th className="py-2 px-2">תאריך הצטרפות</th>
                <th className="py-2 px-2">סטטוס</th><th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-[#A0907A]">אין רשומות.</td></tr>}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#E0D8CC]/60">
                  <td className="py-2 px-2">{r.name}</td>
                  <td className="py-2 px-2">{r.phone}</td>
                  <td className="py-2 px-2">{r.email || "—"}</td>
                  <td className="py-2 px-2">{r.role || "—"}</td>
                  <td className="py-2 px-2 whitespace-nowrap text-[#A0907A]">{r.start_date ? new Date(r.start_date).toLocaleDateString("he-IL") : "—"}</td>
                  <td className="py-2 px-2"><span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_CLR[r.status]}`}>{STATUS_LABEL[r.status]}</span></td>
                  <td className="py-2 px-2 whitespace-nowrap">
                    {r.email && <a href={`mailto:${r.email}?subject=${encodeURIComponent("לגעת ברגש — פנייה למתנדב")}`} className="p-1 inline-block hover:text-[#BA9B78]" title="שלח מייל"><Mail className="w-4 h-4" /></a>}
                    <button onClick={() => setEditing(r)} className="p-1 hover:text-[#BA9B78]" title="עריכה"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(r)} className="p-1 hover:text-red-600" title="מחיקה"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-[#2D1B3D]">{editing.id ? "עריכת מתנדב" : "מתנדב חדש"}</h3>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-xs text-[#A0907A] block mb-1">שם מלא *</label>
                <input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" /></div>
              <div><label className="text-xs text-[#A0907A] block mb-1">טלפון *</label>
                <input value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" /></div>
              <div><label className="text-xs text-[#A0907A] block mb-1">מייל</label>
                <input type="email" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" /></div>
              <div><label className="text-xs text-[#A0907A] block mb-1">תפקיד / תחום</label>
                <input value={editing.role || ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" /></div>
              <div><label className="text-xs text-[#A0907A] block mb-1">אזור / זמינות</label>
                <input value={editing.area || ""} onChange={(e) => setEditing({ ...editing, area: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" /></div>
              <div><label className="text-xs text-[#A0907A] block mb-1">תאריך תחילה</label>
                <input type="date" value={editing.start_date || ""} onChange={(e) => setEditing({ ...editing, start_date: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" /></div>
              <div><label className="text-xs text-[#A0907A] block mb-1">סטטוס</label>
                <select value={editing.status || "active"} onChange={(e) => setEditing({ ...editing, status: e.target.value as Vol["status"] })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm bg-white">
                  <option value="active">פעיל</option><option value="paused">בהפסקה</option><option value="ended">סיים</option>
                </select></div>
              <div className="col-span-2"><label className="text-xs text-[#A0907A] block mb-1">הערות</label>
                <textarea rows={3} value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <SecondaryButton onClick={() => setEditing(null)}>ביטול</SecondaryButton>
              <PrimaryButton onClick={save}>שמור</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
