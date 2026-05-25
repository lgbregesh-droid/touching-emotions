import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./auth.functions";

const tokenField = { token: z.string().min(1) };

// ---------- Dashboard summary ----------
export const getDashboard = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const safe = async <T,>(p: Promise<T>): Promise<T | null> => {
      try { return await p; } catch { return null; }
    };

    const [
      pendingContacts,
      newVolunteers,
      pendingOrders,
      upcomingEventsCount,
      nextEvent,
      recentContacts,
      recentVolunteers,
      recentRegs,
      recentOrders,
      recentActiveVol,
      recentLinkedin,
      lastLinkedin,
      analyses,
      urgentContactsRaw,
    ] = await Promise.all([
      safe(supabaseAdmin.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new").then((r) => r.count || 0)),
      safe(supabaseAdmin.from("volunteers").select("id", { count: "exact", head: true }).gte("created_at", weekAgo).then((r) => r.count || 0)),
      safe(supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).eq("shipping_status", "pending").then((r) => r.count || 0)),
      safe(supabaseAdmin.from("events").select("id", { count: "exact", head: true }).gte("date", today).eq("status", "active").then((r) => r.count || 0)),
      safe(supabaseAdmin.from("events").select("id,title_he,title_en,date,time,location_he,max_spots,spots_remaining").gte("date", today).eq("status", "active").order("date", { ascending: true }).limit(1).then((r) => r.data?.[0] || null)),
      safe(supabaseAdmin.from("contact_messages").select("id,name,full_name,subject,inquiry_type,created_at,ai_status,email_status,status").order("created_at", { ascending: false }).limit(8).then((r) => r.data || [])),
      safe(supabaseAdmin.from("volunteers").select("id,name,created_at,ai_status,email_status,status").order("created_at", { ascending: false }).limit(8).then((r) => r.data || [])),
      safe(supabaseAdmin.from("event_registrations").select("id,name,event_id,created_at,ai_status,email_status").order("created_at", { ascending: false }).limit(8).then((r) => r.data || [])),
      safe(supabaseAdmin.from("orders").select("id,buyer_name,quantity,created_at,ai_status,email_status,shipping_status").order("created_at", { ascending: false }).limit(8).then((r) => r.data || [])),
      safe(supabaseAdmin.from("active_volunteers").select("id,name,created_at").order("created_at", { ascending: false }).limit(5).then((r) => r.data || [])),
      safe(supabaseAdmin.from("linkedin_posts").select("id,final_text_he,final_text_en,linkedin_status,created_at,published_at,published_language").eq("linkedin_status", "published").order("created_at", { ascending: false }).limit(5).then((r) => r.data || [])),
      safe(supabaseAdmin.from("linkedin_posts").select("id,final_text_he,final_text_en,linkedin_status,created_at,published_at,published_language,topic").order("created_at", { ascending: false }).limit(1).then((r) => r.data?.[0] || null)),
      safe(supabaseAdmin.from("ai_submission_analysis").select("submission_id,submission_table,urgency_level,short_summary,ai_status").eq("ai_status", "completed").order("created_at", { ascending: false }).limit(50).then((r) => r.data || [])),
      safe(supabaseAdmin.from("contact_messages").select("id,name,full_name,inquiry_type,subject,created_at").order("created_at", { ascending: false }).limit(50).then((r) => r.data || [])),
    ]);

    const analysisByKey = new Map<string, { urgency_level?: string | null; short_summary?: string | null }>();
    for (const a of analyses || []) {
      analysisByKey.set(`${a.submission_table}:${a.submission_id}`, { urgency_level: a.urgency_level, short_summary: a.short_summary });
    }

    const urgentLevels = ["דורשת מענה מהיר", "חשובה"];
    const urgent = ((urgentContactsRaw || []) as Array<{ id: string; name?: string | null; full_name?: string | null; inquiry_type?: string | null; subject?: string | null; created_at: string }>)
      .map((c) => {
        const a = analysisByKey.get(`contact_messages:${c.id}`);
        if (!a || !a.urgency_level || !urgentLevels.includes(a.urgency_level)) return null;
        return {
          id: c.id,
          name: c.full_name || c.name || "—",
          inquiry_type: c.inquiry_type || c.subject || "פנייה",
          urgency_level: a.urgency_level,
          short_summary: a.short_summary || "",
          created_at: c.created_at,
        };
      })
      .filter(Boolean)
      .slice(0, 8);

    type Activity = { kind: string; id: string; title: string; date: string; ai_status?: string | null; email_status?: string | null; urgency?: string | null };
    const activity: Activity[] = [];
    for (const r of (recentContacts || []) as Array<{ id: string; name?: string | null; full_name?: string | null; subject?: string | null; created_at: string; ai_status?: string | null; email_status?: string | null }>) {
      const a = analysisByKey.get(`contact_messages:${r.id}`);
      activity.push({ kind: "contact", id: r.id, title: `פנייה חדשה — ${r.full_name || r.name || "—"}${r.subject ? ` — ${r.subject}` : ""}`, date: r.created_at, ai_status: r.ai_status, email_status: r.email_status, urgency: a?.urgency_level });
    }
    for (const r of (recentVolunteers || []) as Array<{ id: string; name: string; created_at: string; ai_status?: string | null; email_status?: string | null }>) {
      const a = analysisByKey.get(`volunteers:${r.id}`);
      activity.push({ kind: "volunteer", id: r.id, title: `בקשת התנדבות — ${r.name}`, date: r.created_at, ai_status: r.ai_status, email_status: r.email_status, urgency: a?.urgency_level });
    }
    for (const r of (recentRegs || []) as Array<{ id: string; name: string; created_at: string; ai_status?: string | null; email_status?: string | null }>) {
      activity.push({ kind: "registration", id: r.id, title: `הרשמה לאירוע — ${r.name}`, date: r.created_at, ai_status: r.ai_status, email_status: r.email_status });
    }
    for (const r of (recentOrders || []) as Array<{ id: string; buyer_name: string; quantity: number; created_at: string; ai_status?: string | null; email_status?: string | null }>) {
      activity.push({ kind: "order", id: r.id, title: `הזמנה חדשה — קלפים × ${r.quantity}`, date: r.created_at, ai_status: r.ai_status, email_status: r.email_status });
    }
    for (const r of (recentActiveVol || []) as Array<{ id: string; name: string; created_at: string }>) {
      activity.push({ kind: "active_volunteer", id: r.id, title: `מתנדב חדש הצטרף — ${r.name}`, date: r.created_at });
    }
    for (const r of (recentLinkedin || []) as Array<{ id: string; final_text_he?: string | null; final_text_en?: string | null; created_at: string; published_at?: string | null }>) {
      const txt = (r.final_text_he || r.final_text_en || "").slice(0, 50);
      activity.push({ kind: "linkedin", id: r.id, title: `פוסט לינקדאין פורסם — ${txt}`, date: r.published_at || r.created_at });
    }
    activity.sort((a, b) => +new Date(b.date) - +new Date(a.date));

    return {
      stats: {
        pendingContacts: pendingContacts ?? 0,
        newVolunteers: newVolunteers ?? 0,
        pendingOrders: pendingOrders ?? 0,
        upcomingEvents: upcomingEventsCount ?? 0,
      },
      urgent,
      nextEvent,
      activity: activity.slice(0, 8),
      lastLinkedin,
    };
  });


