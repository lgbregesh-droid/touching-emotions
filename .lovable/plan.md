## מה כבר קיים בפרויקט

- `ai_submission_analysis` + `integration_logs` (טבלאות קיימות)
- `analyzeSubmission` server function שקוראת ל-Gemini דרך Lovable AI Gateway
- מסך אדמין עם פאנל ניתוח (`AnalysisPanel`) לפניות יצירת קשר ומתנדבים
- מערכת RAG פעילה (rag_documents, rag_chunks, match_rag_chunks)
- `GEMINI_API_KEY` כבר מוגדר כסוד

## מה ייבנה

### שלב 1 — הרחבת סכימת DB

**`ai_submission_analysis`** — הוספת עמודות חסרות:
`submission_table, target_audience, main_need, urgency_level, short_summary, missing_information jsonb, recommended_next_step, suggested_activity_type, matched_workshop_or_lecture jsonb, draft_reply, internal_notes, ai_provider, ai_model, ai_status, error_message`

**`integration_logs`** — הוספת `submission_id, submission_table`

**טבלאות הגשות** (`contact_messages, volunteers, event_registrations, workshop_registrants, donations, orders`) — הוספת:
- `ai_status text default 'pending'`
- `email_status text default 'pending'`

**טבלה חדשה `ai_policies`**: `id, topic, instruction, is_active, created_at, updated_at`
+ seed של 6 מדיניות ברירת מחדל (לא להמציא מחירים/תאריכים, לא לאבחן וכו׳).

**`site_settings`** — seed של מפתחות חדשים:
`ai_provider=gemini`, `gemini_model=gemini-2.5-flash`, `ai_enabled=true`, `ai_analysis_enabled=true`, `owner_email`, `email_notifications_enabled=true`.

### שלב 2 — Server function מאוחד `processSubmission`

קובץ חדש: `src/lib/ai/process-submission.functions.ts`

זרימה:
1. מקבל `{ submissionId, submissionTable }`
2. שולף את ההגשה + CMS context (workshops, lectures, faq, site_settings, ai_policies פעילים)
3. בונה prompt מובנה + RAG context מהמערכת הקיימת
4. קורא ל-Gemini דרך Lovable AI Gateway עם **tool calling** להחזרת JSON בסכימה הנדרשת (`submission_type`, `urgency_level`, `matched_workshop_or_lecture` וכו׳)
5. שומר ל-`ai_submission_analysis` (insert / upsert לפי `submission_id`)
6. מעדכן `ai_status` בטבלת ההגשה
7. כל כשל → `integration_logs` + `ai_status='failed'`, ממשיך הלאה
8. שולח אימייל לבעלים דרך **Resend** (קיים? אם לא — דרך Lovable Emails)
9. מעדכן `email_status`

הפעלה:
- **רקע אוטומטי** מתוך כל טופס לאחר insert מוצלח (`processSubmission({ submissionId, table })` ללא await — fire & forget)
- **ידני** — כפתור "צור ניתוח AI מחדש" באדמין

### שלב 3 — חיווט הטפסים

עדכון 6 הטפסים לקרוא ל-`processSubmission` אחרי insert מוצלח, בלי לחסום את הודעת ההצלחה למשתמש.

### שלב 4 — אימייל

שימוש ב-Resend דרך connector. אם לא מחובר — אבקש להתחבר.
תבנית בעברית כמו במפרט, נושא דינמי לפי `submissionTable`.

### שלב 5 — אדמין

- הרחבת `AnalysisPanel` להציג את כל השדות החדשים (matched workshop, urgency, missing_information, draft_reply עם כפתור העתקה, internal_notes)
- הוספת מסך `/admin/integration-logs` (יומני אינטגרציות)
- כפתור "צור ניתוח AI מחדש" כבר קיים בסיסית — אווודא שעובד מול הפלואו החדש
- הוספת תצוגת `ai_status` + `email_status` בטבלת הפניות

### שלב 6 — RLS

- הציבור: `INSERT` בלבד לטבלאות הגשה (כבר קיים)
- אדמין מאומת: קריאה/עדכון של הגשות, `ai_submission_analysis`, `integration_logs`, `ai_policies`

## הערות חשובות

- שימוש ב-Lovable AI Gateway (לא קריאה ישירה ל-Gemini) — `GEMINI_API_KEY` שלך לא יידרש כי `LOVABLE_API_KEY` כבר מוגדר. אם אתה מתעקש על ה-API key הפרטי שלך — אפשר להוסיף סניף שני, אבל ה-Gateway יותר חסכוני ופשוט.
- מודל ברירת מחדל: `google/gemini-2.5-flash` (שווה ערך ל-`gemini-1.5-flash` של המפרט, מעודכן יותר), ניתן לשינוי מהאדמין דרך `site_settings.gemini_model`.
- כל הקריאות ל-AI עוברות דרך `createServerFn` — אפס חשיפה של מפתחות בצד לקוח.
- ה-RAG הקיים יוזרק לפרומפט אוטומטית.

## שאלות לפני שאני מתחיל

1. **אימייל** — להשתמש ב-Resend (צריך לחבר connector אם לא מחובר) או ב-Lovable Emails המובנה?
2. **API key** — האם להמשיך עם ה-Lovable AI Gateway (מומלץ) או להשתמש ב-`GEMINI_API_KEY` שכבר הזנת בקריאה ישירה ל-Google?
3. **owner_email** — מה כתובת האימייל לקבלת ההתראות?