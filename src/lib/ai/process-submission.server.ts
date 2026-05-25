// Server-only unified AI processing pipeline for all form submissions.
// Loads CMS context, calls Gemini for structured analysis, persists results,
// sends email notification to the site owner. AI / email failures never block.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { chatCompletion, embed } from "./gateway.server";
import { logIntegration } from "./log.server";

export type SubmissionTable =
  | "contact_messages"
  | "volunteers"
  | "event_registrations"
  | "workshop_registrants"
  | "donations"
  | "orders";

const SUBJECT_BY_TABLE: Record<SubmissionTable, string> = {
  contact_messages: "פנייה חדשה מהאתר + ניתוח AI - לגעת ברגש",
  volunteers: "פניית התנדבות חדשה + ניתוח AI - לגעת ברגש",
  event_registrations: "הרשמה חדשה לאירוע + ניתוח AI - לגעת ברגש",
  workshop_registrants: "הרשמה חדשה לסדנה + ניתוח AI - לגעת ברגש",
  donations: "פניית תמיכה חדשה + ניתוח AI - לגעת ברגש",
  orders: "הזמנת מוצר חדשה + ניתוח AI - לגעת ברגש",
};

const TABLE_LABEL: Record<SubmissionTable, string> = {
  contact_messages: "טופס יצירת קשר",
  volunteers: "טופס מתנדבים",
  event_registrations: "הרשמה לאירוע",
  workshop_registrants: "הרשמה לסדנה",
  donations: "תרומה",
  orders: "הזמנת מוצר",
};

const SYSTEM_PROMPT = `אתה עוזר AI פנימי של עמותת "לגעת ברגש" — מרכז להעצמה רגשית וחוסן רגשי.
התפקיד שלך: לנתח פניות שהתקבלו מהטפסים באתר, **עבור עובדי העמותה בלבד** (לא עבור הפונה).
המטרה: לתת לצוות כיוון פעולה ברור — מה הפנייה, איך כדאי להמשיך איתה, ואיזו פעילות של העמותה מתאימה.

אתה מקבל:
1. את פרטי ההגשה המקורית
2. סדנאות פעילות מתוך ה-CMS
3. הרצאות / מפגשים פעילים מתוך ה-CMS
4. שאלות נפוצות
5. הגדרות אתר
6. מדיניויות AI
7. (אופציונלי) ידע מורחב מבסיס הידע (KNOWLEDGE_BASE)

עליך לנתח את הפנייה ולהחזיר JSON מובנה בלבד באמצעות הכלי analyze_submission.
השתמש בידע מה-CMS וה-KNOWLEDGE_BASE כדי שההמלצה תהיה מדויקת ומבוססת.
אם סדנה או הרצאה מה-CMS תואמת לבקשה — ציין זאת ב-matched_workshop_or_lecture.
אם אין התאמה — המלץ על צעד הבא כללי (חזרה טלפונית, בקשת פרטים נוספים, הפניה).

חוקים מחייבים:
- ענה תמיד בעברית.
- **הניתוח מיועד לצוות העמותה — לא לפונה. אל תכתוב טיוטת תשובה אישית לפונה.**
- כל השדות צריכים להיכתב בלשון פנימית: "מומלץ לחזור...", "כדאי לבדוק...", "הפנייה מתאימה ל-X" — לא בגוף שני אל הפונה.
- היה מקצועי, תמציתי וקונקרטי.
- אל תמציא מידע חסר. אל תמציא מחירים, תאריכים, זמינות, מיקומים או הסמכות.
- אל תאבחן. אל תיתן טיפול. אל תבטיח תוצאות רגשיות.
- במקרי מצוקה / סכנה / פגיעה עצמית / אלימות — קבע urgency_level="דורשת מענה מהיר" והמלץ על מענה אנושי/מקצועי דחוף.
- החזר JSON תקין בלבד באמצעות הקריאה לכלי analyze_submission.`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "analyze_submission",
    description: "החזר ניתוח מובנה של פניית הציבור.",
    parameters: {
      type: "object",
      properties: {
        submission_type: {
          type: "string",
          enum: [
            "הזמנת סדנה",
            "הרצאה / מפגש",
            "התנדבות",
            "תרומה",
            "תמיכה בעשייה",
            "הרשמה לאירוע",
            "שאלה כללית",
            "אחר",
          ],
        },
        target_audience: { type: "string", description: "מי הפונה / קהל היעד." },
        main_need: { type: "string", description: "הצורך המרכזי במשפט אחד." },
        urgency_level: {
          type: "string",
          enum: ["רגילה", "חשובה", "דורשת מענה מהיר"],
        },
        short_summary: { type: "string", description: "1-2 משפטים." },
        missing_information: {
          type: "array",
          items: { type: "string" },
          description: "מידע שנדרש כדי להתקדם — תאריכים, גודל קבוצה וכו׳.",
        },
        recommended_next_step: { type: "string", description: "צעד מומלץ לבעלת האתר." },
        suggested_activity_type: { type: "string", description: "סוג פעילות שמתאים: סדנה / הרצאה / מפגש / שיחה." },
        matched_workshop_or_lecture: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["workshop", "lecture", "none"] },
            title: { type: "string" },
            reason: { type: "string" },
          },
          required: ["type", "title", "reason"],
          additionalProperties: false,
        },
        draft_reply: {
          type: "string",
          description:
            "המלצת פעולה פנימית מפורטת לצוות העמותה — איך להמשיך עם הפנייה: למי לחזור, באיזה אופן (טלפון/מייל/וואטסאפ), אילו סדנאות/הרצאות מה-CMS להציע ולמה הן מתאימות, ואילו פרטים חסרים שצריך לברר. 4-7 משפטים, בלשון פנימית. **אסור לכתוב טיוטת תשובה לפונה — רק כיוון פעולה לצוות.**",
        },
        internal_notes: { type: "string", description: "הערות פנימיות לבעלת האתר." },
      },
      required: [
        "submission_type",
        "target_audience",
        "main_need",
        "urgency_level",
        "short_summary",
        "missing_information",
        "recommended_next_step",
        "suggested_activity_type",
        "matched_workshop_or_lecture",
        "draft_reply",
        "internal_notes",
      ],
      additionalProperties: false,
    },
  },
};

