import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "../admin/auth.functions";
import { detectFileType, extractTextFromBuffer, chunkText } from "./extract.server";
import { embed } from "./gateway.server";
import { logIntegration } from "./log.server";

const tokenField = { token: z.string().min(1) };
const BUCKET = "rag-documents";
const MAX_BYTES = 10 * 1024 * 1024;
const EMBED_DIMS = 1536;

// ---------- List ----------
export const listRagDocuments = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object(tokenField).parse(i))
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("rag_documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

// ---------- Upload + extract + embed ----------
async function processDocument(documentId: string) {
  try {
    const { data: doc, error } = await supabaseAdmin
      .from("rag_documents")
      .select("*")
      .eq("id", documentId)
      .single();
    if (error || !doc) throw new Error(error?.message || "מסמך לא נמצא");

    const { data: file, error: dlErr } = await supabaseAdmin.storage.from(BUCKET).download(doc.storage_path);
    if (dlErr || !file) throw new Error(dlErr?.message || "כשל בהורדת הקובץ");
    const buf = new Uint8Array(await file.arrayBuffer());

    const text = await extractTextFromBuffer(buf, doc.file_type as "pdf" | "docx" | "txt");
    if (!text || text.length < 10) throw new Error("לא נמצא טקסט במסמך");

    const chunks = chunkText(text, 800, 150);
    if (chunks.length === 0) throw new Error("חילוץ הטקסט הצליח אך לא נוצרו קטעים");

    // Embed in batches
    await supabaseAdmin.from("rag_chunks").delete().eq("document_id", documentId);
    const BATCH = 64;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH);
      const vectors = await embed(batch, { dimensions: EMBED_DIMS });
      const rows = batch.map((content, idx) => ({
        document_id: documentId,
        chunk_index: i + idx,
        content,
        // pgvector accepts string form "[1,2,3]"
        embedding: JSON.stringify(vectors[idx]) as unknown as never,
      }));
      const { error: insErr } = await supabaseAdmin.from("rag_chunks").insert(rows as never);
      if (insErr) throw new Error(insErr.message);
    }

    await supabaseAdmin
      .from("rag_documents")
      .update({
        extraction_status: "completed",
        extraction_error: null,
        chars_total: text.length,
      })
      .eq("id", documentId);

    await logIntegration({
      integration_type: "rag_extraction",
      status: "success",
      metadata: {
        document_id: documentId,
        file_name: doc.file_name,
        chars_extracted: text.length,
        chunks_count: chunks.length,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("RAG extraction failed:", msg);
    await supabaseAdmin
      .from("rag_documents")
      .update({ extraction_status: "failed", extraction_error: msg })
      .eq("id", documentId);
    await logIntegration({
      integration_type: "rag_extraction",
      status: "failed",
      error_message: msg,
      metadata: { document_id: documentId },
    });
  }
}

export const uploadRagDocument = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({
      ...tokenField,
      title: z.string().min(1).max(200),
      description: z.string().max(1000).optional().nullable(),
      category: z.enum(["org_profile", "workshops_full"]),
      language: z.enum(["he", "en", "both"]),
      filename: z.string().min(1).max(200),
      contentType: z.string().min(1).max(120),
      base64: z.string().min(1),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const fileType = detectFileType(data.filename, data.contentType);
    if (!fileType) throw new Error("פורמט לא נתמך. ניתן להעלות PDF, DOCX או TXT בלבד.");
    const buf = Buffer.from(data.base64, "base64");
    if (buf.length > MAX_BYTES) throw new Error("הקובץ גדול מ-10MB");

    const ext = fileType === "docx" ? "docx" : fileType === "pdf" ? "pdf" : "txt";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buf, { contentType: data.contentType, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: ins, error: insErr } = await supabaseAdmin
      .from("rag_documents")
      .insert({
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        language: data.language,
        file_name: data.filename,
        file_type: fileType,
        storage_path: path,
        file_url: null,
        extraction_status: "pending",
      })
      .select("id")
      .single();
    if (insErr || !ins) {
      await supabaseAdmin.storage.from(BUCKET).remove([path]);
      throw new Error(insErr?.message || "שמירת המסמך נכשלה");
    }

    // Process in background; the response returns immediately
    void processDocument(ins.id);

    return { ok: true, id: ins.id as string };
  });

export const reextractRagDocument = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({ ...tokenField, id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("rag_documents")
      .update({ extraction_status: "pending", extraction_error: null })
      .eq("id", data.id);
    void processDocument(data.id);
    return { ok: true };
  });

export const setRagDocumentActive = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({ ...tokenField, id: z.string().uuid(), is_active: z.boolean() }).parse(i),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("rag_documents")
      .update({ is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRagDocument = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({ ...tokenField, id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("rag_documents")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (row?.storage_path) {
      await supabaseAdmin.storage.from(BUCKET).remove([row.storage_path]);
    }
    const { error } = await supabaseAdmin.from("rag_documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const previewRagDocument = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z.object({ ...tokenField, id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    const { data: chunks, error } = await supabaseAdmin
      .from("rag_chunks")
      .select("content,chunk_index")
      .eq("document_id", data.id)
      .order("chunk_index")
      .limit(50);
    if (error) throw new Error(error.message);
    const text = (chunks ?? []).map((c) => c.content).join("\n\n");
    return { text, chunks_count: chunks?.length ?? 0 };
  });
