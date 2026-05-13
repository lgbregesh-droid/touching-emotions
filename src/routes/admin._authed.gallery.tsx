import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { AdminShell, AdminCard } from "@/components/admin/AdminShell";
import { listGallery, uploadGalleryImage, toggleGalleryFeatured, deleteGalleryImage, reorderGallery } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Star, Trash2, ChevronUp, ChevronDown, Upload, Info, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/gallery")({
  head: () => ({ meta: [{ title: "גלריה | ניהול" }] }),
  component: GalleryAdmin,
});

type Img = { id: string; url: string; featured: boolean; order_index: number };

function GalleryAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listGallery);
  const upFn = useServerFn(uploadGalleryImage);
  const togFn = useServerFn(toggleGalleryFeatured);
  const delFn = useServerFn(deleteGalleryImage);
  const reFn = useServerFn(reorderGallery);

  const { data } = useQuery({ queryKey: ["admin-gallery"], queryFn: () => listFn({ data: { token: getAdminToken()! } }) });
  const rows = (data?.rows || []) as Img[];
  const featuredCount = rows.filter((r) => r.featured).length;

  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
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
        await upFn({ data: { token: getAdminToken()!, filename: f.name, contentType: f.type, base64: b64 } });
      } catch (e) { toast.error(`${f.name}: ${(e as Error).message}`); }
      finally { setBusy((n) => n - 1); }
    }
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
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
  const remove = async (img: Img) => {
    if (!confirm("למחוק את התמונה?")) return;
    await delFn({ data: { token: getAdminToken()!, id: img.id } });
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
  };
  const move = async (img: Img, dir: "up" | "down") => {
    await reFn({ data: { token: getAdminToken()!, id: img.id, direction: dir } });
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
  };

  return (
    <AdminShell title="גלריה">
      <div className="bg-[#BA9B78]/10 border border-[#BA9B78]/35 rounded-lg p-4 mb-4 flex items-start gap-3 text-sm text-[#2D1B3D]">
        <Info className="w-5 h-5 text-[#BA9B78] flex-shrink-0 mt-0.5" />
        <div>תמונות מסומנות בכוכב ⭐ יוצגו גם בדף הבית. שאר התמונות יוצגו בדף הגלריה בלבד. מקסימום 8 תמונות לדף הבית. ({featuredCount}/8 מסומנות)</div>
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {rows.length === 0 && <div className="col-span-full text-center text-[#A0907A] py-8">אין תמונות עדיין.</div>}
        {rows.map((img, i) => (
          <div key={img.id} className="relative group bg-white border border-[#E0D8CC] rounded-lg overflow-hidden">
            <div className="aspect-[4/3] bg-[#EDE6DC]">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
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
        ))}
      </div>
    </AdminShell>
  );
}
