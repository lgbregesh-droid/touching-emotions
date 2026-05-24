import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "../admin/auth.functions";
import { processSubmission, type SubmissionTable } from "./process-submission.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TABLES = [
  "contact_messages",
  "volunteers",
  "event_registrations",
  "workshop_registrants",
  "donations",
  "orders",
] as const;

export const regenerateSubmissionAnalysis = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        token: z.string().min(1),
        submission_id: z.string().uuid(),
        submission_table: z.enum(TABLES),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    await processSubmission(data.submission_id, data.submission_table as SubmissionTable);
    return { ok: true };
  });

export const listIntegrationLogs = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        token: z.string().min(1),
        limit: z.number().int().min(1).max(500).optional(),
        integration_type: z.string().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("integration_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);
    if (data.integration_type) q = q.eq("integration_type", data.integration_type);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const getSubmissionAnalysisFull = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        token: z.string().min(1),
        submission_id: z.string().uuid(),
        submission_table: z.enum(TABLES),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("ai_submission_analysis")
      .select("*")
      .eq("submission_id", data.submission_id)
      .eq("submission_type", data.submission_table)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    return { analysis: rows?.[0] ?? null };
  });
