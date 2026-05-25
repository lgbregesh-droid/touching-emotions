import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./auth.functions";
import { chatCompletion } from "@/lib/ai/gateway.server";
import { logIntegration } from "@/lib/ai/log.server";

const token = { token: z.string().min(1) };

const POST_TYPES = [
  "workshop_promo",
  "event_promo",
  "success_story",
  "educational",
  "nonprofit_update",
  "volunteer_call",
] as const;

const GEN_MODEL = "google/gemini-2.5-flash";

type LinkedInOption = {
  id: number;
  he: string;
  en: string;
  hashtags_he: string[];
  hashtags_en: string[];
  hook_he?: string;
  hook_en?: string;
};

const ContextSchema = z.object({
  workshop_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  story: z.string().max(4000).optional(),
  audience: z.string().max(200).optional(),
  topic: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  share: z.string().max(4000).optional(),
  fields: z.string().max(500).optional(),
});

async function loadRagContext(): Promise<string> {
  const { data } = await supabaseAdmin
    .from("rag_documents")
    .select("title,category,description")
    .eq("is_active", true)
    .in("category", ["org_profile", "workshops_full"])
    .limit(10);
  if (!data?.length) return "";
  return data
    .map((d) => `=== ${d.title} (${d.category}) ===\n${d.description ?? ""}`)
    .join("\n\n")
    .slice(0, 5000);
}

async function loadContextDetails(
  postType: (typeof POST_TYPES)[number],
  ctx: z.infer<typeof ContextSchema>,
) {
  const out: Record<string, unknown> = { ...ctx };
  if (postType === "workshop_promo" && ctx.workshop_id) {
    const { data } = await supabaseAdmin
      .from("workshops")
      .select(
        "name_he,name_en,short_description,full_description,target_audience,age_group,goals,format,date,location,price",
      )
      .eq("id", ctx.workshop_id)
      .maybeSingle();
    if (data) out.workshop = data;
  }
  if (postType === "event_promo" && ctx.event_id) {
    const { data } = await supabaseAdmin
      .from("events")
      .select(
        "title_he,title_en,description_he,description_en,type,date,time,location_he,location_en,price,online_link",
      )
      .eq("id", ctx.event_id)
      .maybeSingle();
    if (data) out.event = data;
  }
  return out;
}

const SYSTEM = `אתה כותב/ת תוכן לרשת LinkedIn עבור עמותת "לגעת ברגש" — עמותה ישראלית לחוסן רגשי וחינוך רגשי לילדים.
החזר תמיד JSON תקין בלבד, ללא טקסט נוסף, ללא הקדמות, ללא markdown fences.`;

function buildPrompt(
  postType: string,
  contextJson: string,
  ragContext: string,
) {
  return `ORGANIZATION BACKGROUND:
${ragContext || "(no extra context)"}

POST TYPE: ${postType}
CONTEXT: ${contextJson}

Write 3 different LinkedIn post options. Each option has Hebrew and English versions, plus relevant hashtags.

LinkedIn rules:
- Max 3000 characters per language
- Professional yet warm tone
- First line is a scroll-stopping hook
- Use line breaks (not walls of text)
- End with a subtle CTA (question or invite)
- Hebrew is RTL, conversational-professional
- English is natural LinkedIn tone, NOT a literal translation

Hebrew hashtags to mix from: #לגעתברגש #חוסןרגשי #חינוךרגשי #ילדים #העצמה #רגשות #הורים #מחנכים #פסיכולוגיהחיובית #עמותה

Do NOT invent statistics, promise outcomes, use real names, mention specific prices, or give therapy advice.

Return ONLY this JSON:
{
  "options": [
    { "id": 1, "he": "...", "en": "...", "hashtags_he": ["#..."], "hashtags_en": ["#..."], "hook_he": "...", "hook_en": "..." },
    { "id": 2, "he": "...", "en": "...", "hashtags_he": ["#..."], "hashtags_en": ["#..."], "hook_he": "...", "hook_en": "..." },
    { "id": 3, "he": "...", "en": "...", "hashtags_he": ["#..."], "hashtags_en": ["#..."], "hook_he": "...", "hook_en": "..." }
  ]
}`;
}

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("AI did not return valid JSON");
  }
}

// ---------- Generate ----------
export const generateLinkedInPosts = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        ...token,
        post_type: z.enum(POST_TYPES),
        context: ContextSchema.default({}),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const ctxFull = await loadContextDetails(data.post_type, data.context);
    const rag = await loadRagContext();
    const prompt = buildPrompt(
      data.post_type,
      JSON.stringify(ctxFull, null, 2),
      rag,
    );
    try {
      const res = await chatCompletion({
        model: GEN_MODEL,
        system: SYSTEM,
        user: prompt,
        temperature: 0.8,
      });
      const text = res.choices?.[0]?.message?.content ?? "";
      const parsed = extractJson(text) as { options?: LinkedInOption[] };
      const options = (parsed.options ?? []).slice(0, 3).map((o, i) => ({
        id: i + 1,
        he: String(o.he ?? ""),
        en: String(o.en ?? ""),
        hashtags_he: Array.isArray(o.hashtags_he) ? o.hashtags_he.map(String) : [],
        hashtags_en: Array.isArray(o.hashtags_en) ? o.hashtags_en.map(String) : [],
        hook_he: o.hook_he ? String(o.hook_he) : "",
        hook_en: o.hook_en ? String(o.hook_en) : "",
      }));
      if (options.length === 0) throw new Error("AI החזיר 0 אפשרויות");
      await logIntegration({
        integration_type: "linkedin_generate",
        status: "success",
        metadata: { post_type: data.post_type, count: options.length },
      });
      return { options, context: JSON.parse(JSON.stringify(ctxFull)) as Record<string, string | number | boolean | null | unknown[] | Record<string, unknown>> };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await logIntegration({
        integration_type: "linkedin_generate",
        status: "failed",
        error_message: msg,
        metadata: { post_type: data.post_type },
      });
      throw new Error(msg);
    }
  });

