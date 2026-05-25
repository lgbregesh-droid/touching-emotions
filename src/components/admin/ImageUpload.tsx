import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cmsUploadImage } from "@/lib/admin/cms.functions";
import { getAdminToken } from "@/lib/admin/session";

type Table = "lectures" | "testimonials" | "support_items" | "faq" | "site_settings" | "media" | "workshops" | "products";

export function ImageUpload({
  value,
  onChange,
  table,
  label = "תמונה",
}: {
  value?: string | null;
  onChange: (url: string) => void;
  table: Table;
  label?: string;
}) {
  const upFn = useServerFn(cmsUploadImage);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file: File) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { toast.error("סוג קובץ לא נתמך"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("הקובץ גדול מ-5MB"); return; }
    setBusy(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res((r.result as string).split(",")[1]);
        r.onerror = () => rej(r.error);
        r.readAsDataURL(file);
      });
      const out = await upFn({ data: { token: getAdminToken()!, table, filename: file.name, contentType: file.type, base64: b64 } });
      onChange(out.url);
      toast.success("התמונה הועלתה");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="text-xs text-[#A0907A] mb-1">{label}</div>
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative">
            <img src={value} alt="" className="w-24 h-24 object-cover rounded-md border border-[#E0D8CC]" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-2 -left-2 w-6 h-6 bg-white border border-[#E0D8CC] rounded-full flex items-center justify-center hover:bg-red-50"
              title="הסר תמונה"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-md border border-dashed border-[#E0D8CC] bg-[#F5F0E8] flex items-center justify-center text-[10px] text-[#A0907A]">אין תמונה</div>
        )}
        <div className="flex-1 space-y-2">
          <input
            dir="ltr"
            className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm"
            placeholder="URL או העלה קובץ"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#E0D8CC] rounded-md text-sm text-[#2D1B3D] hover:bg-[#F5F0E8] disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {busy ? "מעלה..." : "העלאת תמונה"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handle(f);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}
