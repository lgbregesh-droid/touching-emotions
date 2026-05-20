import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { listEvents, upsertEvent, deleteEvent, listEventRegistrants } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Pencil, Users, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/events")({
  head: () => ({ meta: [{ title: "אירועים | ניהול" }] }),
  component: EventsAdmin,
});

type EV = {
  id?: string;
  title_he: string;
  title_en?: string | null;
  description_he?: string | null;
  description_en?: string | null;
  type: "lecture" | "workshop" | "meetup" | "evening";
  date: string;
  time: string;
  location_he?: string | null;
  location_en?: string | null;
  end_time?: string | null;
  online_link?: string | null;
  price: number;
  max_spots: number;
  spots_remaining?: number;
  image_url?: string | null;
  status: "active" | "cancelled" | "completed";
};

const empty: EV = { title_he: "", title_en: "", type: "lecture", date: "", time: "", price: 0, max_spots: 20, status: "active" };

const typeLabels: Record<string, string> = { lecture: "הרצאה", workshop: "סדנה", meetup: "מפגש", evening: "ערב עיון" };
const statusLabels: Record<string, string> = { active: "פעיל", cancelled: "מבוטל", completed: "הסתיים" };

function EventsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listEvents);
  const saveFn = useServerFn(upsertEvent);
  const delFn = useServerFn(deleteEvent);
  const regsFn = useServerFn(listEventRegistrants);

  const { data } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => listFn({ data: { token: getAdminToken()! } }),
  });
  const rows = (data?.rows || []) as EV[];

  const [edit, setEdit] = useState<EV | null>(null);
  const [regs, setRegs] = useState<{ ev: EV; rows: { name: string; phone: string; email: string; notes: string | null; created_at: string }[] } | null>(null);

  const save = async () => {
    if (!edit) return;
    if (!edit.title_he || !edit.date || !edit.time) {
      toast.error("יש למלא כותרת, תאריך ושעה");
      return;
    }
    const { id, spots_remaining, ...values } = edit;
    void spots_remaining;
    try {
      await saveFn({
        data: {
          token: getAdminToken()!,
          id,
          values: {
            ...values,
            price: Number(values.price) || 0,
            max_spots: Number(values.max_spots) || 0,
          },
        },
      });
      toast.success("נשמר");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["admin-events"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק את האירוע?")) return;
    await delFn({ data: { token: getAdminToken()!, id } });
    toast.success("נמחק");
    qc.invalidateQueries({ queryKey: ["admin-events"] });
  };

  const showRegs = async (ev: EV) => {
    const r = await regsFn({ data: { token: getAdminToken()!, event_id: ev.id! } });
    setRegs({ ev, rows: r.rows as { name: string; phone: string; email: string; notes: string | null; created_at: string }[] });
  };

  const exportCsv = () => {
    if (!regs) return;
    const header = ["שם", "טלפון", "מייל", "הערות", "תאריך רישום"];
    const lines = [header.join(",")].concat(
      regs.rows.map((r) => [r.name, r.phone, r.email, (r.notes || "").replace(/[\r\n,]/g, " "), new Date(r.created_at).toLocaleDateString("he-IL")].map((c) => `"${c}"`).join(","))
    );
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrants-${regs.ev.title_he}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="אירועים">
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setEdit({ ...empty })}>
          <Plus className="w-4 h-4 inline ml-1" />הוסף אירוע חדש
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.length === 0 && <AdminCard className="md:col-span-2 lg:col-span-3 text-center text-[#A0907A]">אין אירועים.</AdminCard>}
        {rows.map((ev) => (
          <AdminCard key={ev.id}>
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-lg text-[#2D1B3D]">{ev.title_he}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                ev.status === "active" ? "bg-green-100 text-green-800"
                : ev.status === "cancelled" ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-700"
              }`}>{statusLabels[ev.status]}</span>
            </div>
            <div className="text-sm text-[#A0907A] space-y-1 mb-3">
              <div>🏷️ {typeLabels[ev.type]}</div>
              <div>📅 {ev.date} · {ev.time?.slice(0, 5)}</div>
              {ev.location_he && <div>📍 {ev.location_he}</div>}
              <div>👥 {ev.spots_remaining ?? ev.max_spots} / {ev.max_spots}</div>
              <div>💰 {ev.price > 0 ? `₪${ev.price}` : "חינם"}</div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button onClick={() => setEdit(ev)} className="px-2 py-1 rounded border border-[#E0D8CC] hover:bg-[#F5F0E8]"><Pencil className="w-3 h-3 inline ml-1" />עריכה</button>
              <button onClick={() => showRegs(ev)} className="px-2 py-1 rounded border border-[#E0D8CC] hover:bg-[#F5F0E8]"><Users className="w-3 h-3 inline ml-1" />נרשמים</button>
              <button onClick={() => remove(ev.id!)} className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="w-3 h-3 inline ml-1" />מחיקה</button>
            </div>
          </AdminCard>
        ))}
      </div>

      {edit && (
        <Modal onClose={() => setEdit(null)}>
          <h3 className="text-lg text-[#2D1B3D] mb-4">{edit.id ? "עריכת אירוע" : "אירוע חדש"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Field label="כותרת (עברית) *"><input className={inp} value={edit.title_he} onChange={(e) => setEdit({ ...edit, title_he: e.target.value })} /></Field>
            <Field label="Title (English)" ltr><input dir="ltr" className={inp} value={edit.title_en || ""} onChange={(e) => setEdit({ ...edit, title_en: e.target.value })} /></Field>
            <Field label="תיאור (עברית)"><textarea className={inp} rows={3} value={edit.description_he || ""} onChange={(e) => setEdit({ ...edit, description_he: e.target.value })} /></Field>
            <Field label="Description (English)" ltr><textarea dir="ltr" className={inp} rows={3} value={edit.description_en || ""} onChange={(e) => setEdit({ ...edit, description_en: e.target.value })} /></Field>
            <Field label="סוג אירוע *">
              <select className={inp} value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as EV["type"] })}>
                <option value="lecture">הרצאה</option>
                <option value="workshop">סדנה</option>
                <option value="meetup">מפגש</option>
                <option value="evening">ערב עיון</option>
              </select>
            </Field>
            <Field label="סטטוס *">
              <select className={inp} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as EV["status"] })}>
                <option value="active">פעיל</option>
                <option value="cancelled">מבוטל</option>
                <option value="completed">הסתיים</option>
              </select>
            </Field>
            <Field label="תאריך *"><input type="date" className={inp} value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></Field>
            <Field label="שעה *"><input type="time" className={inp} value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} /></Field>
            <Field label="מיקום (עברית)"><input className={inp} value={edit.location_he || ""} onChange={(e) => setEdit({ ...edit, location_he: e.target.value })} /></Field>
            <Field label="Location (English)" ltr><input dir="ltr" className={inp} value={edit.location_en || ""} onChange={(e) => setEdit({ ...edit, location_en: e.target.value })} /></Field>
            <Field label="מחיר ₪ (0 = חינם)"><input type="number" min={0} className={inp} value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></Field>
            <Field label="מקסימום משתתפים *"><input type="number" min={0} className={inp} value={edit.max_spots} onChange={(e) => setEdit({ ...edit, max_spots: Number(e.target.value) })} /></Field>
            <Field label="קישור לתמונה"><input className={inp} value={edit.image_url || ""} onChange={(e) => setEdit({ ...edit, image_url: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <SecondaryButton onClick={() => setEdit(null)}>ביטול</SecondaryButton>
            <PrimaryButton onClick={save}>שמירה</PrimaryButton>
          </div>
        </Modal>
      )}

      {regs && (
        <Modal onClose={() => setRegs(null)}>
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="text-lg text-[#2D1B3D]">נרשמים: {regs.ev.title_he}</h3>
            {regs.rows.length > 0 && <SecondaryButton onClick={exportCsv}>ייצוא CSV</SecondaryButton>}
          </div>
          {regs.rows.length === 0 ? (
            <div className="text-sm text-[#A0907A]">אין נרשמים עדיין.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-right text-xs text-[#A0907A] border-b border-[#E0D8CC]">
                  <th className="py-2">שם</th><th className="py-2">טלפון</th><th className="py-2">מייל</th><th className="py-2">הערות</th><th className="py-2">תאריך</th>
                </tr></thead>
                <tbody>
                  {regs.rows.map((r, i) => (
                    <tr key={i} className="border-b border-[#E0D8CC]/60">
                      <td className="py-2">{r.name}</td>
                      <td className="py-2">{r.phone}</td>
                      <td className="py-2">{r.email}</td>
                      <td className="py-2">{r.notes || "—"}</td>
                      <td className="py-2 text-xs text-[#A0907A]">{new Date(r.created_at).toLocaleDateString("he-IL")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
