import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import {
  listWorkshops, upsertWorkshop, deleteWorkshop, duplicateWorkshop, listWorkshopRegistrants,
} from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Pencil, Copy, Users, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/workshops")({
  head: () => ({ meta: [{ title: "סדנאות | ניהול" }] }),
  component: WorkshopsAdmin,
});

type WS = {
  id?: string; name_he: string; name_en?: string | null; desc_he?: string | null; desc_en?: string | null;
  date?: string | null; time?: string | null; location?: string | null; audience?: string | null;
  price: number; max_participants?: number | null; image_url?: string | null;
  status: "open" | "closed" | "ended";
  category?: string | null;
  goals_list?: string | null;
  duration_text?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  registrants?: { count: number }[];
};

const empty: WS = { name_he: "", price: 0, status: "open", is_active: true, is_featured: false, category: "children" };

function WorkshopsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWorkshops);
  const saveFn = useServerFn(upsertWorkshop);
  const delFn = useServerFn(deleteWorkshop);
  const dupFn = useServerFn(duplicateWorkshop);
  const regsFn = useServerFn(listWorkshopRegistrants);

  const { data } = useQuery({
    queryKey: ["workshops"],
    queryFn: () => listFn({ data: { token: getAdminToken()! } }),
  });
  const rows = (data?.rows || []) as WS[];

  const [edit, setEdit] = useState<WS | null>(null);
  const [regs, setRegs] = useState<{ ws: WS; rows: { name: string; phone?: string | null; email?: string | null }[] } | null>(null);

  const save = async () => {
    if (!edit) return;
    const { id, registrants, ...values } = edit;
    void registrants;
    try {
      await saveFn({
        data: {
          token: getAdminToken()!,
          id,
          values: {
            ...values,
            price: Number(values.price) || 0,
            max_participants: values.max_participants ? Number(values.max_participants) : null,
          },
        },
      });
      toast.success("נשמר");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["workshops"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק את הסדנה?")) return;
    await delFn({ data: { token: getAdminToken()!, id } });
    qc.invalidateQueries({ queryKey: ["workshops"] });
  };

  const duplicate = async (id: string) => {
    await dupFn({ data: { token: getAdminToken()!, id } });
    toast.success("שוכפל");
    qc.invalidateQueries({ queryKey: ["workshops"] });
  };

  const showRegs = async (ws: WS) => {
    const r = await regsFn({ data: { token: getAdminToken()!, workshop_id: ws.id! } });
    setRegs({ ws, rows: r.rows as { name: string; phone?: string | null; email?: string | null }[] });
  };

  return (
    <AdminShell title="סדנאות">
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setEdit({ ...empty })}>
          <Plus className="w-4 h-4 inline ml-1" />הוסף סדנה חדשה
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.length === 0 && <AdminCard className="md:col-span-2 lg:col-span-3 text-center text-[#A0907A]">אין סדנאות.</AdminCard>}
        {rows.map((ws) => (
          <AdminCard key={ws.id}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg text-[#2D1B3D]">{ws.name_he}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                ws.status === "open" ? "bg-green-100 text-green-800"
                : ws.status === "closed" ? "bg-orange-100 text-orange-800"
                : "bg-gray-100 text-gray-700"
              }`}>{ws.status === "open" ? "פתוח" : ws.status === "closed" ? "סגור" : "הסתיים"}</span>
            </div>
            <div className="text-sm text-[#A0907A] space-y-1 mb-3">
              {ws.date && <div>📅 {ws.date}{ws.time ? ` · ${ws.time}` : ""}</div>}
              {ws.location && <div>📍 {ws.location}</div>}
              {ws.audience && <div>👥 {ws.audience}</div>}
              <div>💰 {ws.price > 0 ? `₪${ws.price}` : "חינם"}</div>
              <div>📝 נרשמו: {ws.registrants?.[0]?.count ?? 0}{ws.max_participants ? ` / ${ws.max_participants}` : ""}</div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button onClick={() => setEdit(ws)} className="px-2 py-1 rounded border border-[#E0D8CC] hover:bg-[#F5F0E8]"><Pencil className="w-3 h-3 inline ml-1" />עריכה</button>
              <button onClick={() => duplicate(ws.id!)} className="px-2 py-1 rounded border border-[#E0D8CC] hover:bg-[#F5F0E8]"><Copy className="w-3 h-3 inline ml-1" />שכפל</button>
              <button onClick={() => showRegs(ws)} className="px-2 py-1 rounded border border-[#E0D8CC] hover:bg-[#F5F0E8]"><Users className="w-3 h-3 inline ml-1" />נרשמים</button>
              <button onClick={() => remove(ws.id!)} className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="w-3 h-3 inline ml-1" />מחיקה</button>
            </div>
          </AdminCard>
        ))}
      </div>

      {edit && (
        <Modal onClose={() => setEdit(null)}>
          <h3 className="text-lg text-[#2D1B3D] mb-4">{edit.id ? "עריכת סדנה" : "סדנה חדשה"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Field label="שם הסדנה (עברית)"><input className={inp} value={edit.name_he} onChange={(e) => setEdit({ ...edit, name_he: e.target.value })} /></Field>
            <Field label="Workshop name (English)" ltr><input dir="ltr" className={inp} value={edit.name_en || ""} onChange={(e) => setEdit({ ...edit, name_en: e.target.value })} /></Field>
            <Field label="תיאור"><textarea className={inp} rows={3} value={edit.desc_he || ""} onChange={(e) => setEdit({ ...edit, desc_he: e.target.value })} /></Field>
            <Field label="Description" ltr><textarea dir="ltr" className={inp} rows={3} value={edit.desc_en || ""} onChange={(e) => setEdit({ ...edit, desc_en: e.target.value })} /></Field>
            <Field label="תאריך"><input type="date" className={inp} value={edit.date || ""} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></Field>
            <Field label="שעה"><input type="time" className={inp} value={edit.time || ""} onChange={(e) => setEdit({ ...edit, time: e.target.value })} /></Field>
            <Field label="מיקום"><input className={inp} value={edit.location || ""} onChange={(e) => setEdit({ ...edit, location: e.target.value })} /></Field>
            <Field label="קהל יעד / גיל"><input className={inp} value={edit.audience || ""} onChange={(e) => setEdit({ ...edit, audience: e.target.value })} /></Field>
            <Field label="מחיר ₪"><input type="number" min={0} className={inp} value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></Field>
            <Field label="מקסימום משתתפים"><input type="number" min={0} className={inp} value={edit.max_participants ?? ""} onChange={(e) => setEdit({ ...edit, max_participants: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="קישור לתמונה"><input className={inp} value={edit.image_url || ""} onChange={(e) => setEdit({ ...edit, image_url: e.target.value })} /></Field>
            <Field label="קטגוריה (קהל יעד לפילטר)">
              <select className={inp} value={edit.category || "children"} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                <option value="children">ילדים</option>
                <option value="teens">נוער</option>
                <option value="schools">צוותים חינוכיים</option>
                <option value="communities">קהילות</option>
                <option value="parents">הורים</option>
              </select>
            </Field>
            <Field label="משך (טקסט חופשי, לדוגמה: 90 דק׳ · א׳–ד׳)"><input className={inp} value={edit.duration_text || ""} onChange={(e) => setEdit({ ...edit, duration_text: e.target.value })} /></Field>
            <Field label="מטרות / תגיות (מופרדות בפסיקים)"><input className={inp} placeholder="שפה רגשית, מודעות עצמית, ביטחון" value={edit.goals_list || ""} onChange={(e) => setEdit({ ...edit, goals_list: e.target.value })} /></Field>
            <Field label="סטטוס">
              <select className={inp} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as "open" | "closed" | "ended" })}>
                <option value="open">פתוח לרישום</option>
                <option value="closed">סגור</option>
                <option value="ended">הסתיים</option>
              </select>
            </Field>
            <Field label="פעיל באתר">
              <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={edit.is_active !== false} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> מוצג באתר הציבורי</label>
            </Field>
            <Field label="מומלץ בדף הבית">
              <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={!!edit.is_featured} onChange={(e) => setEdit({ ...edit, is_featured: e.target.checked })} /> הצג גם בדף הבית</label>
            </Field>
      )}

      {regs && (
        <Modal onClose={() => setRegs(null)}>
          <h3 className="text-lg text-[#2D1B3D] mb-3">נרשמים: {regs.ws.name_he}</h3>
          {regs.rows.length === 0 ? (
            <div className="text-sm text-[#A0907A]">אין נרשמים עדיין.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-right text-xs text-[#A0907A] border-b border-[#E0D8CC]"><th className="py-2">שם</th><th className="py-2">טלפון</th><th className="py-2">מייל</th></tr></thead>
              <tbody>
                {regs.rows.map((r, i) => (
                  <tr key={i} className="border-b border-[#E0D8CC]/60"><td className="py-2">{r.name}</td><td className="py-2">{r.phone || "—"}</td><td className="py-2">{r.email || "—"}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="text-end mt-4"><SecondaryButton onClick={() => setRegs(null)}>סגירה</SecondaryButton></div>
        </Modal>
      )}
    </AdminShell>
  );
}

const inp = "w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white";
function Field({ label, children, ltr }: { label: string; children: React.ReactNode; ltr?: boolean }) {
  return (
    <label className={`block ${ltr ? "text-left" : ""}`}>
      <span className="text-xs text-[#A0907A] block mb-1">{label}</span>
      {children}
    </label>
  );
}
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
