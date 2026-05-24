import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import {
  listRagDocuments,
  uploadRagDocument,
  reextractRagDocument,
  setRagDocumentActive,
  deleteRagDocument,
  previewRagDocument,
} from "@/lib/ai/rag.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Eye, Trash2, RefreshCw, FileText, Upload, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/knowledge-base")({
  head: () => ({ meta: [{ title: "בסיס ידע | ניהול" }] }),
  component: KnowledgeBaseAdmin,
});

type Doc = {
  id: string;
  title: string;
  description: string | null;
  category: "org_profile" | "workshops_full";
  language: "he" | "en" | "both";
  file_name: string;
  file_type: "pdf" | "docx" | "txt";
  extraction_status: "pending" | "completed" | "failed";
  extraction_error: string | null;
  is_active: boolean;
  chars_total: number;
  created_at: string;
};

const CATEGORY_LABEL: Record<Doc["category"], string> = {
  org_profile: "פרופיל העמותה והחזון",
  workshops_full: "תיאור סדנאות והרצאות מלא",
};
const LANG_LABEL: Record<Doc["language"], string> = {
  he: "עברית",
  en: "אנגלית",
  both: "שתיהן",
};
const FILE_ICON: Record<Doc["file_type"], string> = {
  pdf: "📄",
  docx: "📝",
  txt: "📃",
};

