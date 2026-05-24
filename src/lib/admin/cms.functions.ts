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

// ---------- AI: analyze testimonial image ----------

export const aiAnalyzeTestimonialImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({
      ...tokenField,
      contentType: z.string().min(1).max(100),
      base64: z.string().min(1),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(data.contentType)) throw new Error("סוג קובץ לא נתמך");
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY חסר");

    const tool = {
      type: "function" as const,
      function: {
        name: "extract_testimonial",
        description: "Extract testimonial fields from the image (screenshot of WhatsApp / message / handwritten note / etc.)",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "שם הממליץ/ה. אם לא ניתן לזהות — מחרוזת ריקה." },
            role: { type: "string", description: "תפקיד / שיוך (למשל: אמא לתלמיד, מנהלת בית ספר). אם לא ידוע — ריק." },
            text: { type: "string", description: "תוכן ההמלצה כפי שכתוב בתמונה, בעברית, ללא ציטוטים מיותרים." },
            category: { type: "string", description: "קטגוריה: הורה / מנהלת / מתנדבת / מורה / אחר. אם לא ברור — ריק." },
          },
          required: ["name", "role", "text", "category"],
          additionalProperties: false,
        },
      },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              'את מקבלת תמונה של המלצה (צילום מסך מוואטסאפ, מייל, פתק, או דף כתוב). חלצי את שם הממליץ/ה, התפקיד/שיוך אם מצוין, את גוף ההמלצה בעברית, וקטגוריה. אל תמציאי פרטים — אם משהו לא מופיע, החזירי מחרוזת ריקה.',
          },
          {
            role: "user",
            content: [
              { type: "text", text: "חלצי את פרטי ההמלצה מהתמונה." },
              { type: "image_url", image_url: { url: `data:${data.contentType};base64,${data.base64}` } },
            ],
          },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "extract_testimonial" } },
        temperature: 0.2,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("חרגנו ממגבלת השימוש ב-AI. נסי שוב בעוד דקה.");
      if (res.status === 402) throw new Error("נגמרו הקרדיטים ל-AI. יש להוסיף קרדיט ב-Lovable Cloud.");
      throw new Error(`AI gateway error (${res.status}): ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    };
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("ה-AI לא החזיר תוצאה מובנית");
    const parsed = JSON.parse(args) as { name: string; role: string; text: string; category: string };
    return { values: parsed };
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

