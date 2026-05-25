import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { listContent, saveContent } from "@/lib/admin/data.functions";
import { cmsUploadImage } from "@/lib/admin/cms.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Upload, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/content")({
  head: () => ({ meta: [{ title: "תוכן האתר | ניהול" }] }),
  component: ContentAdmin,
});

type FieldType = "text" | "image";
type FieldDef = {
  key: string;
  label: string;
  type?: FieldType; // default "text"
  long?: boolean;
  rows?: number;
  defaultHe?: string;
  defaultEn?: string;
  hint?: string;
};

const tabs: { id: string; label: string; keys: FieldDef[] }[] = [
  {
    id: "home",
    label: "דף הבית",
    keys: [
      { key: "home.hero.title", label: "כותרת Hero", defaultHe: "בית רגשי לילדים, לנוער ולקהילות" },
      { key: "home.hero.subtitle", label: "תת-כותרת Hero", long: true, rows: 3 },
      { key: "home.about.text", label: "טקסט מי אנחנו", long: true, rows: 6 },
      { key: "home.quote", label: "ציטוט", long: true, rows: 3 },
      { key: "home.cta.text", label: "טקסט באנר CTA" },
    ],
  },
  {
    id: "about",
    label: "אודות",
    keys: [
      {
        key: "about.main",
        label: "טקסט ראשי",
        long: true,
        rows: 10,
        defaultHe:
          "לגעת ברגש נולד מתובנה פשוטה: יותר מדי ילדים, נוער ומבוגרים נושאים בתוכם רגשות שאין להם מילים אליהם. הם גדלים בכיתות, במשפחות ובקהילות שלא תמיד נתנו מקום לדבר על מה שקורה בפנים.\n\nהמשימה שלנו היא להכניס מודעות רגשית, ביטוי, חוסן והעצמה אל המקומות שבהם החיים באמת קורים — בתי ספר, תנועות נוער, בתים וקהילות. לא כהרצאה, אלא כחוויה חיה.",
        defaultEn:
          "Touching Emotion was born from a simple insight: too many children, teens and adults carry feelings they have no language for...",
      },
      { key: "about.hero.image1", label: "תמונה ראשית (גדולה משמאל)", type: "image", hint: "תמונה אנכית — מומלץ יחס 3:4" },
      { key: "about.hero.image2", label: "תמונה עליונה (ימין)", type: "image", hint: "תמונה ריבועית" },
      { key: "about.hero.image3", label: "תמונה תחתונה (ימין)", type: "image", hint: "תמונה ריבועית" },
    ],
  },
  {
    id: "workshops",
    label: "סדנאות",
    keys: [
      { key: "workshops.title", label: "כותרת דף", defaultHe: "סדנאות" },
      { key: "workshops.subtitle", label: "תת-כותרת", long: true, rows: 3 },
    ],
  },
];

type Row = { key: string; value_he: string | null; value_en: string | null };

function ContentAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listContent);
  const saveFn = useServerFn(saveContent);
  const uploadFn = useServerFn(cmsUploadImage);
  const { data } = useQuery({ queryKey: ["admin-content"], queryFn: () => listFn({ data: { token: getAdminToken()! } }) });

  const [tab, setTab] = useState(tabs[0].id);
  const [edits, setEdits] = useState<Record<string, { he: string; en: string }>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadKey = useRef<string | null>(null);

  useEffect(() => {
    const map: Record<string, { he: string; en: string }> = {};
    for (const r of (data?.rows || []) as Row[]) map[r.key] = { he: r.value_he || "", en: r.value_en || "" };
    setEdits(map);
  }, [data]);

  const current = tabs.find((t) => t.id === tab)!;
  const dirty = useMemo(() => {
    const orig: Record<string, Row> = {};
    for (const r of (data?.rows || []) as Row[]) orig[r.key] = r;
    return current.keys.some(({ key }) => {
      const e = edits[key] || { he: "", en: "" };
      const o = orig[key];
      return (e.he || "") !== (o?.value_he || "") || (e.en || "") !== (o?.value_en || "");
    });
  }, [edits, data, current]);

  const save = async () => {
    const items = current.keys.map(({ key }) => ({ key, value_he: edits[key]?.he ?? "", value_en: edits[key]?.en ?? "" }));
    try {
      await saveFn({ data: { token: getAdminToken()!, items } });
      toast.success("נשמר בהצלחה");
      qc.invalidateQueries({ queryKey: ["admin-content"] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
    } catch (e) { toast.error((e as Error).message); }
  };
  const reset = () => {
    const map = { ...edits };
    for (const r of (data?.rows || []) as Row[]) if (current.keys.some((k) => k.key === r.key)) map[r.key] = { he: r.value_he || "", en: r.value_en || "" };
    setEdits(map);
  };

  const triggerUpload = (key: string) => {
    currentUploadKey.current = key;
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = currentUploadKey.current;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !key) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("הקובץ גדול מ-5MB"); return; }
    setUploadingKey(key);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res((r.result as string).split(",")[1]);
        r.onerror = () => rej(r.error);
        r.readAsDataURL(file);
      });
      const out = await uploadFn({ data: { token: getAdminToken()!, table: "media", filename: file.name, contentType: file.type, base64: b64 } });
      setEdits((p) => ({ ...p, [key]: { he: out.url, en: out.url } }));
      toast.success("התמונה הועלתה — אל תשכח/י לשמור");
    } catch (err) { toast.error((err as Error).message); }
    finally { setUploadingKey(null); currentUploadKey.current = null; }
  };

  return (
    <AdminShell title="תוכן האתר">
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm ${t.id === tab ? "bg-[#2D1B3D] text-white" : "bg-white border border-[#E0D8CC] text-[#2D1B3D]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      <AdminCard>
        <div className="space-y-5">
          {current.keys.map((f) => {
            const v = edits[f.key] || { he: "", en: "" };
            if (f.type === "image") {
              return (
                <div key={f.key} className="pb-4 border-b border-[#EDE6DC] last:border-0">
                  <div className="text-sm font-medium text-[#2D1B3D] mb-1">{f.label}</div>
                  {f.hint && <div className="text-xs text-[#A0907A] mb-2">{f.hint}</div>}
                  <div className="flex items-start gap-3">
                    <div className="w-28 h-28 bg-[#EDE6DC] rounded-md overflow-hidden flex-shrink-0 border border-[#E0D8CC]">
                      {v.he ? <img src={v.he} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#A0907A] text-xs">אין תמונה</div>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input dir="ltr" className={inp} placeholder="URL של תמונה" value={v.he}
                        onChange={(e) => setEdits({ ...edits, [f.key]: { he: e.target.value, en: e.target.value } })} />
                      <div className="flex gap-2">
                        <SecondaryButton onClick={() => triggerUpload(f.key)} disabled={uploadingKey === f.key}>
                          <Upload className="w-4 h-4 inline ml-1" />{uploadingKey === f.key ? "מעלה..." : "העלאת תמונה"}
                        </SecondaryButton>
                        {v.he && (
                          <SecondaryButton onClick={() => setEdits({ ...edits, [f.key]: { he: "", en: "" } })}>
                            הסרה
                          </SecondaryButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            const long = f.long;
            const rows = f.rows || (long ? 5 : 2);
            return (
              <div key={f.key} className="pb-4 border-b border-[#EDE6DC] last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-[#2D1B3D]">{f.label}</div>
                  {(f.defaultHe || f.defaultEn) && (
                    <button
                      type="button"
                      className="text-xs text-[#BA9B78] hover:text-[#2D1B3D] flex items-center gap-1"
                      onClick={() => setEdits({ ...edits, [f.key]: { he: f.defaultHe || "", en: f.defaultEn || "" } })}
                    >
                      <RotateCcw className="w-3 h-3" />טען טקסט ברירת מחדל
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <textarea dir="rtl" rows={rows} className={inp}
                    value={v.he}
                    placeholder={f.defaultHe || "עברית"}
                    onChange={(e) => setEdits({ ...edits, [f.key]: { ...v, he: e.target.value } })} />
                  <textarea dir="ltr" rows={rows} className={inp + " text-left"}
                    value={v.en}
                    placeholder={f.defaultEn || "English"}
                    onChange={(e) => setEdits({ ...edits, [f.key]: { ...v, en: e.target.value } })} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-5 sticky bottom-0 bg-white pt-3">
          <SecondaryButton onClick={reset} disabled={!dirty}>בטל שינויים</SecondaryButton>
          <PrimaryButton onClick={save} disabled={!dirty}>שמור שינויים</PrimaryButton>
        </div>
      </AdminCard>
    </AdminShell>
  );
}

const inp = "w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm focus:outline-none focus:border-[#BA9B78]";
