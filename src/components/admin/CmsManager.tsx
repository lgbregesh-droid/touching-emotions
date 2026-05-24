import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminCard, PrimaryButton, SecondaryButton } from "./AdminShell";
import { cmsList, cmsUpsert, cmsDelete, cmsReorder, cmsUploadImage } from "@/lib/admin/cms.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Pencil, Trash2, ChevronUp, ChevronDown, Plus, Upload, Eye, EyeOff, Star, Sparkles } from "lucide-react";

export type FieldType = "text" | "textarea" | "number" | "url" | "image" | "boolean" | "select";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[]; // for select
  rows?: number;
  placeholder?: string;
};

export type CmsTable = "lectures" | "testimonials" | "support_items" | "faq" | "site_settings" | "media";

type Props = {
  table: CmsTable;
  fields: Field[];
  primaryField: string; // shown as title in row
  secondaryField?: string; // shown as subtitle
  imageField?: string; // shown as thumbnail
  hasFeatured?: boolean; // shows star toggle
  hasActive?: boolean; // shows eye toggle
  hasOrder?: boolean; // shows reorder arrows
  emptyText?: string;
  newButtonLabel?: string;
  aiAnalyze?: {
    label: string;
    hint?: string;
    analyze: (base64: string, contentType: string) => Promise<Record<string, unknown>>;
  };
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any> & { id: string };

export function CmsManager(props: Props) {
  const { table, fields, primaryField, secondaryField, imageField, hasFeatured, hasActive, hasOrder, emptyText, newButtonLabel, aiAnalyze } = props;
  const qc = useQueryClient();
  const listFn = useServerFn(cmsList);
  const saveFn = useServerFn(cmsUpsert);
  const delFn = useServerFn(cmsDelete);
  const reFn = useServerFn(cmsReorder);

  const key = ["cms", table];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => listFn({ data: { token: getAdminToken()!, table } }),
  });
  const rows = (data?.rows || []) as Row[];

  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const startNew = () => { setEditing({ id: "", is_active: true, is_featured: false } as Row); setCreating(true); };
  const startEdit = (r: Row) => { setEditing(r); setCreating(false); };
  const cancel = () => { setEditing(null); setCreating(false); };

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const remove = async (r: Row) => {
    if (!confirm("האם למחוק?")) return;
    try {
      await delFn({ data: { token: getAdminToken()!, table, id: r.id } });
      toast.success("נמחק");
      invalidate();
    } catch (e) { toast.error((e as Error).message); }
  };

  const move = async (r: Row, direction: "up" | "down") => {
    try {
      await reFn({ data: { token: getAdminToken()!, table, id: r.id, direction } });
      invalidate();
    } catch (e) { toast.error((e as Error).message); }
  };

  const toggleField = async (r: Row, field: "is_active" | "is_featured") => {
    try {
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = r;
      void _id; void _ca; void _ua;
      const values = { ...rest, [field]: !r[field] };
      await saveFn({ data: { token: getAdminToken()!, table, id: r.id, values } });
      invalidate();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-[#A0907A]">{rows.length} פריטים</div>
        <PrimaryButton onClick={startNew}><Plus className="w-4 h-4 inline ml-1" />{newButtonLabel || "הוספה"}</PrimaryButton>
      </div>

      {editing && (
        <CmsForm
          table={table}
          fields={fields}
          initial={editing}
          isNew={creating}
          onCancel={cancel}
          onSaved={() => { cancel(); invalidate(); }}
          aiAnalyze={aiAnalyze}
        />
      )}


      {isLoading ? (
        <div className="text-center py-12 text-[#A0907A]">טוען...</div>
      ) : rows.length === 0 ? (
        <AdminCard className="text-center py-12 text-[#A0907A]">{emptyText || "אין פריטים עדיין."}</AdminCard>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <AdminCard key={r.id} className="flex items-center gap-3">
              {imageField && (
                <div className="w-16 h-16 bg-[#EDE6DC] rounded overflow-hidden flex-shrink-0">
                  {r[imageField] ? <img src={r[imageField]} alt="" className="w-full h-full object-cover" /> : null}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[#2D1B3D] font-medium truncate">{String(r[primaryField] || "—")}</div>
                {secondaryField && <div className="text-xs text-[#A0907A] truncate">{String(r[secondaryField] || "")}</div>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {hasFeatured && (
                  <button title={r.is_featured ? "מוצג בדף הבית" : "סמן לדף הבית"} onClick={() => toggleField(r, "is_featured")}
                    className={`p-2 rounded ${r.is_featured ? "text-[#BA9B78]" : "text-gray-400 hover:text-[#BA9B78]"}`}>
                    <Star className={`w-4 h-4 ${r.is_featured ? "fill-[#BA9B78]" : ""}`} />
                  </button>
                )}
                {hasActive && (
                  <button title={r.is_active ? "פעיל" : "מוסתר"} onClick={() => toggleField(r, "is_active")}
                    className={`p-2 rounded ${r.is_active ? "text-green-700" : "text-gray-400"}`}>
                    {r.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                )}
                {hasOrder && (
                  <>
                    <button onClick={() => move(r, "up")} disabled={i === 0} className="p-2 rounded text-[#2D1B3D] disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={() => move(r, "down")} disabled={i === rows.length - 1} className="p-2 rounded text-[#2D1B3D] disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                  </>
                )}
                <button onClick={() => startEdit(r)} className="p-2 rounded text-[#2D1B3D] hover:bg-[#F5F0E8]"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(r)} className="p-2 rounded text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}

function CmsForm({ table, fields, initial, isNew, onCancel, onSaved, aiAnalyze }: { table: CmsTable; fields: Field[]; initial: Row; isNew: boolean; onCancel: () => void; onSaved: () => void; aiAnalyze?: Props["aiAnalyze"]; }) {
  const [values, setValues] = useState<Row>(initial);
  const [saving, setSaving] = useState(false);
  const saveFn = useServerFn(cmsUpsert);
  const upFn = useServerFn(cmsUploadImage);
  const fileRef = useRef<HTMLInputElement>(null);
  const aiFileRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);


  const set = (k: string, v: unknown) => setValues((p) => ({ ...p, [k]: v }));

  const uploadImage = async (key: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("הקובץ גדול מ-5MB"); return; }
    setUploadingFor(key);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res((r.result as string).split(",")[1]);
        r.onerror = () => rej(r.error);
        r.readAsDataURL(file);
      });
      const out = await upFn({ data: { token: getAdminToken()!, table, filename: file.name, contentType: file.type, base64: b64 } });
      set(key, out.url);
      toast.success("הועלה");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploadingFor(null); }
  };

  const save = async () => {
    for (const f of fields) {
      if (f.required && !values[f.key] && values[f.key] !== false) {
        toast.error(`חסר שדה: ${f.label}`);
        return;
      }
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) payload[f.key] = values[f.key] ?? null;
      if ("is_active" in values) payload.is_active = !!values.is_active;
      if ("is_featured" in values) payload.is_featured = !!values.is_featured;
      await saveFn({ data: { token: getAdminToken()!, table, id: isNew ? undefined : values.id, values: payload } });
      toast.success("נשמר");
      onSaved();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <AdminCard className="mb-6 border-[#BA9B78]/50">
      <h3 className="text-lg font-medium text-[#2D1B3D] mb-4">{isNew ? "פריט חדש" : "עריכה"}</h3>
      <div className="space-y-3">
        {fields.map((f) => {
          const v = values[f.key];
          if (f.type === "boolean") {
            return (
              <label key={f.key} className="flex items-center gap-2 text-sm text-[#2D1B3D] cursor-pointer">
                <input type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} />
                {f.label}
              </label>
            );
          }
          if (f.type === "image") {
            return (
              <div key={f.key}>
                <div className="text-xs text-[#A0907A] mb-1">{f.label}{f.required && " *"}</div>
                <div className="flex items-center gap-3">
                  {v && <img src={String(v)} alt="" className="w-20 h-20 object-cover rounded border border-[#E0D8CC]" />}
                  <div className="flex-1 flex gap-2">
                    <input dir="ltr" className={inp} placeholder="URL או העלה קובץ" value={v || ""} onChange={(e) => set(f.key, e.target.value)} />
                    <SecondaryButton onClick={() => fileRef.current?.click()} disabled={uploadingFor === f.key}>
                      <Upload className="w-4 h-4 inline ml-1" />{uploadingFor === f.key ? "מעלה..." : "העלאה"}
                    </SecondaryButton>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(f.key, file); if (fileRef.current) fileRef.current.value = ""; }} />
                  </div>
                </div>
              </div>
            );
          }
          if (f.type === "select") {
            return (
              <div key={f.key}>
                <div className="text-xs text-[#A0907A] mb-1">{f.label}{f.required && " *"}</div>
                <select className={inp} value={v || ""} onChange={(e) => set(f.key, e.target.value)}>
                  <option value="">— בחר —</option>
                  {(f.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            );
          }
          if (f.type === "textarea") {
            return (
              <div key={f.key}>
                <div className="text-xs text-[#A0907A] mb-1">{f.label}{f.required && " *"}</div>
                <textarea dir="rtl" rows={f.rows || 4} className={inp} placeholder={f.placeholder || ""} value={v || ""} onChange={(e) => set(f.key, e.target.value)} />
              </div>
            );
          }
          return (
            <div key={f.key}>
              <div className="text-xs text-[#A0907A] mb-1">{f.label}{f.required && " *"}</div>
              <input
                dir={f.type === "url" ? "ltr" : "rtl"}
                type={f.type === "number" ? "number" : "text"}
                className={inp}
                placeholder={f.placeholder || ""}
                value={v ?? ""}
                onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <SecondaryButton onClick={onCancel} disabled={saving}>ביטול</SecondaryButton>
        <PrimaryButton onClick={save} disabled={saving}>{saving ? "שומר..." : "שמירה"}</PrimaryButton>
      </div>
    </AdminCard>
  );
}

const inp = "w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm";
