import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./auth.functions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = supabaseAdmin;
const tokenField = { token: z.string().min(1) };

// Tables allowed through the generic CMS endpoints
const TABLE = z.enum(["lectures", "testimonials", "support_items", "faq", "site_settings", "media"]);
type CmsTable = z.infer<typeof TABLE>;

const BUCKET_BY_TABLE: Record<CmsTable, string> = {
  lectures: "lectures",
  testimonials: "testimonials",
  support_items: "support",
  faq: "media",
  site_settings: "media",
  media: "media",
};

// ---------- Generic CRUD ----------

export const cmsList = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, table: TABLE }).parse(i))
  .handler(async ({ data }) => {
    const orderCol = data.table === "site_settings" || data.table === "media" ? "created_at" : "order_index";
    const ascending = orderCol === "order_index";
    const { data: rows, error } = await db
      .from(data.table)
      .select("*")
      .order(orderCol, { ascending });
    if (error) throw new Error(error.message);
    return { rows: rows || [] };
  });

export const cmsUpsert = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({
      ...tokenField,
      table: TABLE,
      id: z.string().uuid().optional(),
      values: z.record(z.string(), z.any()),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const v = { ...data.values };
    // sanitize: strip nulls for empty string fields, coerce booleans
    for (const k of Object.keys(v)) {
      if (v[k] === "") v[k] = null;
    }
    if (data.id) {
      const { error } = await db.from(data.table).update(v).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      // auto order_index if relevant
      if ("order_index" in v && (v.order_index === undefined || v.order_index === null)) {
        const { count } = await db.from(data.table).select("id", { count: "exact", head: true });
        v.order_index = (count || 0) + 1;
      }
      const { error } = await db.from(data.table).insert(v);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const cmsDelete = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, table: TABLE, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await db.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cmsReorder = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, table: TABLE, id: z.string().uuid(), direction: z.enum(["up", "down"]) }).parse(i))
  .handler(async ({ data }) => {
    const { data: all } = await db.from(data.table).select("id,order_index").order("order_index");
    if (!all) return { ok: true };
    const idx = all.findIndex((r: { id: string }) => r.id === data.id);
    const swapIdx = data.direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return { ok: true };
    const a = all[idx], b = all[swapIdx];
    await db.from(data.table).update({ order_index: b.order_index }).eq("id", a.id);
    await db.from(data.table).update({ order_index: a.order_index }).eq("id", b.id);
    return { ok: true };
  });

// ---------- Image upload (returns public URL) ----------

export const cmsUploadImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({
      ...tokenField,
      table: TABLE,
      filename: z.string().min(1).max(200),
      contentType: z.string().min(1).max(100),
      base64: z.string().min(1),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(data.contentType)) throw new Error("סוג קובץ לא נתמך");
    const buf = Buffer.from(data.base64, "base64");
    if (buf.length > 5 * 1024 * 1024) throw new Error("הקובץ גדול מ-5MB");
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bucket = BUCKET_BY_TABLE[data.table];
    const { error: upErr } = await supabaseAdmin.storage.from(bucket).upload(path, buf, {
      contentType: data.contentType,
      upsert: false,
    });
    if (upErr) throw new Error(upErr.message);
    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return { url: pub.publicUrl };
  });

// ---------- Extended dashboard counters ----------

export const getCmsCounters = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const [ws, tt] = await Promise.all([
      db.from("workshops").select("id", { count: "exact", head: true }).eq("is_active", true),
      db.from("testimonials").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    return { activeWorkshops: ws.count || 0, activeTestimonials: tt.count || 0 };
  });
