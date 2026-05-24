import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function logIntegration(entry: {
  integration_type: string;
  status: "success" | "failed" | "pending";
  error_message?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.from("integration_logs").insert({
      integration_type: entry.integration_type,
      status: entry.status,
      error_message: entry.error_message ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (e) {
    console.error("Failed to write integration log:", e);
  }
}
