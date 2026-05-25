import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { listTeam, upsertTeamMember, deleteTeamMember, reorderTeam, uploadTeamPhoto, removeTeamPhoto } from "@/lib/admin/team.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Pencil, Trash2, ChevronUp, ChevronDown, Plus, Upload, Eye, EyeOff, X } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/team")({
  head: () => ({ meta: [{ title: "ניהול הצוות | ניהול" }] }),
  component: TeamAdmin,
});

type Member = {
  id: string;
  name_he: string; name_en: string;
  role_he: string; role_en: string;
  bio_he: string | null; bio_en: string | null;
  photo_url: string | null;
  storage_path: string | null;
  display_order: number;
  is_active: boolean;
};

function initials(n: string) {
  const p = n.trim().split(/\s+/);
  return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase() || "•";
}

function TeamAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listTeam);
  const saveFn = useServerFn(upsertTeamMember);
  const delFn = useServerFn(deleteTeamMember);
  const reFn = useServerFn(reorderTeam);
  const upFn = useServerFn(uploadTeamPhoto);
  const rmPhotoFn = useServerFn(removeTeamPhoto);

  const { data } = useQuery({ queryKey: ["admin-team"], queryFn: () => listFn({ data: { token: getAdminToken()! } }) });
  const rows = (data?.rows || []) as Member[];

  const [editing, setEditing] = useState<Partial<Member> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-team"] });

  const startNew = () => setEditing({ name_he: "", name_en: "", role_he: "", role_en: "", bio_he: "", bio_en: "", is_active: true });

  const save = async () => {
    if (!editing) return;
    if (!editing.name_he || !editing.role_he) return toast.error("שם ותפקיד בעברית הם שדות חובה");
    try {
      await saveFn({
        data: {
          token: getAdminToken()!,
          id: editing.id,
          values: {
            name_he: editing.name_he,
            name_en: editing.name_en || "",
            role_he: editing.role_he,
            role_en: editing.role_en || "",
            bio_he: editing.bio_he || null,
            bio_en: editing.bio_en || null,
            photo_url: editing.photo_url || null,
            storage_path: editing.storage_path || null,
            is_active: editing.is_active ?? true,
          },
        },
      });
      toast.success("נשמר");
      setEditing(null);
      invalidate();
    } catch (e) { toast.error((e as Error).message); }
  };

  const remove = async (m: Member) => {
    if (!confirm(`למחוק את ${m.name_he}?`)) return;
    try { await delFn({ data: { token: getAdminToken()!, id: m.id } }); toast.success("נמחק"); invalidate(); }
    catch (e) { toast.error((e as Error).message); }
  };

  const move = async (m: Member, direction: "up" | "down") => {
    await reFn({ data: { token: getAdminToken()!, id: m.id, direction } });
    invalidate();
  };

  const toggleActive = async (m: Member) => {
    await saveFn({ data: { token: getAdminToken()!, id: m.id, values: {
      name_he: m.name_he, name_en: m.name_en, role_he: m.role_he, role_en: m.role_en,
      bio_he: m.bio_he, bio_en: m.bio_en, photo_url: m.photo_url, storage_path: m.storage_path,
      is_active: !m.is_active,
    } } });
    invalidate();
  };

  const onPickFile = async (file: File) => {
    if (!editing) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return toast.error("JPG/PNG/WEBP בלבד");
    if (file.size > 3 * 1024 * 1024) return toast.error("עד 3MB");
    setUploading(true);
    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onloadend = () => resolve((r.result as string).split(",")[1]);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      const res = await upFn({ data: { token: getAdminToken()!, filename: file.name, contentType: file.type, base64: b64 } });
      setEditing({ ...editing, photo_url: res.url, storage_path: res.storage_path });
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  };

  const removePhoto = async () => {
    if (!editing) return;
    if (editing.id) {
      try { await rmPhotoFn({ data: { token: getAdminToken()!, id: editing.id } }); } catch { /* empty */ }
    }
    setEditing({ ...editing, photo_url: null, storage_path: null });
  };

  return (
    <AdminShell title="ניהול הצוות">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#A0907A]">חברי צוות פעילים מופיעים בעמוד "אודות".</p>
        <PrimaryButton onClick={startNew}><Plus className="w-4 h-4 inline mb-0.5" /> הוסף חבר צוות</PrimaryButton>
      </div>

      <div className="space-y-2">
        {rows.length === 0 && <AdminCard className="text-center py-12 text-[#A0907A]">אין חברי צוות עדיין.</AdminCard>}
        {rows.map((m, i) => (
          <AdminCard key={m.id}>
            <div className="flex items-center gap-3">
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.name_he} className="w-12 h-12 rounded-full object-cover border border-[#E0D8CC]" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#EDE6DC] text-[#2D1B3D] text-sm border border-[#E0D8CC]">{initials(m.name_he)}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#2D1B3D]">{m.name_he}</div>
                <div className="text-xs text-[#BA9B78]">{m.role_he}</div>
              </div>
              <button onClick={() => toggleActive(m)} title={m.is_active ? "פעיל" : "מוסתר"} className={`p-2 rounded ${m.is_active ? "text-green-700" : "text-gray-400"}`}>
                {m.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => move(m, "up")} disabled={i === 0} className="p-2 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={() => move(m, "down")} disabled={i === rows.length - 1} className="p-2 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
              <button onClick={() => setEditing(m)} className="p-2 text-[#BA9B78] hover:bg-[#BA9B78]/10 rounded"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(m)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          </AdminCard>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-[#2D1B3D]">{editing.id ? "עריכת חבר צוות" : "חבר צוות חדש"}</h3>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-[#A0907A] block mb-1">שם (עברית) *</label>
                <input value={editing.name_he || ""} onChange={(e) => setEditing({ ...editing, name_he: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#A0907A] block mb-1">Name (English) *</label>
                <input dir="ltr" value={editing.name_en || ""} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#A0907A] block mb-1">תפקיד (עברית) *</label>
                <input value={editing.role_he || ""} onChange={(e) => setEditing({ ...editing, role_he: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#A0907A] block mb-1">Role (English) *</label>
                <input dir="ltr" value={editing.role_en || ""} onChange={(e) => setEditing({ ...editing, role_en: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#A0907A] block mb-1">טקסט קצר (עברית) — {(editing.bio_he || "").length}/300</label>
              <textarea maxLength={300} rows={3} value={editing.bio_he || ""} onChange={(e) => setEditing({ ...editing, bio_he: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
            </div>
            <div className="mb-4">
              <label className="text-xs text-[#A0907A] block mb-1">Short bio (English) — {(editing.bio_en || "").length}/300</label>
              <textarea dir="ltr" maxLength={300} rows={3} value={editing.bio_en || ""} onChange={(e) => setEditing({ ...editing, bio_en: e.target.value })} className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#A0907A] block mb-2">תמונה</label>
              <div className="flex items-center gap-3">
                {editing.photo_url ? (
                  <img src={editing.photo_url} alt="" className="w-20 h-20 rounded-full object-cover border border-[#E0D8CC]" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#EDE6DC] flex items-center justify-center text-[#2D1B3D]">{initials(editing.name_he || "")}</div>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickFile(f); if (fileRef.current) fileRef.current.value = ""; }} />
                <SecondaryButton onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload className="w-4 h-4 inline mb-0.5" /> {uploading ? "מעלה..." : "העלאה"}
                </SecondaryButton>
                {editing.photo_url && <button onClick={removePhoto} className="text-sm text-red-600 hover:underline">הסר תמונה</button>}
              </div>
              <p className="text-xs text-[#A0907A] mt-1">JPG / PNG / WEBP · עד 3MB</p>
            </div>

            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
              <span className="text-sm text-[#2D1B3D]">פעיל (מופיע באתר)</span>
            </label>

            <div className="flex justify-end gap-2">
              <SecondaryButton onClick={() => setEditing(null)}>ביטול</SecondaryButton>
              <PrimaryButton onClick={save}>שמור</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
