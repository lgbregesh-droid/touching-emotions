import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { listWorkshops, upsertWorkshop, deleteWorkshop, duplicateWorkshop } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Pencil, Copy, Trash2, Plus } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/admin/_authed/workshops")({
  head: () => ({ meta: [{ title: "סדנאות | ניהול" }] }),
  component: WorkshopsAdmin,
});

type WS = {
  id?: string;
  name_he: string;
  name_en?: string | null;
  desc_he?: string | null;
  desc_en?: string | null;
  full_description?: string | null;
  audience?: string | null;
  image_url?: string | null;
  category?: string | null;
  duration_text?: string | null;
  goals_list?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
};

const empty: WS = {
  name_he: "",
  is_active: true,
  is_featured: false,
  category: "children",
  full_description: "",
};

function WorkshopsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWorkshops);
  const saveFn = useServerFn(upsertWorkshop);
  const delFn = useServerFn(deleteWorkshop);
  const dupFn = useServerFn(duplicateWorkshop);

  const { data } = useQuery({
    queryKey: ["workshops"],
    queryFn: () => listFn({ data: { token: getAdminToken()! } }),
  });
  const rows = (data?.rows || []) as WS[];

  const [edit, setEdit] = useState<WS | null>(null);

  const save = async () => {
    if (!edit) return;
    const { id, ...values } = edit;
    try {
      await saveFn({ data: { token: getAdminToken()!, id, values } });
      toast.success("נשמר");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["workshops"] });
      qc.invalidateQueries({ queryKey: ["workshops-public"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק את הסדנה?")) return;
    await delFn({ data: { token: getAdminToken()!, id } });
    qc.invalidateQueries({ queryKey: ["workshops"] });
    qc.invalidateQueries({ queryKey: ["workshops-public"] });
  };

  const duplicate = async (id: string) => {
    await dupFn({ data: { token: getAdminToken()!, id } });
    toast.success("שוכפל");
    qc.invalidateQueries({ queryKey: ["workshops"] });
  };

  const catLabel = (c?: string | null) => ({
    children: "ילדים", teens: "נוער", schools: "צוותים חינוכיים", communities: "קהילות", parents: "הורים",
  }[c || ""] || "—");

  return (
    <AdminShell title="סדנאות ופעילויות">
      <p className="text-sm text-[#A0907A] mb-4">
        אלו דוגמאות לסדנאות שמוצגות באתר. הסדנאות מותאמות אישית לכל קבוצה — אין רישום ישיר ואין תאריכים. כל סדנה כוללת תיאור מלא של מה היא כוללת ומה אפשר לבקש.
      </p>
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setEdit({ ...empty })}>
          <Plus className="w-4 h-4 inline ml-1" />הוסף דוגמת סדנה
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.length === 0 && <AdminCard className="md:col-span-2 lg:col-span-3 text-center text-[#A0907A]">אין סדנאות.</AdminCard>}
        {rows.map((ws) => (
          <AdminCard key={ws.id}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg text-[#2D1B3D]">{ws.name_he}</h3>
              <div className="flex flex-col gap-1 items-end">
                {ws.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">בדף הבית</span>}
                {ws.is_active === false && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">מוסתר</span>}
              </div>
            </div>
            <div className="text-sm text-[#A0907A] space-y-1 mb-3">
              <div>קטגוריה: {catLabel(ws.category)}</div>
              {ws.duration_text && <div>⏱ {ws.duration_text}</div>}
              {ws.audience && <div>👥 {ws.audience}</div>}
            </div>
            {ws.desc_he && <p className="text-xs text-[#4A3D30] line-clamp-2 mb-3">{ws.desc_he}</p>}
            <div className="flex flex-wrap gap-2 text-xs">
              <button onClick={() => setEdit(ws)} className="px-2 py-1 rounded border border-[#E0D8CC] hover:bg-[#F5F0E8]"><Pencil className="w-3 h-3 inline ml-1" />עריכה</button>
              <button onClick={() => duplicate(ws.id!)} className="px-2 py-1 rounded border border-[#E0D8CC] hover:bg-[#F5F0E8]"><Copy className="w-3 h-3 inline ml-1" />שכפל</button>
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

            <Field label="תיאור קצר (מופיע על הכרטיס)"><textarea className={inp} rows={2} value={edit.desc_he || ""} onChange={(e) => setEdit({ ...edit, desc_he: e.target.value })} /></Field>
            <Field label="Short description" ltr><textarea dir="ltr" className={inp} rows={2} value={edit.desc_en || ""} onChange={(e) => setEdit({ ...edit, desc_en: e.target.value })} /></Field>

            <div className="md:col-span-2">
              <Field label="הסבר מלא — מה הסדנה כוללת, מה מקבלים, דוגמאות לבקשות (מוצג כשנכנסים לסדנה)">
                <textarea
                  className={inp}
                  rows={10}
                  placeholder={"לדוגמה:\n• מפגש חווייתי של 90 דקות שמותאם לקבוצה\n• מה כולל המפגש: פעילות פתיחה, מעגל שיח, יצירה רגשית, סיכום\n• מה מקבלים: ערכת המשך להורים/למורים, חוברת דיגיטלית\n• דוגמאות לבקשות: התמקדות במעברים, חברות וקבלת השונה, התמודדות עם לחץ\n• מותאם לגיל, לזמן ולמטרה"}
                  value={edit.full_description || ""}
                  onChange={(e) => setEdit({ ...edit, full_description: e.target.value })}
                />
              </Field>
            </div>

            <Field label="קהל יעד / גיל"><input className={inp} value={edit.audience || ""} onChange={(e) => setEdit({ ...edit, audience: e.target.value })} /></Field>
            <Field label="משך / פורמט (טקסט חופשי)"><input className={inp} placeholder="90 דק׳ · א׳–ד׳" value={edit.duration_text || ""} onChange={(e) => setEdit({ ...edit, duration_text: e.target.value })} /></Field>

            <Field label="קישור לתמונה"><input className={inp} value={edit.image_url || ""} onChange={(e) => setEdit({ ...edit, image_url: e.target.value })} /></Field>
            <Field label="קטגוריה (לפילטר)">
              <select className={inp} value={edit.category || "children"} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                <option value="children">ילדים</option>
                <option value="teens">נוער</option>
                <option value="schools">צוותים חינוכיים</option>
                <option value="communities">קהילות</option>
                <option value="parents">הורים</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="מטרות / תגיות (מופרדות בפסיקים)"><input className={inp} placeholder="שפה רגשית, מודעות עצמית, ביטחון" value={edit.goals_list || ""} onChange={(e) => setEdit({ ...edit, goals_list: e.target.value })} /></Field>
            </div>

            <Field label="פעיל באתר">
              <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={edit.is_active !== false} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> מוצג באתר הציבורי</label>
            </Field>
            <Field label="מומלץ בדף הבית">
              <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={!!edit.is_featured} onChange={(e) => setEdit({ ...edit, is_featured: e.target.checked })} /> הצג גם בדף הבית</label>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <SecondaryButton onClick={() => setEdit(null)}>ביטול</SecondaryButton>
            <PrimaryButton onClick={save}>שמירה</PrimaryButton>
          </div>
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
