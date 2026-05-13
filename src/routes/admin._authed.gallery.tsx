import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton } from "@/components/admin/AdminShell";
import { listGallery, uploadGalleryImage, toggleGalleryFeatured, deleteGalleryImage, reorderGallery, setGalleryCategory, setGalleryCategoriesBulk } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Star, Trash2, ChevronUp, ChevronDown, Upload, Info, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/gallery")({
  head: () => ({ meta: [{ title: "גלריה | ניהול" }] }),
  component: GalleryAdmin,
});

type Img = { id: string; url: string; featured: boolean; order_index: number; category: string };

const CATEGORIES = ["סדנה", "הכשרה", "הרצאה", "מפגש קהילתי", "ערב עיון", "כללי"] as const;
type Category = (typeof CATEGORIES)[number];

function GalleryAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listGallery);
  const upFn = useServerFn(uploadGalleryImage);
  const togFn = useServerFn(toggleGalleryFeatured);
  const delFn = useServerFn(deleteGalleryImage);
  const reFn = useServerFn(reorderGallery);
  const catFn = useServerFn(setGalleryCategory);
  const bulkCatFn = useServerFn(setGalleryCategoriesBulk);

  const { data } = useQuery({ queryKey: ["admin-gallery"], queryFn: () => listFn({ data: { token: getAdminToken()! } }) });
  const rows = (data?.rows || []) as Img[];
  const featuredCount = rows.filter((r) => r.featured).length;

  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [pendingClassify, setPendingClassify] = useState<{ id: string; url: string; category: Category }[]>([]);
  const [savingClassify, setSavingClassify] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const uploaded: { id: string; url: string; category: Category }[] = [];
    for (const f of Array.from(files)) {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { toast.error(`${f.name}: סוג קובץ לא נתמך`); continue; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name}: גדול מ-5MB`); continue; }
      setBusy((n) => n + 1);
      try {
        const b64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(f);
        });
        const res = await upFn({ data: { token: getAdminToken()!, filename: f.name, contentType: f.type, base64: b64 } });
        if (res?.id && res?.url) uploaded.push({ id: res.id, url: res.url, category: "כללי" });
      } catch (e) { toast.error(`${f.name}: ${(e as Error).message}`); }
      finally { setBusy((n) => n - 1); }
    }
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    if (uploaded.length > 0) setPendingClassify((p) => [...p, ...uploaded]);
    if (rows.length >= 45) toast.warning("מתקרבים למקסימום (50 תמונות)");
  };

  const toggle = async (img: Img) => {
    try {
      await togFn({ data: { token: getAdminToken()!, id: img.id, featured: !img.featured } });
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success(!img.featured ? "התמונה סומנה לדף הבית" : "התמונה הוסרה מדף הבית");
    } catch (e) { toast.error((e as Error).message); }
  };
  const remove = async (img: Img) => {
    if (!confirm("למחוק את התמונה?")) return;
    try {
      await delFn({ data: { token: getAdminToken()!, id: img.id } });
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success("התמונה נמחקה");
    } catch (e) { toast.error((e as Error).message); }
  };
  const move = async (img: Img, dir: "up" | "down") => {
    await reFn({ data: { token: getAdminToken()!, id: img.id, direction: dir } });
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
  };
  const changeCategory = async (img: Img, category: Category) => {
    try {
      await catFn({ data: { token: getAdminToken()!, id: img.id, category } });
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      toast.success("הסיווג עודכן");
    } catch (e) { toast.error((e as Error).message); }
  };

  const saveClassify = async () => {
    if (pendingClassify.length === 0) return;
    setSavingClassify(true);
    try {
      await bulkCatFn({ data: { token: getAdminToken()!, items: pendingClassify.map((p) => ({ id: p.id, category: p.category })) } });
      toast.success("הסיווג נשמר");
      setPendingClassify([]);
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setSavingClassify(false); }
  };

  return (
    <AdminShell title="גלריה">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="bg-[#BA9B78]/10 border border-[#BA9B78]/35 rounded-lg p-4 flex items-start gap-3 text-sm text-[#2D1B3D] flex-1 min-w-[260px]">
          <Info className="w-5 h-5 text-[#BA9B78] flex-shrink-0 mt-0.5" />
          <div>תמונות מסומנות בכוכב ⭐ יוצגו בדף הבית. השאר יוצגו בדף הגלריה בלבד. מקסימום 8 תמונות לדף הבית. ({featuredCount}/8 מסומנות)</div>
        </div>
        <a href="/gallery" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D1B3D] text-white rounded-lg text-sm hover:bg-[#3d2851] transition">
          <ExternalLink className="w-4 h-4" />
          צפי באתר
        </a>
      </div>

      <AdminCard className="mb-6">
        <div onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="border-2 border-dashed border-[#E0D8CC] rounded-lg p-8 text-center cursor-pointer hover:border-[#BA9B78] transition">
          <Upload className="w-8 h-8 mx-auto mb-2 text-[#BA9B78]" />
          <div className="text-[#2D1B3D]">גרור תמונות לכאן או לחץ לבחירה</div>
          <div className="text-xs text-[#A0907A] mt-1">JPG, PNG, WEBP · עד 5MB לתמונה</div>
          {busy > 0 && <div className="text-xs text-[#BA9B78] mt-2">מעלה {busy} קבצים...</div>}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
            onChange={(e) => { handleFiles(e.target.files); if (inputRef.current) inputRef.current.value = ""; }} />
        </div>
      </AdminCard>

      {pendingClassify.length > 0 && (
        <AdminCard className="mb-6 border-[#BA9B78]/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-[#2D1B3D]">סיווג תמונות חדשות</h3>
              <p className="text-xs text-[#A0907A] mt-1">בחרי קטגוריה לכל תמונה ושמרי</p>
            </div>
            <PrimaryButton onClick={saveClassify} disabled={savingClassify}>
              {savingClassify ? "שומר..." : "שמור סיווג"}
            </PrimaryButton>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pendingClassify.map((p, i) => (
              <div key={p.id} className="bg-[#F5F0E8] border border-[#E0D8CC] rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-[#EDE6DC]">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </div>
                <select
                  value={p.category}
                  onChange={(e) => {
                    const v = e.target.value as Category;
                    setPendingClassify((arr) => arr.map((x, idx) => idx === i ? { ...x, category: v } : x));
                  }}
                  className="w-full text-[11px] bg-[#F5F0E8] border-t border-[#E0D8CC] px-2 py-1.5 focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {rows.length === 0 && <div className="col-span-full text-center text-[#A0907A] py-8">אין תמונות עדיין.</div>}
        {rows.map((img, i) => (
          <div key={img.id} className="relative group bg-white border border-[#E0D8CC] rounded-lg overflow-hidden">
            <div className="aspect-[4/3] bg-[#EDE6DC] relative">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => toggle(img)}
                className={`absolute top-2 right-2 p-1.5 rounded-full ${img.featured ? "bg-[#BA9B78] text-white" : "bg-white/80 text-gray-500"}`}
                title={img.featured ? "מוצגת בדף הבית" : "סמן לדף הבית"}>
                <Star className={`w-4 h-4 ${img.featured ? "fill-white" : ""}`} />
              </button>
              {img.featured && <span className="absolute top-2 left-2 bg-[#BA9B78] text-white text-[10px] px-2 py-0.5 rounded">דף הבית</span>}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button onClick={() => move(img, "up")} disabled={i === 0} className="p-2 rounded bg-white/90 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => move(img, "down")} disabled={i === rows.length - 1} className="p-2 rounded bg-white/90 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => remove(img)} className="p-2 rounded bg-red-500 text-white"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <select
              value={(img.category as Category) || "כללי"}
              onChange={(e) => changeCategory(img, e.target.value as Category)}
              className="w-full text-[11px] bg-[#F5F0E8] border-t border-[#E0D8CC] px-2 py-1.5 focus:outline-none rounded-b-md"
              style={{ borderRadius: 6 }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
