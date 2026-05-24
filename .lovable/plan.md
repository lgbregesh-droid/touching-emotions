# תכנית בנייה — ניתוח AI לפניות + בסיס ידע RAG

הפרומפט המקורי מתייחס למערכות שלא קיימות בפרויקט (`analyze-submission`, `ai_submission_analysis`, `integration_logs`). לכן הבנייה תתבצע בשני שלבים, כפי שבחרת.

## שלב 1 — תשתית ניתוח AI לפניות (בסיסי, ללא RAG)

### בסיס נתונים (מיגרציה אחת)
- `ai_submission_analysis` — שומרת תוצאות ניתוח של הודעות מ-`contact_messages` ו-`volunteers`:
  - `submission_id`, `submission_type` (contact/volunteer), `summary`, `sentiment` (positive/neutral/negative/urgent), `category`, `suggested_response`, `priority` (low/medium/high), `model`, `created_at`, וגם השדות העתידיים `rag_documents_used jsonb default '[]'`, `rag_context_chars int default 0`.
- `integration_logs` — לוגים גנריים: `integration_type`, `status`, `error_message`, `metadata jsonb`, `created_at`.
- RLS: רק admin (auth.role() = 'authenticated') קורא/כותב. ציבור — אין גישה.

### Server function `analyzeSubmission` (TanStack, לא Edge Function)
- ב-`src/lib/ai/analyze.functions.ts` (admin בלבד דרך טוקן הניהול הקיים).
- שולפת את הפנייה, בונה פרומפט, קוראת ל-Lovable AI Gateway (`google/gemini-2.5-flash`) עם tool calling להחזרת JSON מובנה (summary/sentiment/category/priority/suggested_response).
- שומרת תוצאה ב-`ai_submission_analysis` ולוג ב-`integration_logs`.
- מטפלת ב-429/402 ומשקפת הודעת שגיאה ברורה.

### ממשק אדמין
- בעמוד `/admin/inquiries` הקיים — להוסיף לכל שורה כפתור "נתח ב-AI" ופאנל שמראה: תקציר, רגש, קטגוריה, עדיפות, תשובה מוצעת. אם כבר יש ניתוח — להציג אותו ולאפשר "נתח מחדש".

## שלב 2 — בסיס ידע RAG עם chunking

### בסיס נתונים (מיגרציה שנייה)
- הפעלת `pgvector`: `create extension if not exists vector;`
- `rag_documents`:
  - `id, title, description, category` (org_profile/workshops_full), `file_name, file_type` (pdf/docx/txt), `file_url, storage_path`, `extraction_status` (pending/completed/failed), `extraction_error`, `is_active boolean default true`, `language` (he/en/both), `chars_total int`, `created_at, updated_at`.
- `rag_chunks`:
  - `id, document_id` (FK→rag_documents on delete cascade), `chunk_index int`, `content text`, `embedding vector(1536)` (משתמש ב-`google/gemini-embedding-001` עם `dimensions: 1536` כדי לחסוך מקום וזמן חיפוש), `created_at`.
  - אינדקס HNSW: `using hnsw (embedding vector_cosine_ops)`.
- פונקציית RPC `match_rag_chunks(query_embedding, match_count, min_similarity)` שמחזירה את הצ'אנקים הקרובים ביותר ממסמכים פעילים שהושלם להם חילוץ.
- RLS: admin בלבד, אין גישה ציבורית. גם storage policies בלעדיות.
- Storage bucket `rag-documents` — פרטי, מוגבל ל-10MB. נקרא רק מצד שרת.

