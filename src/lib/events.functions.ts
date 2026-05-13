import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listUpcomingEvents = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ limit: z.number().int().min(1).max(50).optional() }).parse(i))
  .handler(async ({ data }) => {
    const today = new Date().toISOString().slice(0, 10);
    const q = supabaseAdmin
      .from("events")
      .select("*")
      .eq("status", "active")
      .gte("date", today)
      .order("date", { ascending: true })
      .order("time", { ascending: true });
    const { data: rows, error } = data.limit ? await q.limit(data.limit) : await q;
    if (error) throw new Error(error.message);
    return { rows: rows || [] };
  });

export const listPastEvents = createServerFn({ method: "POST" })
  .inputValidator(() => ({}))
  .handler(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .lt("date", today)
      .order("date", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return { rows: data || [] };
  });

const RegSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(200),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const registerForEvent = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => RegSchema.parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("event_registrations").insert({
      event_id: data.event_id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      notes: data.notes || null,
    });
    if (error) {
      const msg = error.message || "";
      if (msg.includes("EVENT_FULL")) throw new Error("FULL");
      if (msg.includes("EVENT_NOT_ACTIVE")) throw new Error("NOT_ACTIVE");
      if (msg.includes("duplicate") || msg.includes("unique") || (error as { code?: string }).code === "23505") {
        throw new Error("DUPLICATE");
      }
      throw new Error(error.message);
    }
    return { ok: true };
  });