// ---------- Inquiries ----------
export const listInquiries = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, kind: z.enum(["contact", "volunteer"]) }).parse(i))
  .handler(async ({ data }) => {
    const table = data.kind === "contact" ? "contact_messages" : "volunteers";
    const { data: rows, error } = await supabaseAdmin.from(table).select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows };
  });

export const setInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, kind: z.enum(["contact", "volunteer"]), id: z.string().uuid(), status: z.enum(["new", "handled"]) }).parse(i))
  .handler(async ({ data }) => {
    const table = data.kind === "contact" ? "contact_messages" : "volunteers";
    const { error } = await supabaseAdmin.from(table).update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteInquiry = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, kind: z.enum(["contact", "volunteer"]), id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const table = data.kind === "contact" ? "contact_messages" : "volunteers";
    const { error } = await supabaseAdmin.from(table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Workshops ----------
const WorkshopSchema = z.object({
  name_he: z.string().min(1).max(200),
  name_en: z.string().max(200).optional().nullable(),
  desc_he: z.string().max(2000).optional().nullable(),
  desc_en: z.string().max(2000).optional().nullable(),
  full_description: z.string().max(8000).optional().nullable(),
  audience: z.string().max(200).optional().nullable(),
  image_url: z.string().max(1000).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  duration_text: z.string().max(200).optional().nullable(),
  goals_list: z.string().max(500).optional().nullable(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

export const listWorkshops = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin.from("workshops").select("*, registrants:workshop_registrants(count)").order("date", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return { rows: data };
  });

export const upsertWorkshop = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid().optional(), values: WorkshopSchema }).parse(i))
  .handler(async ({ data }) => {
    if (data.id) {
      const { error } = await supabaseAdmin.from("workshops").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("workshops").insert(data.values);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteWorkshop = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("workshops").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateWorkshop = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: src, error } = await supabaseAdmin.from("workshops").select("*").eq("id", data.id).single();
    if (error || !src) throw new Error(error?.message || "Not found");
    const { id, created_at, updated_at, ...rest } = src as Record<string, unknown>;
    void id; void created_at; void updated_at;
    (rest as Record<string, unknown>).status = "closed";
    (rest as Record<string, unknown>).name_he = `${(rest as { name_he: string }).name_he} (העתק)`;
    const { error: e2 } = await supabaseAdmin.from("workshops").insert(rest as never);
    if (e2) throw new Error(e2.message);
    return { ok: true };
  });

export const listWorkshopRegistrants = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, workshop_id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin.from("workshop_registrants").select("*").eq("workshop_id", data.workshop_id).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows };
  });

