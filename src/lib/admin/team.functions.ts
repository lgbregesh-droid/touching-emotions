import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./auth.functions";

const tokenField = { token: z.string().min(1) };

const TeamValues = z.object({
  name_he: z.string().min(1).max(120),
  name_en: z.string().max(120).optional().nullable(),
  role_he: z.string().min(1).max(120),
  role_en: z.string().max(120).optional().nullable(),
  bio_he: z.string().max(2000).optional().nullable(),
  bio_en: z.string().max(2000).optional().nullable(),
  photo_url: z.string().max(1000).optional().nullable(),
  storage_path: z.string().max(500).optional().nullable(),
  is_active: z.boolean().optional(),
});

export const listTeam = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { rows: data || [] };
  });

export const upsertTeamMember = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({ ...tokenField, id: z.string().uuid().optional(), values: TeamValues }).parse(i),
  )
  .handler(async ({ data }) => {
    const v: Record<string, unknown> = { ...data.values };
    for (const k of Object.keys(v)) if (v[k] === "") v[k] = null;
    if (data.id) {
      const { error } = await supabaseAdmin.from("team_members").update(v).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { count } = await supabaseAdmin.from("team_members").select("id", { count: "exact", head: true });
    v.display_order = (count || 0) + 1;
    const { data: ins, error } = await supabaseAdmin.from("team_members").insert(v).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id as string };
  });

export const deleteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin.from("team_members").select("storage_path").eq("id", data.id).single();
    if (row?.storage_path) {
      await supabaseAdmin.storage.from("team-photos").remove([row.storage_path]);
    }
    const { error } = await supabaseAdmin.from("team_members").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderTeam = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid(), direction: z.enum(["up", "down"]) }).parse(i))
  .handler(async ({ data }) => {
    const { data: all } = await supabaseAdmin.from("team_members").select("id,display_order").order("display_order");
    if (!all) return { ok: true };
    const idx = all.findIndex((r) => r.id === data.id);
    const swapIdx = data.direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return { ok: true };
    const a = all[idx], b = all[swapIdx];
    await supabaseAdmin.from("team_members").update({ display_order: b.display_order }).eq("id", a.id);
    await supabaseAdmin.from("team_members").update({ display_order: a.display_order }).eq("id", b.id);
    return { ok: true };
  });

export const uploadTeamPhoto = createServerFn({ method: "POST" })
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
    if (!/^image\/(jpeg|png|webp)$/.test(data.contentType)) throw new Error("סוג קובץ לא נתמך (JPG/PNG/WEBP בלבד)");
    const buf = Buffer.from(data.base64, "base64");
    if (buf.length > 3 * 1024 * 1024) throw new Error("הקובץ גדול מ-3MB");
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabaseAdmin.storage.from("team-photos").upload(path, buf, {
      contentType: data.contentType,
      upsert: false,
    });
    if (upErr) throw new Error(upErr.message);
    const { data: pub } = supabaseAdmin.storage.from("team-photos").getPublicUrl(path);
    return { url: pub.publicUrl, storage_path: path };
  });

export const removeTeamPhoto = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin.from("team_members").select("storage_path").eq("id", data.id).single();
    if (row?.storage_path) {
      await supabaseAdmin.storage.from("team-photos").remove([row.storage_path]);
    }
    const { error } = await supabaseAdmin.from("team_members").update({ photo_url: null, storage_path: null }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===================== Active volunteers =====================

const VolValues = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(1).max(50),
  email: z.string().max(200).optional().nullable(),
  role: z.string().max(200).optional().nullable(),
  area: z.string().max(200).optional().nullable(),
  start_date: z.string().max(20).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(["active", "paused", "ended"]).optional(),
  source_inquiry_id: z.string().uuid().optional().nullable(),
});

export const listActiveVolunteers = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("active_volunteers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data || [] };
  });

export const upsertActiveVolunteer = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({ ...tokenField, id: z.string().uuid().optional(), values: VolValues }).parse(i),
  )
  .handler(async ({ data }) => {
    const v: Record<string, unknown> = { ...data.values };
    for (const k of Object.keys(v)) if (v[k] === "") v[k] = null;
    if (data.id) {
      const { error } = await supabaseAdmin.from("active_volunteers").update(v).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("active_volunteers").insert(v).select("id").single();
    if (error) throw new Error(error.message);
    // If linked to an inquiry — auto mark it as handled
    if (data.values.source_inquiry_id) {
      await supabaseAdmin.from("volunteers").update({ status: "handled" }).eq("id", data.values.source_inquiry_id);
    }
    return { ok: true, id: ins.id as string };
  });

export const deleteActiveVolunteer = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ ...tokenField, id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("active_volunteers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