type AnalysisResult = {
  submission_type: string;
  target_audience: string;
  main_need: string;
  urgency_level: string;
  short_summary: string;
  missing_information: string[];
  recommended_next_step: string;
  suggested_activity_type: string;
  matched_workshop_or_lecture: { type: string; title: string; reason: string };
  draft_reply: string;
  internal_notes: string;
};

// ---------- CMS context ----------

async function loadCmsContext() {
  const [workshops, lectures, faq, settings, policies] = await Promise.all([
    supabaseAdmin
      .from("workshops")
      .select("name_he,name_en,short_description,full_description,target_audience,age_group,goals,format,price")
      .eq("is_active", true)
      .order("order_index")
      .limit(30),
    supabaseAdmin
      .from("lectures")
      .select("title,short_description,full_description,target_audience,topics,duration")
      .eq("is_active", true)
      .order("order_index")
      .limit(30),
    supabaseAdmin
      .from("faq")
      .select("question,answer,category")
      .eq("is_active", true)
      .order("order_index")
      .limit(60),
    supabaseAdmin.from("site_settings").select("key,value"),
    supabaseAdmin.from("ai_policies").select("topic,instruction").eq("is_active", true),
  ]);

  const settingsObj: Record<string, string> = {};
  for (const s of settings.data ?? []) settingsObj[s.key] = s.value ?? "";

  return {
    workshops: workshops.data ?? [],
    lectures: lectures.data ?? [],
    faq: faq.data ?? [],
    site_settings: {
      phone: settingsObj.phone ?? "",
      email: settingsObj.email ?? "",
      whatsapp_number: settingsObj.whatsapp_number ?? "",
      donation_link: settingsObj.donation_link ?? "",
      owner_email: settingsObj.owner_email ?? "",
    },
    ai_policies: policies.data ?? [],
    raw_settings: settingsObj,
  };
}