// ---------- Shop ----------
const ProductValues = z.object({
  name_he: z.string().min(1).max(200),
  name_en: z.string().max(200).optional().nullable(),
  desc_he: z.string().max(2000).optional().nullable(),
  desc_en: z.string().max(2000).optional().nullable(),
  price: z.number().min(0),
  image_url: z.string().max(1000).optional().nullable(),
  in_stock: z.boolean(),
});

export const listProducts = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { rows: data };
  });

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, values: ProductValues }).parse(i))
  .handler(async ({ data }) => {
    const slug = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabaseAdmin.from("products").insert({ ...data.values, slug });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateProductById = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid(), values: ProductValues }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("products").update(data.values).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProductById = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Legacy single-product fns (kept for compatibility — unused by new UI)
export const getProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin.from("products").select("*").eq("slug", "cards").maybeSingle();
    if (error) throw new Error(error.message);
    return { product: data };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, values: ProductValues }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("products").update(data.values).eq("slug", "cards");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data };
  });

export const setOrderShipping = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid(), status: z.enum(["pending", "shipped", "delivered"]) }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("orders").update({ shipping_status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Donations ----------
export const listDonations = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin.from("donations").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const month = (data || []).filter((r) => new Date(r.created_at) >= monthStart && r.status === "success").reduce((s, r) => s + Number(r.amount), 0);
    const year = (data || []).filter((r) => new Date(r.created_at) >= yearStart && r.status === "success").reduce((s, r) => s + Number(r.amount), 0);
    const recurring = (data || []).filter((r) => r.type === "recurring" && r.status === "success").length;
    return { rows: data, month, year, recurring };
  });

// ---------- Site content ----------
export const listContent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin.from("site_content").select("*").order("key");
    if (error) throw new Error(error.message);
    return { rows: data };
  });

