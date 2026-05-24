import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "../admin/auth.functions";
import { chatCompletion, embed } from "./gateway.server";
import { logIntegration } from "./log.server";

const tokenField = { token: z.string().min(1) };
const ANALYSIS_MODEL = "google/gemini-2.5-flash";
const RAG_MAX_CHARS = 8000;
const RAG_MATCH_COUNT = 8;
const RAG_MIN_SIM = 0.5;

const SYSTEM = `אתה עוזר ניהולי פנימי של עמותת "לגעת ברגש". הניתוח שלך מיועד לעובדי העמותה בלבד — לא לפונה.
מטרת הניתוח: לתת לעובדים כיוון פעולה ברור — מה הפנייה, איך כדאי להמשיך, ואיזו פעילות של העמותה מתאימה.

עקרונות:
- ענה תמיד בעברית.
- אל תכתוב טיוטת תשובה לפונה. הצוות יכתוב את התשובה בעצמו.
- כתוב בלשון פנימית: "מומלץ לחזור...", "כדאי לבדוק...", "הפנייה מתאימה לסדנת X" — לא בגוף שני אל הפונה.
- היה תמציתי, ענייני וקונקרטי.
- אל תמציא פרטים. אם חסר מידע — ציין זאת.
- אם בפנייה יש סימני מצוקה/דחיפות — סמן עדיפות "high" והסבר.

אם נתון לך KNOWLEDGE_BASE עם מידע על העמותה והפעילויות, השתמש בו כדי להציע פעילות רלוונטית (סדנה / הרצאה / מפגש) שמתאימה לפנייה. ציין את שם הפעילות והסבר למה היא מתאימה.`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "analyze_submission",
    description: "החזר ניתוח פנימי של הפנייה לעובדי העמותה.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "1-2 משפטים: מה הפונה מבקש ומה הצורך המרכזי." },
        sentiment: { type: "string", enum: ["positive", "neutral", "negative", "urgent"] },
        category: { type: "string", description: "תיוג קצר: סדנה, הרצאה, תרומה, התנדבות, מוצר, כללי, אחר." },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        suggested_response: {
          type: "string",
          description:
            "המלצת פעולה פנימית לעובדי העמותה — איך להמשיך עם הפנייה: למי לחזור, מה להציע, אילו סדנאות/הרצאות מתאימות מה-KNOWLEDGE_BASE, ומה מידע חסר. 3-6 משפטים, בלשון פנימית. אסור לכתוב טיוטת תשובה לפונה.",
        },
      },
      required: ["summary", "sentiment", "category", "priority", "suggested_response"],
      additionalProperties: false,
    },
  },
};

type AnalysisResult = {
  summary: string;
  sentiment: "positive" | "neutral" | "negative" | "urgent";
  category: string;
  priority: "low" | "medium" | "high";
  suggested_response: string;
};

async function fetchSubmission(kind: "contact" | "volunteer", id: string) {
  const table = kind === "contact" ? "contact_messages" : "volunteers";
  const { data, error } = await supabaseAdmin.from(table).select("*").eq("id", id).single();
  if (error || !data) throw new Error("הפנייה לא נמצאה");
  return data as Record<string, unknown>;
}