// ---------- RAG ----------

async function buildRagContext(query: string) {
  try {
    const vecs = await embed(query.slice(0, 8000), { dimensions: 1536 });
    const { data, error } = await supabaseAdmin.rpc("match_rag_chunks", {
      query_embedding: JSON.stringify(vecs[0]) as unknown as never,
      match_count: 8,
      min_similarity: 0.5,
    });
    if (error || !data || data.length === 0) {
      return { context: "", documentsUsed: [] as { id: string; title: string; category: string }[], chars: 0 };
    }
    type Match = { document_id: string; content: string; doc_title: string; doc_category: string; similarity: number };
    const matches = data as Match[];
    matches.sort((a, b) => {
      if (a.doc_category !== b.doc_category) {
        if (a.doc_category === "org_profile") return -1;
        if (b.doc_category === "org_profile") return 1;
      }
      return b.similarity - a.similarity;
    });
    const MAX = 8000;
    let total = 0;
    const byDoc = new Map<string, { title: string; category: string; chunks: string[] }>();
    for (const m of matches) {
      if (total >= MAX) break;
      const remaining = MAX - total;
      const piece = m.content.slice(0, Math.min(remaining, 1500));
      const slot = byDoc.get(m.document_id) ?? { title: m.doc_title, category: m.doc_category, chunks: [] };
      slot.chunks.push(piece);
      byDoc.set(m.document_id, slot);
      total += piece.length;
    }
    const parts: string[] = [];
    const documentsUsed: { id: string; title: string; category: string }[] = [];
    for (const [id, slot] of byDoc.entries()) {
      documentsUsed.push({ id, title: slot.title, category: slot.category });
      parts.push(`=== ${slot.title} (${slot.category}) ===\n${slot.chunks.join("\n\n")}`);
    }
    return { context: parts.join("\n\n"), documentsUsed, chars: total };
  } catch (err) {
    console.error("RAG failed:", err);
    return { context: "", documentsUsed: [], chars: 0 };
  }
}

// ---------- Submission text ----------

function buildSubmissionText(table: SubmissionTable, row: Record<string, unknown>) {
  const lines: string[] = [`סוג טופס: ${TABLE_LABEL[table]}`];
  const fieldMap: Record<string, string> = {
    name: "שם",
    full_name: "שם מלא",
    donor_name: "שם תורם",
    buyer_name: "שם רוכש",
    email: "אימייל",
    phone: "טלפון",
    subject: "נושא",
    inquiry_type: "סוג פנייה",
    source_page: "עמוד מקור",
    profession: "מקצוע",
    interest: "תחום עניין",
    interests: "תחומי עניין",
    age: "גיל",
    location: "מיקום",
    notes: "הערות",
    quantity: "כמות",
    amount: "סכום",
    type: "סוג",
    event_id: "מזהה אירוע",
    workshop_id: "מזהה סדנה",
    message: "הודעה",
  };
  for (const [k, label] of Object.entries(fieldMap)) {
    const v = row[k];
    if (v !== null && v !== undefined && v !== "") lines.push(`${label}: ${v}`);
  }
  return lines.join("\n");
}

// ---------- Email ----------