export const saveContent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({
      ...tokenField,
      items: z.array(z.object({
        key: z.string().min(1).max(100),
        value_he: z.string().max(5000).nullable().optional(),
        value_en: z.string().max(5000).nullable().optional(),
      })).max(50),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    for (const it of data.items) {
      const { error } = await supabaseAdmin
        .from("site_content")
        .upsert({ key: it.key, value_he: it.value_he ?? null, value_en: it.value_en ?? null }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Gallery ----------
export const listGallery = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin.from("gallery").select("*").order("order_index", { ascending: true }).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data };
  });

export const uploadGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({
      ...tokenField,
      filename: z.string().min(1).max(200),
      contentType: z.string().min(1).max(100),
      base64: z.string().min(1),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buf = Buffer.from(data.base64, "base64");
    if (buf.length > 5 * 1024 * 1024) throw new Error("הקובץ גדול מ-5MB");
    const { error: upErr } = await supabaseAdmin.storage.from("gallery").upload(path, buf, {
      contentType: data.contentType,
      upsert: false,
    });
    if (upErr) throw new Error(upErr.message);
    const { data: pub } = supabaseAdmin.storage.from("gallery").getPublicUrl(path);
    const { count } = await supabaseAdmin.from("gallery").select("id", { count: "exact", head: true });
    const { data: ins, error: insErr } = await supabaseAdmin.from("gallery").insert({
      url: pub.publicUrl,
      storage_path: path,
      order_index: (count || 0) + 1,
      featured: false,
    }).select("id").single();
    if (insErr) throw new Error(insErr.message);
    return { ok: true, url: pub.publicUrl, id: ins.id as string };
  });

export const toggleGalleryFeatured = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid(), featured: z.boolean() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("gallery").update({ featured: data.featured }).eq("id", data.id);
    if (error) {
      if (error.message.includes("FEATURED_CAP_REACHED")) {
        throw new Error("הגעת למקסימום 8 תמונות לדף הבית. הסירי תמונה אחרת תחילה.");
      }
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin.from("gallery").select("storage_path").eq("id", data.id).single();
    if (row?.storage_path) {
      await supabaseAdmin.storage.from("gallery").remove([row.storage_path]);
    }
    const { error } = await supabaseAdmin.from("gallery").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderGallery = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid(), direction: z.enum(["up", "down"]) }).parse(i))
  .handler(async ({ data }) => {
    const { data: all } = await supabaseAdmin.from("gallery").select("id,order_index").order("order_index");
    if (!all) return { ok: true };
    const idx = all.findIndex((r) => r.id === data.id);
    const swapIdx = data.direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return { ok: true };
    const a = all[idx], b = all[swapIdx];
    await supabaseAdmin.from("gallery").update({ order_index: b.order_index }).eq("id", a.id);
    await supabaseAdmin.from("gallery").update({ order_index: a.order_index }).eq("id", b.id);
  });

const GALLERY_CATEGORIES = ["סדנה", "הכשרה", "הרצאה", "מפגש קהילתי", "ערב עיון", "כללי"] as const;

export const setGalleryCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid(), category: z.enum(GALLERY_CATEGORIES) }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("gallery").update({ category: data.category }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setGalleryCategoriesBulk = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({
    ...tokenField,
    items: z.array(z.object({ id: z.string().uuid(), category: z.enum(GALLERY_CATEGORIES) })).min(1).max(50),
  }).parse(i))
  .handler(async ({ data }) => {
    for (const it of data.items) {
      const { error } = await supabaseAdmin.from("gallery").update({ category: it.category }).eq("id", it.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Events ----------
const EventSchema = z.object({
  title_he: z.string().min(1).max(200),
  title_en: z.string().max(200).optional().nullable(),
  description_he: z.string().max(3000).optional().nullable(),
  description_en: z.string().max(3000).optional().nullable(),
  type: z.enum(["lecture", "workshop", "meetup", "evening"]),
  date: z.string().min(1),
  time: z.string().min(1),
  end_time: z.string().max(8).optional().nullable(),
  online_link: z.string().max(500).optional().nullable(),
  location_he: z.string().max(300).optional().nullable(),
  location_en: z.string().max(300).optional().nullable(),
  price: z.number().int().min(0),
  max_spots: z.number().int().min(0),
  spots_remaining: z.number().int().min(0).optional(),
  image_url: z.string().max(1000).optional().nullable(),
  status: z.enum(["active", "cancelled", "completed"]),
});

export const listEvents = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin.from("events").select("*").order("date", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data };
  });

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid().optional(), values: EventSchema }).parse(i))
  .handler(async ({ data }) => {
    if (data.id) {
      const { error } = await supabaseAdmin.from("events").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const values = { ...data.values, spots_remaining: data.values.max_spots };
      const { error } = await supabaseAdmin.from("events").insert(values);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listEventRegistrants = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, event_id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin.from("event_registrations").select("*").eq("event_id", data.event_id).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows };
  });