### Server functions
- `uploadRagDocument` — מקבלת מטא-דאטה + קובץ (base64), מעלה ל-storage, יוצרת רשומה ב-`rag_documents` עם `extraction_status='pending'`, ומפעילה את `extractAndEmbed` ברקע.
- `extractAndEmbed`:
  - מוריד מה-storage ב-server.
  - PDF → `pdfjs-dist/legacy/build/pdf.mjs` (worker-compatible build).
  - DOCX → `mammoth` (`extractRawText`).
  - TXT → קריאה ישירה.
  - מנקה רווחים מיותרים, מפצל לצ'אנקים של ~800 תווים עם חפיפה של ~150 תווים, גבולות במשפטים.
  - שולח batch ל-`/v1/embeddings` (model: `google/gemini-embedding-001`, dimensions: 1536) ב-batches של 64.
  - שומר ב-`rag_chunks`. מעדכן `extraction_status='completed'` ולוג ב-`integration_logs`.
  - על שגיאה: `failed` + `extraction_error` + לוג.
- `reextractRagDocument` — מוחק chunks ישנים ומריץ שוב.
- `setRagDocumentActive`, `deleteRagDocument` (מוחק גם storage + chunks).
- `previewRagDocument` — מחזיר 500 תווים ראשונים מצורפים מהצ'אנקים.

### שילוב ב-`analyzeSubmission` (עדכון)
- לפני קריאה ל-Gemini:
  - בונה שאילתה (טקסט הפנייה).
  - יוצר embedding לשאילתה.
  - קורא ל-`match_rag_chunks` עם `match_count=8, min_similarity=0.6`.
  - בונה context (מקבץ לפי `document_id`, מציג כותרת+קטגוריה+תוכן הצ'אנקים), חותך ל-8000 תווים סה"כ עם עדיפות `org_profile` לפני `workshops_full`.
  - מוסיף ל-prompt בתור `KNOWLEDGE_BASE` (לפני CMS_CONTEXT אם קיים).
  - שומר ב-`ai_submission_analysis.rag_documents_used` רשימה של `{id, title, category}` יחודיים.
  - שומר ב-`rag_context_chars` את האורך הסופי.
  - מלוגג ב-`integration_logs.metadata`: `rag_docs_count`, `rag_context_chars`, `rag_docs_included`.

### ממשק אדמין `/admin/knowledge-base`
- פריט חדש בסיידבר (📚 בסיס ידע) בין "תוכן האתר" ל"גלריה".
- אזור העלאה (drag & drop) עם טופס: שם, תיאור, קטגוריה, שפה. אישור → העלאה + הפעלת חילוץ.
- טבלה: שם, קטגוריה (תווית), שפה, קובץ + אייקון, סטטוס חילוץ (✓/⏳/✗ עם tooltip על שגיאה), טוגל פעיל/כבוי, תאריך, פעולות (תצוגה/חלץ מחדש/מחק).
- Empty state והודעת מידע למעלה.
- בעמוד הניתוח של פנייה — להציג רשימת מסמכי RAG שנכללו (`rag_documents_used`).

### תרגומים
- להוסיף את כל המפתחות מתחת ל-`he.admin.knowledge_base` כפי שמופיע בפרומפט.

## טכנולוגיה ומפתחות
- AI: Lovable AI Gateway (משתמש כבר בפרויקט עם `LOVABLE_API_KEY`).
- חילוץ טקסט: `mammoth` ל-DOCX, `pdfjs-dist` (legacy build) ל-PDF — שניהם תואמי Cloudflare Worker.
- Embeddings: `google/gemini-embedding-001` עם `dimensions: 1536`.

## הערות / הנחות
- הניתוח מופעל ידנית מהאדמין (לא אוטומטית בכל הגשת טופס) — מונע הוצאות מיותרות. אם תרצי הפעלה אוטומטית, נוסיף trigger בעתיד.
- `pdfjs-dist` יכול להיות כבד — אם נתקל בבעיות bundle ב-Cloudflare Worker, נחליף ל-`unpdf`.
- בכל שלב נחזיר רק serializable data מה-server function, ולא נחשוף את `client.server` ל-client.

---

ברגע שתאשרי, אני מתחיל בשלב 1 (מיגרציה ראשונה + ניתוח AI בסיסי + UI ב-inquiries) ואז ממשיך ישירות לשלב 2.