function buildEmailHtml(args: {
  table: SubmissionTable;
  row: Record<string, unknown>;
  analysis: AnalysisResult | null;
  errorMessage: string | null;
  model: string;
}) {
  const { row, analysis, errorMessage, model, table } = args;
  const fmt = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v));
  const bodyRows: string[] = [
    `<tr><td><b>שם:</b></td><td>${fmt(row.name ?? row.full_name ?? row.donor_name ?? row.buyer_name)}</td></tr>`,
    `<tr><td><b>טלפון:</b></td><td>${fmt(row.phone)}</td></tr>`,
    `<tr><td><b>אימייל:</b></td><td>${fmt(row.email)}</td></tr>`,
    `<tr><td><b>סוג פנייה:</b></td><td>${fmt(row.inquiry_type ?? TABLE_LABEL[table])}</td></tr>`,
    `<tr><td><b>תאריך:</b></td><td>${fmt(row.created_at)}</td></tr>`,
  ];
  if (row.source_page || row.related_item_type || row.related_item_title) {
    bodyRows.push(
      `<tr><td colspan="2" style="padding-top:8px"><b>פרטי מקור:</b><br/>` +
        `מקור הפנייה: ${fmt(row.source_page)}<br/>` +
        `סוג פריט קשור: ${fmt(row.related_item_type)}<br/>` +
        `פריט קשור: ${fmt(row.related_item_title ?? "לא צוין פריט קשור")}` +
        (row.related_item_id ? `<br/>מזהה: ${fmt(row.related_item_id)}` : "") +
        `</td></tr>`,
    );
  }
  if (row.message) {
    bodyRows.push(`<tr><td colspan="2"><b>הודעה:</b><br/><pre style="white-space:pre-wrap;font-family:inherit;background:#f5f0e8;padding:12px;border-radius:8px;">${escapeHtml(String(row.message))}</pre></td></tr>`);
  }


  let aiSection = "";
  if (analysis) {
    aiSection = `
      <h3 style="color:#461C5B;margin-top:24px">ניתוח AI</h3>
      <p><b>סטטוס ניתוח:</b> הצלחה · <b>ספק:</b> Gemini · <b>מודל:</b> ${escapeHtml(model)}</p>
      <ul style="line-height:1.8">
        <li><b>סוג פנייה מזוהה:</b> ${escapeHtml(analysis.submission_type)}</li>
        <li><b>קהל יעד:</b> ${escapeHtml(analysis.target_audience)}</li>
        <li><b>צורך מרכזי:</b> ${escapeHtml(analysis.main_need)}</li>
        <li><b>דחיפות:</b> ${escapeHtml(analysis.urgency_level)}</li>
        <li><b>סוג פעילות מומלץ:</b> ${escapeHtml(analysis.suggested_activity_type)}</li>
      </ul>
      <p><b>תקציר:</b><br/>${escapeHtml(analysis.short_summary)}</p>
      ${analysis.missing_information.length ? `<p><b>מידע חסר:</b><br/>• ${analysis.missing_information.map(escapeHtml).join("<br/>• ")}</p>` : ""}
      ${analysis.matched_workshop_or_lecture && analysis.matched_workshop_or_lecture.type !== "none" ? `<p><b>התאמה מה-CMS:</b> ${escapeHtml(analysis.matched_workshop_or_lecture.type)} – ${escapeHtml(analysis.matched_workshop_or_lecture.title)}<br/><i>${escapeHtml(analysis.matched_workshop_or_lecture.reason)}</i></p>` : ""}
      <p><b>צעד הבא מומלץ:</b><br/>${escapeHtml(analysis.recommended_next_step)}</p>
      <p><b>המלצת פעולה לצוות (פנימי):</b></p>
      <div style="background:#f5f0e8;padding:12px;border-radius:8px;white-space:pre-wrap;border-right:3px solid #BA9B78">${escapeHtml(analysis.draft_reply)}</div>
      <p style="font-size:11px;color:#888;margin-top:4px">⚠️ זוהי המלצה פנימית לצוות — לא טיוטת תשובה לפונה.</p>
      ${analysis.internal_notes ? `<p style="color:#666"><b>הערות פנימיות:</b> ${escapeHtml(analysis.internal_notes)}</p>` : ""}
    `;
  } else {
    aiSection = `
      <h3 style="color:#461C5B;margin-top:24px">ניתוח AI</h3>
      <p style="color:#a83232"><b>ניתוח AI לא זמין כרגע.</b></p>
      ${errorMessage ? `<p style="color:#666">סיבת תקלה: ${escapeHtml(errorMessage)}</p>` : ""}
      <p>הפנייה נשמרה במערכת וניתן לטפל בה ידנית.</p>
    `;
  }

  return `
    <!doctype html>
    <html dir="rtl" lang="he"><body style="font-family:Arial,Helvetica,sans-serif;color:#2D1B3D;max-width:680px;margin:0 auto;padding:24px">
      <h2 style="color:#461C5B">נכנסה פנייה חדשה מהאתר "לגעת ברגש"</h2>
      <h3 style="color:#461C5B">פרטי הפנייה</h3>
      <table cellpadding="6" style="border-collapse:collapse">${bodyRows.join("")}</table>
      ${aiSection}
      <hr style="margin-top:32px;border:none;border-top:1px solid #E0D8CC"/>
      <p style="font-size:12px;color:#888">הניתוח נוצר על ידי AI ונועד לסייע בלבד. יש להפעיל שיקול דעת אנושי לפני מענה לפונה.</p>
    </body></html>
  `;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function sendOwnerEmail(args: {
  table: SubmissionTable;
  ownerEmail: string;
  row: Record<string, unknown>;
  analysis: AnalysisResult | null;
  errorMessage: string | null;
  model: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return { ok: false, error: "RESEND_API_KEY לא מוגדר." };
  }
  try {
    const subject = SUBJECT_BY_TABLE[args.table];
    const html = buildEmailHtml(args);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "לגעת ברגש <onboarding@resend.dev>",
        to: [args.ownerEmail],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${txt.slice(0, 250)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------- Main pipeline ----------

export async function processSubmission(submissionId: string, table: SubmissionTable) {
  // 1. Fetch submission
  const { data: row, error: rowErr } = await supabaseAdmin
    .from(table)
    .select("*")
    .eq("id", submissionId)
    .single();
  if (rowErr || !row) {
    await logIntegration({
      integration_type: "ai_pipeline",
      status: "failed",
      error_message: `Submission not found: ${rowErr?.message ?? "unknown"}`,
      metadata: { submission_id: submissionId, submission_table: table },
    });
    return;
  }

  // 2. Load CMS + RAG context
  const cms = await loadCmsContext();
  const aiEnabled = (cms.raw_settings.ai_enabled ?? "true") !== "false";
  const aiAnalysisEnabled = (cms.raw_settings.ai_analysis_enabled ?? "true") !== "false";
  const model = cms.raw_settings.gemini_model || "google/gemini-2.5-flash";
  const ownerEmail = cms.raw_settings.owner_email || "";
  const emailEnabled = (cms.raw_settings.email_notifications_enabled ?? "true") !== "false";

  let analysis: AnalysisResult | null = null;
  let aiError: string | null = null;
  let ragDocs: { id: string; title: string; category: string }[] = [];
  let ragChars = 0;

  if (aiEnabled && aiAnalysisEnabled) {
    const submissionText = buildSubmissionText(table, row);
    const rag = await buildRagContext(submissionText);
    ragDocs = rag.documentsUsed;
    ragChars = rag.chars;
    const cmsBlock = JSON.stringify(
      {
        workshops: cms.workshops,
        lectures: cms.lectures,
        faq: cms.faq,
        site_settings: cms.site_settings,
        ai_policies: cms.ai_policies,
      },
      null,
      2,
    );
    const userPrompt =
      (rag.context ? `KNOWLEDGE_BASE:\n${rag.context}\n\n` : "") +
      `CMS_CONTEXT:\n${cmsBlock}\n\n--- SUBMISSION ---\n${submissionText}\n\nנתח את הפנייה לפי ההנחיות והחזר JSON מובנה.`;

    try {
      const completion = await chatCompletion({
        model,
        system: SYSTEM_PROMPT,
        user: userPrompt,
        tools: [TOOL],
        toolChoice: { type: "function", function: { name: "analyze_submission" } },
        temperature: 0.3,
      });
      const args = completion.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) throw new Error("AI לא החזיר תוצאה מובנית");
      analysis = JSON.parse(args) as AnalysisResult;
    } catch (err) {
      aiError = err instanceof Error ? err.message : String(err);
      await logIntegration({
        integration_type: "gemini_ai_analysis",
        status: "failed",
        error_message: aiError,
        metadata: { submission_id: submissionId, submission_table: table, model },
      });
    }
  } else {
    aiError = "ניתוח AI מבוטל בהגדרות";
  }

  // 3. Save analysis (always — success or failure)
  await supabaseAdmin
    .from("ai_submission_analysis")
    .upsert(
      {
        submission_id: submissionId,
        submission_type: table,
        submission_table: table,
        ai_provider: "gemini",
        ai_model: model,
        ai_status: analysis ? "completed" : "failed",
        error_message: aiError,
        summary: analysis?.short_summary ?? null,
        short_summary: analysis?.short_summary ?? null,
        target_audience: analysis?.target_audience ?? null,
        main_need: analysis?.main_need ?? null,
        urgency_level: analysis?.urgency_level ?? null,
        missing_information: (analysis?.missing_information ?? []) as never,
        recommended_next_step: analysis?.recommended_next_step ?? null,
        suggested_activity_type: analysis?.suggested_activity_type ?? null,
        matched_workshop_or_lecture: (analysis?.matched_workshop_or_lecture ?? {}) as never,
        draft_reply: analysis?.draft_reply ?? null,
        suggested_response: analysis?.draft_reply ?? null,
        internal_notes: analysis?.internal_notes ?? null,
        category: analysis?.submission_type ?? null,
        priority:
          analysis?.urgency_level === "דורשת מענה מהיר"
            ? "high"
            : analysis?.urgency_level === "חשובה"
              ? "medium"
              : analysis
                ? "low"
                : null,
        model,
        rag_documents_used: ragDocs as never,
        rag_context_chars: ragChars,
      },
      { onConflict: "submission_id,submission_type" },
    );

  if (analysis) {
    await logIntegration({
      integration_type: "gemini_ai_analysis",
      status: "success",
      metadata: {
        submission_id: submissionId,
        submission_table: table,
        model,
        rag_docs_count: ragDocs.length,
        rag_context_chars: ragChars,
      },
    });
  }

  // 4. Update submission ai_status
  await supabaseAdmin
    .from(table)
    .update({ ai_status: analysis ? "completed" : "failed" })
    .eq("id", submissionId);

  // 5. Email
  let emailStatus: "sent" | "failed" | "pending" = "pending";
  if (emailEnabled && ownerEmail) {
    const emailRes = await sendOwnerEmail({
      table,
      ownerEmail,
      row,
      analysis,
      errorMessage: aiError,
      model,
    });
    if (emailRes.ok) {
      emailStatus = "sent";
      await logIntegration({
        integration_type: "email_notification",
        status: "success",
        metadata: { submission_id: submissionId, submission_table: table, to: ownerEmail },
      });
    } else {
      emailStatus = "failed";
      await logIntegration({
        integration_type: "email_notification",
        status: "failed",
        error_message: emailRes.error,
        metadata: { submission_id: submissionId, submission_table: table, to: ownerEmail },
      });
    }
  } else {
    await logIntegration({
      integration_type: "email_notification",
      status: "failed",
      error_message: !ownerEmail ? "owner_email לא מוגדר ב-site_settings" : "התראות אימייל מבוטלות",
      metadata: { submission_id: submissionId, submission_table: table },
    });
  }

  await supabaseAdmin
    .from(table)
    .update({ email_status: emailStatus })
    .eq("id", submissionId);
}

// Fire-and-forget wrapper for use after form inserts. Never throws.
export function fireProcessSubmission(submissionId: string, table: SubmissionTable) {
  void processSubmission(submissionId, table).catch((err) => {
    console.error("processSubmission failed:", err);
  });
}