function buildSubmissionText(kind: "contact" | "volunteer", row: Record<string, unknown>) {
  if (kind === "contact") {
    return [
      `שם: ${row.name ?? ""}`,
      row.email ? `אימייל: ${row.email}` : "",
      row.phone ? `טלפון: ${row.phone}` : "",
      row.subject ? `נושא: ${row.subject}` : "",
      row.inquiry_type ? `סוג פנייה: ${row.inquiry_type}` : "",
      "",
      "תוכן ההודעה:",
      String(row.message ?? ""),
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    `שם: ${row.name ?? ""}`,
    row.email ? `אימייל: ${row.email}` : "",
    row.phone ? `טלפון: ${row.phone}` : "",
    row.age ? `גיל: ${row.age}` : "",
    row.location ? `מיקום: ${row.location}` : "",
    row.profession ? `מקצוע: ${row.profession}` : "",
    row.interest ? `מעוניין/ת ב: ${row.interest}` : "",
    row.interests ? `נושאי עניין: ${row.interests}` : "",
    row.message ? `\nהודעה:\n${row.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function buildRagContext(query: string) {
  // Embed the query
  let queryVec: number[];
  try {
    const vecs = await embed(query.slice(0, 8000), { dimensions: 1536 });
    queryVec = vecs[0];
  } catch (err) {
    console.error("Embedding query failed:", err);
    return { context: "", documentsUsed: [] as { id: string; title: string; category: string }[], chars: 0 };
  }

  const { data, error } = await supabaseAdmin.rpc("match_rag_chunks", {
    query_embedding: JSON.stringify(queryVec) as unknown as never,
    match_count: RAG_MATCH_COUNT,
    min_similarity: RAG_MIN_SIM,
  });
  if (error) {
    console.error("match_rag_chunks failed:", error.message);
    return { context: "", documentsUsed: [], chars: 0 };
  }

  type Match = {
    chunk_id: string;
    document_id: string;
    chunk_index: number;
    content: string;
    similarity: number;
    doc_title: string;
    doc_category: string;
    doc_language: string;
  };
  const matches = (data ?? []) as Match[];
  if (matches.length === 0) return { context: "", documentsUsed: [], chars: 0 };

  // Sort: org_profile first, then workshops_full, then by similarity
  matches.sort((a, b) => {
    if (a.doc_category !== b.doc_category) {
      if (a.doc_category === "org_profile") return -1;
      if (b.doc_category === "org_profile") return 1;
    }
    return b.similarity - a.similarity;
  });

  // Group by document and accumulate up to RAG_MAX_CHARS
  const byDoc = new Map<string, { title: string; category: string; chunks: string[] }>();
  let total = 0;
  for (const m of matches) {
    if (total >= RAG_MAX_CHARS) break;
    const remaining = RAG_MAX_CHARS - total;
    const piece = m.content.slice(0, Math.min(remaining, 1500));
    const slot = byDoc.get(m.document_id) ?? { title: m.doc_title, category: m.doc_category, chunks: [] };
    slot.chunks.push(piece);
    byDoc.set(m.document_id, slot);
    total += piece.length;
  }

  const parts: string[] = [];
  const documentsUsed: { id: string; title: string; category: string }[] = [];
  for (const [docId, slot] of byDoc.entries()) {
    documentsUsed.push({ id: docId, title: slot.title, category: slot.category });
    parts.push(`=== ${slot.title} (${slot.category}) ===\n${slot.chunks.join("\n\n")}`);
  }
  const context = parts.join("\n\n");
  return { context, documentsUsed, chars: context.length };
}

export const analyzeSubmission = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({
      ...tokenField,
      kind: z.enum(["contact", "volunteer"]),
      id: z.string().uuid(),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const row = await fetchSubmission(data.kind, data.id);
    const submissionText = buildSubmissionText(data.kind, row);

    const rag = await buildRagContext(submissionText);

    // Load CMS context so the AI can suggest relevant workshops/lectures
    const [wsRes, lecRes] = await Promise.all([
      supabaseAdmin
        .from("workshops")
        .select("name_he,short_description,target_audience,age_group,goals")
        .eq("is_active", true)
        .order("order_index")
        .limit(30),
      supabaseAdmin
        .from("lectures")
        .select("title,short_description,target_audience,topics,duration")
        .eq("is_active", true)
        .order("order_index")
        .limit(30),
    ]);
    const cmsBlock = JSON.stringify(
      { workshops: wsRes.data ?? [], lectures: lecRes.data ?? [] },
      null,
      2,
    );

    const userPrompt =
      (rag.context ? `KNOWLEDGE_BASE:\n${rag.context}\n\n` : "") +
      `CMS_CONTEXT (סדנאות והרצאות פעילות בעמותה):\n${cmsBlock}\n\n` +
      `--- פנייה לניתוח ---\n${submissionText}\n\n` +
      `נתח את הפנייה והחזר ניתוח פנימי לעובדי העמותה. הצע סדנה/הרצאה רלוונטית מה-CMS אם מתאים. אל תכתוב תשובה לפונה — רק כיוון פעולה לצוות.`;

    let result: AnalysisResult;
    try {
      const completion = await chatCompletion({
        model: ANALYSIS_MODEL,
        system: SYSTEM,
        user: userPrompt,
        tools: [TOOL],
        toolChoice: { type: "function", function: { name: "analyze_submission" } },
        temperature: 0.3,
      });
      const tc = completion.choices?.[0]?.message?.tool_calls?.[0];
      const args = tc?.function?.arguments;
      if (!args) throw new Error("AI לא החזיר תשובה מובנית");
      result = JSON.parse(args) as AnalysisResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await logIntegration({
        integration_type: "ai_analysis",
        status: "failed",
        error_message: msg,
        metadata: { submission_type: data.kind, submission_id: data.id },
      });
      throw new Error(msg);
    }

    const { data: ins, error: insErr } = await supabaseAdmin
      .from("ai_submission_analysis")
      .insert({
        submission_id: data.id,
        submission_type: data.kind,
        summary: result.summary,
        sentiment: result.sentiment,
        category: result.category,
        priority: result.priority,
        suggested_response: result.suggested_response,
        model: ANALYSIS_MODEL,
        rag_documents_used: rag.documentsUsed as never,
        rag_context_chars: rag.chars,
      })
      .select("*")
      .single();
    if (insErr) throw new Error(insErr.message);

    await logIntegration({
      integration_type: "ai_analysis",
      status: "success",
      metadata: {
        submission_type: data.kind,
        submission_id: data.id,
        model: ANALYSIS_MODEL,
        rag_docs_count: rag.documentsUsed.length,
        rag_context_chars: rag.chars,
        rag_docs_included: rag.documentsUsed.map((d) => d.title),
      },
    });

    return { analysis: ins };
  });

export const getSubmissionAnalysis = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({
      ...tokenField,
      kind: z.enum(["contact", "volunteer"]),
      id: z.string().uuid(),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("ai_submission_analysis")
      .select("*")
      .eq("submission_type", data.kind)
      .eq("submission_id", data.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    return { analysis: rows?.[0] ?? null };
  });