const ACCEPTED = ".pdf,.docx,.txt";
const MAX_BYTES = 10 * 1024 * 1024;

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function KnowledgeBaseAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listRagDocuments);
  const uploadFn = useServerFn(uploadRagDocument);
  const reextractFn = useServerFn(reextractRagDocument);
  const toggleFn = useServerFn(setRagDocumentActive);
  const delFn = useServerFn(deleteRagDocument);
  const previewFn = useServerFn(previewRagDocument);

  const { data, isLoading } = useQuery({
    queryKey: ["rag-documents"],
    queryFn: () => listFn({ data: { token: getAdminToken()! } }),
    refetchInterval: 5000,
  });

  const [pending, setPending] = useState<{
    file: File;
    title: string;
    description: string;
    category: Doc["category"];
    language: Doc["language"];
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ title: string; text: string; chunks: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const rows = (data?.rows ?? []) as Doc[];

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > MAX_BYTES) {
      toast.error("הקובץ גדול מ-10MB");
      return;
    }
    const lower = f.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx") && !lower.endsWith(".txt")) {
      toast.error("ניתן להעלות PDF, DOCX או TXT בלבד");
      return;
    }
    const baseTitle = f.name.replace(/\.[^.]+$/, "");
    setPending({ file: f, title: baseTitle, description: "", category: "org_profile", language: "he" });
  };

  const submitUpload = async () => {
    if (!pending) return;
    setUploading(true);
    try {
      const base64 = await fileToBase64(pending.file);
      await uploadFn({
        data: {
          token: getAdminToken()!,
          title: pending.title.trim(),
          description: pending.description.trim() || null,
          category: pending.category,
          language: pending.language,
          filename: pending.file.name,
          contentType: pending.file.type || "application/octet-stream",
          base64,
        },
      });
      toast.success("המסמך הועלה. החילוץ מתבצע ברקע…");
      setPending(null);
      qc.invalidateQueries({ queryKey: ["rag-documents"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (d: Doc) => {
    await toggleFn({ data: { token: getAdminToken()!, id: d.id, is_active: !d.is_active } });
    qc.invalidateQueries({ queryKey: ["rag-documents"] });
  };

  const reextract = async (d: Doc) => {
    await reextractFn({ data: { token: getAdminToken()!, id: d.id } });
    toast.success("חילוץ מחדש החל…");
    qc.invalidateQueries({ queryKey: ["rag-documents"] });
  };

  const remove = async (d: Doc) => {
    if (!confirm(`למחוק "${d.title}"?`)) return;
    await delFn({ data: { token: getAdminToken()!, id: d.id } });
    toast.success("נמחק");
    qc.invalidateQueries({ queryKey: ["rag-documents"] });
  };

  const showPreview = async (d: Doc) => {
    try {
      const res = await previewFn({ data: { token: getAdminToken()!, id: d.id } });
      setPreview({ title: d.title, text: res.text || "(אין טקסט מחולץ)", chunks: res.chunks_count });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminShell title="בסיס הידע של ה-AI">
      <div className="text-sm text-[#A0907A] mb-4">
        קבצים אלו מועברים ל-AI לפני כל ניתוח פנייה
      </div>

      <div className="rounded-md border border-[#E0D8CC] bg-white/60 p-3 text-sm text-[#2D1B3D] mb-5 flex gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 text-[#BA9B78] shrink-0" />
        <div>מסמכים פעילים מועברים ל-AI לפני כל ניתוח פנייה. רק מסמכים שחילוץ הטקסט שלהם הושלם ייכללו בניתוח.</div>
      </div>

      {/* Upload */}
      <AdminCard className="mb-5">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[#E0D8CC] rounded-lg p-8 text-center cursor-pointer hover:border-[#BA9B78] transition"
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-[#BA9B78]" />
          <div className="text-[#2D1B3D]">גרור קובץ לכאן או לחץ לבחירה</div>
          <div className="text-xs text-[#A0907A] mt-1">PDF, DOCX, TXT עד 10MB</div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>

        {pending && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2 text-sm text-[#A0907A]">{pending.file.name} · {(pending.file.size / 1024).toFixed(0)} KB</div>
            <div>
              <label className="text-xs text-[#A0907A]">שם המסמך</label>
              <input className={inp} value={pending.title} onChange={(e) => setPending({ ...pending, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#A0907A]">תיאור קצר</label>
              <input className={inp} value={pending.description} onChange={(e) => setPending({ ...pending, description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-[#A0907A]">קטגוריה</label>
              <select className={inp} value={pending.category} onChange={(e) => setPending({ ...pending, category: e.target.value as Doc["category"] })}>
                <option value="org_profile">פרופיל העמותה והחזון</option>
                <option value="workshops_full">תיאור סדנאות והרצאות מלא</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#A0907A]">שפה</label>
              <select className={inp} value={pending.language} onChange={(e) => setPending({ ...pending, language: e.target.value as Doc["language"] })}>
                <option value="he">עברית</option>
                <option value="en">אנגלית</option>
                <option value="both">שתיהן</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              <SecondaryButton onClick={() => setPending(null)} disabled={uploading}>בטל</SecondaryButton>
              <PrimaryButton onClick={submitUpload} disabled={uploading || !pending.title.trim()}>
                {uploading ? "מעלה…" : "העלה מסמך"}
              </PrimaryButton>
            </div>
          </div>
        )}
      </AdminCard>

      {/* List */}
      <AdminCard>
        {isLoading ? (
          <div className="py-8 text-center text-[#A0907A]">טוען…</div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-[#A0907A]">
            עדיין לא הועלו מסמכים לבסיס הידע. העלי מסמך ראשון כדי לשפר את ניתוח ה-AI.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-right text-xs text-[#A0907A] border-b border-[#E0D8CC]">
                <tr>
                  <th className="py-2 px-2">שם המסמך</th>
                  <th className="py-2 px-2">קטגוריה</th>
                  <th className="py-2 px-2">שפה</th>
                  <th className="py-2 px-2">קובץ</th>
                  <th className="py-2 px-2">סטטוס חילוץ</th>
                  <th className="py-2 px-2">פעיל</th>
                  <th className="py-2 px-2">תאריך</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className={`border-b border-[#E0D8CC]/60 ${!d.is_active ? "opacity-50" : ""}`}>
                    <td className="py-2 px-2 max-w-xs">
                      <div className="text-[#2D1B3D]">{d.title}</div>
                      {d.description && <div className="text-xs text-[#A0907A] truncate">{d.description}</div>}
                    </td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[#BA9B78]/15 text-[#2D1B3D]">{CATEGORY_LABEL[d.category]}</span>
                    </td>
                    <td className="py-2 px-2 text-[#A0907A]">{LANG_LABEL[d.language]}</td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className="me-1">{FILE_ICON[d.file_type]}</span>
                      <span className="text-xs text-[#A0907A]">{d.file_type.toUpperCase()}</span>
                    </td>
                    <td className="py-2 px-2">
                      {d.extraction_status === "completed" && (
                        <span className="text-xs text-green-700">הושלם ✓ · {d.chars_total.toLocaleString()} תווים</span>
                      )}
                      {d.extraction_status === "pending" && (
                        <span className="text-xs text-[#A0907A]">בתהליך…</span>
                      )}
                      {d.extraction_status === "failed" && (
                        <span className="text-xs text-red-700" title={d.extraction_error || ""}>
                          שגיאה ✗
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => toggleActive(d)}
                        className={`relative inline-flex w-10 h-5 rounded-full transition ${d.is_active ? "bg-[#BA9B78]" : "bg-[#E0D8CC]"}`}
                        title={d.is_active ? "פעיל" : "כבוי"}
                      >
                        <span className={`absolute top-0.5 ${d.is_active ? "right-0.5" : "right-[1.375rem]"} w-4 h-4 rounded-full bg-white transition-all`} />
                      </button>
                    </td>
                    <td className="py-2 px-2 text-[#A0907A] whitespace-nowrap">{new Date(d.created_at).toLocaleDateString("he-IL")}</td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      <button title="תצוגה מקדימה" onClick={() => showPreview(d)} className="p-1 hover:text-[#BA9B78]"><Eye className="w-4 h-4" /></button>
                      <button title="חלץ מחדש" onClick={() => reextract(d)} className="p-1 hover:text-[#BA9B78]"><RefreshCw className="w-4 h-4" /></button>
                      <button title="מחק" onClick={() => remove(d)} className="p-1 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#E0D8CC] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#BA9B78]" />
              <h3 className="text-lg text-[#2D1B3D] flex-1">{preview.title}</h3>
              <span className="text-xs text-[#A0907A]">{preview.chunks} קטעים</span>
            </div>
            <div className="p-5 overflow-y-auto whitespace-pre-wrap text-sm text-[#2D1B3D] leading-relaxed">
              {preview.text}
            </div>
            <div className="px-5 py-3 border-t border-[#E0D8CC] text-end">
              <SecondaryButton onClick={() => setPreview(null)}>סגירה</SecondaryButton>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

const inp = "w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm";
