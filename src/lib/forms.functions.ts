import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fireProcessSubmission } from "@/lib/ai/process-submission.server";

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(2000),
  inquiry_type: z.string().trim().max(80).optional().or(z.literal("")),
  source_page: z.string().trim().max(80).optional().or(z.literal("")),
  related_item_type: z.string().trim().max(40).optional().or(z.literal("")),
  related_item_id: z.string().trim().max(120).optional().or(z.literal("")),
  related_item_title: z.string().trim().max(300).optional().or(z.literal("")),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ContactSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: ins, error } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        subject: data.subject || null,
        message: data.message,
        inquiry_type: data.inquiry_type || null,
        source_page: data.source_page || null,
        related_item_type: data.related_item_type || null,
        related_item_id: data.related_item_id || null,
        related_item_title: data.related_item_title || null,
      })
      .select("id")
      .single();
    if (error || !ins) throw new Error(error?.message ?? "שמירה נכשלה");
    fireProcessSubmission(ins.id as string, "contact_messages");
    return { ok: true };
  });


const VolunteerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  profession: z.string().trim().max(200).optional().or(z.literal("")),
  interest: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const submitVolunteer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => VolunteerSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: ins, error } = await supabaseAdmin
      .from("volunteers")
      .insert({
        name: data.name,
        phone: data.phone || null,
        profession: data.profession || null,
        interest: data.interest || null,
      })
      .select("id")
      .single();
    if (error || !ins) throw new Error(error?.message ?? "שמירה נכשלה");
    fireProcessSubmission(ins.id as string, "volunteers");
    return { ok: true };
  });
