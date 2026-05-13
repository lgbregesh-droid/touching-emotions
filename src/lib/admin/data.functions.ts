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
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const [inq, vol, don, ws, recentInq, recentVol, recentOrd, recentDon] = await Promise.all([
      supabaseAdmin.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabaseAdmin.from("volunteers").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabaseAdmin.from("donations").select("amount").gte("created_at", monthStart).eq("status", "success"),
      supabaseAdmin.from("workshops").select("name_he,date").gte("date", new Date().toISOString().slice(0, 10)).order("date").limit(1),
      supabaseAdmin.from("contact_messages").select("id,name,created_at,status").order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("volunteers").select("id,name,created_at,status").order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("orders").select("id,buyer_name,created_at,shipping_status").order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("donations").select("id,donor_name,created_at,status").order("created_at", { ascending: false }).limit(5),
    ]);
    const donationTotal = (don.data || []).reduce((s, r) => s + Number(r.amount || 0), 0);
    const activity = [
      ...(recentInq.data || []).map((r) => ({ kind: "inquiry", id: r.id, name: r.name, date: r.created_at, status: r.status })),
      ...(recentVol.data || []).map((r) => ({ kind: "volunteer", id: r.id, name: r.name, date: r.created_at, status: r.status })),
      ...(recentOrd.data || []).map((r) => ({ kind: "order", id: r.id, name: r.buyer_name, date: r.created_at, status: r.shipping_status })),
      ...(recentDon.data || []).map((r) => ({ kind: "donation", id: r.id, name: r.donor_name || "תורם/ת", date: r.created_at, status: r.status })),
    ].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 10);
    return {
      newInquiries: inq.count || 0,
      newVolunteers: vol.count || 0,
      donationTotal,
      nextWorkshop: ws.data?.[0] || null,
      activity,
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
  date: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  location: z.string().max(200).optional().nullable(),
  audience: z.string().max(200).optional().nullable(),
  price: z.number().min(0).default(0),
  max_participants: z.number().int().min(0).nullable().optional(),
  image_url: z.string().max(1000).optional().nullable(),
  status: z.enum(["open", "closed", "ended"]).default("open"),
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
  .inputValidator((i: unknown) =>
    z.object({
      ...tokenField,
      values: z.object({
        name_he: z.string().min(1).max(200),
        name_en: z.string().max(200).optional().nullable(),
        desc_he: z.string().max(2000).optional().nullable(),
        desc_en: z.string().max(2000).optional().nullable(),
        price: z.number().min(0),
        image_url: z.string().max(1000).optional().nullable(),
        in_stock: z.boolean(),
      }),
    }).parse(i),
  )
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
    const { error: insErr } = await supabaseAdmin.from("gallery").insert({
      url: pub.publicUrl,
      storage_path: path,
      order_index: (count || 0) + 1,
      featured: false,
    });
    if (insErr) throw new Error(insErr.message);
    return { ok: true, url: pub.publicUrl };
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