// ---------- Save draft ----------
export const saveLinkedInDraft = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        ...token,
        id: z.string().uuid().optional(),
        post_type: z.enum(POST_TYPES),
        topic: z.string().max(500).optional(),
        context_data: z.record(z.string(), z.unknown()).default({}),
        generated_options: z.array(z.unknown()).default([]),
        selected_option: z.number().int().min(1).max(10).optional(),
        final_text_he: z.string().max(8000).optional().default(""),
        final_text_en: z.string().max(8000).optional().default(""),
        published_language: z.enum(["he", "en", "both"]).default("he"),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const row = {
      post_type: data.post_type,
      topic: data.topic ?? null,
      context_data: data.context_data as never,
      generated_options: data.generated_options as never,
      selected_option: data.selected_option ?? null,
      final_text_he: data.final_text_he || null,
      final_text_en: data.final_text_en || null,
      published_language: data.published_language,
      linkedin_status: "draft" as const,
      generation_model: GEN_MODEL,
    };
    if (data.id) {
      const { data: r, error } = await supabaseAdmin
        .from("linkedin_posts")
        .update(row)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return { row: r };
    }
    const { data: r, error } = await supabaseAdmin
      .from("linkedin_posts")
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { row: r };
  });

// ---------- Publish ----------
async function publishOne(text: string, accessToken: string, personId: string) {
  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`LinkedIn ${res.status}: ${body.slice(0, 400)}`);
  let id: string | undefined;
  try {
    const j = JSON.parse(body) as { id?: string };
    id = j.id;
  } catch {
    id = res.headers.get("x-restli-id") ?? undefined;
  }
  const url = id ? `https://www.linkedin.com/feed/update/${encodeURIComponent(id)}/` : null;
  return { id: id ?? null, url };
}

export const publishLinkedInPost = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        ...token,
        post_id: z.string().uuid(),
        text_he: z.string().max(8000).optional().default(""),
        text_en: z.string().max(8000).optional().default(""),
        language: z.enum(["he", "en", "both"]),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const personId = process.env.LINKEDIN_PERSON_ID;
    if (!accessToken || !personId) {
      throw new Error("חסרים LINKEDIN_ACCESS_TOKEN / LINKEDIN_PERSON_ID");
    }

    const toSend: { lang: "he" | "en"; text: string }[] = [];
    if (data.language === "he" || data.language === "both") {
      if (!data.text_he.trim()) throw new Error("טקסט עברי ריק");
      toSend.push({ lang: "he", text: data.text_he.trim() });
    }
    if (data.language === "en" || data.language === "both") {
      if (!data.text_en.trim()) throw new Error("טקסט אנגלי ריק");
      toSend.push({ lang: "en", text: data.text_en.trim() });
    }

    const results: { lang: string; id: string | null; url: string | null }[] = [];
    try {
      for (const t of toSend) {
        const r = await publishOne(t.text, accessToken, personId);
        results.push({ lang: t.lang, ...r });
      }
      const firstUrl = results.find((r) => r.url)?.url ?? null;
      const firstId = results.find((r) => r.id)?.id ?? null;
      await supabaseAdmin
        .from("linkedin_posts")
        .update({
          linkedin_status: "published",
          published_at: new Date().toISOString(),
          linkedin_post_id: firstId,
          linkedin_post_url: firstUrl,
          published_language: data.language,
          final_text_he: data.text_he || null,
          final_text_en: data.text_en || null,
          error_message: null,
        })
        .eq("id", data.post_id);

      await logIntegration({
        integration_type: "linkedin_publish",
        status: "success",
        metadata: { post_id: data.post_id, language: data.language, results },
      });
      return { success: true as const, results };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await supabaseAdmin
        .from("linkedin_posts")
        .update({
          linkedin_status: "failed",
          error_message: msg,
          final_text_he: data.text_he || null,
          final_text_en: data.text_en || null,
          published_language: data.language,
        })
        .eq("id", data.post_id);
      await logIntegration({
        integration_type: "linkedin_publish",
        status: "failed",
        error_message: msg,
        metadata: { post_id: data.post_id, language: data.language },
      });
      return { success: false as const, error: msg };
    }
  });

// ---------- List / archive ----------
export const listLinkedInPosts = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        ...token,
        status: z.string().optional(),
        post_type: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("linkedin_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status) q = q.eq("linkedin_status", data.status);
    if (data.post_type) q = q.eq("post_type", data.post_type);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const archiveLinkedInPost = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({ ...token, id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("linkedin_posts")
      .update({ linkedin_status: "archived" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Helpers for UI ----------
export const listLinkedInContextSources = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(token).parse(i))
  .handler(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const [ws, ev, tokenSetting] = await Promise.all([
      supabaseAdmin
        .from("workshops")
        .select("id,name_he,short_description")
        .eq("is_active", true)
        .order("order_index"),
      supabaseAdmin
        .from("events")
        .select("id,title_he,date,time")
        .gte("date", today)
        .order("date"),
      supabaseAdmin
        .from("site_settings")
        .select("value,updated_at")
        .eq("key", "linkedin_token_updated_at")
        .maybeSingle(),
    ]);
    return {
      workshops: ws.data ?? [],
      events: ev.data ?? [],
      token_updated_at: tokenSetting.data?.value ?? tokenSetting.data?.updated_at ?? null,
    };
  });
