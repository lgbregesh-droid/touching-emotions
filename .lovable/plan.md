# Plan: Admin as Single Source of Truth

This is a large, multi-area upgrade. I'll work in phases and stop after each major phase to let you verify before moving on. Nothing existing will be removed — only extended and re-wired.

## Phase 1 — Foundations (settings + WhatsApp helper)

1. Seed `site_settings` with all required keys (idempotent insert): `site_name`, `site_subtitle`, `phone`, `whatsapp_number`, `email`, `facebook_url`, `instagram_url`, `donation_link`, `association_number`, `footer_text`, `owner_email`, `ai_enabled`, `ai_provider`, `gemini_model`, plus existing keys. Each with Hebrew `label` and `type`.
2. Extend the existing `הגדרות אתר` admin page so each field shows: Hebrew label, current value, input, helper text ("איפה זה מופיע באתר"), per-section save.
3. Create `src/lib/site-settings.ts` with:
   - `useSiteSettings()` hook (React Query, public read)
   - `buildWhatsAppLink(number, message?)` helper
   - `getSetting(key, fallback)` helper
4. Replace hardcoded WhatsApp / phone / email / social / donation / footer / association number across:
   - `FloatingWidgets`, `Navbar`, `Footer`, `contact.tsx`, `SupportTeaser`, support page CTA, workshop/lecture CTAs, donations page
   - All WhatsApp links go through `buildWhatsAppLink`.
5. Fallback behavior: hide/disable links when value is empty; safe placeholders.

## Phase 2 — Page texts (`site_content`)

1. `site_content` table already exists. Seed rows for each editable page text (hero titles, CTA labels, about copy, etc.) with `page`, `section`, `key`, `label`, `type`, `value_he`, `value_en`.
2. Add admin page `ניהול טקסטים` grouped by page (`דף הבית`, `אודות`, ...). Reuse existing admin shell + CMS manager pattern.
3. Public components read via `useSiteContent(page)` hook with safe fallbacks to current hardcoded copy.

## Phase 3 — CMS sections (workshops, lectures, testimonials, gallery, support, FAQ, events)

Each section already has admin pages and tables. I'll:
- Verify fields match the requested list; add missing columns via migration if needed (e.g., workshops `short_description`, `goals`, `format` already exist; lectures fields exist).
- Ensure each admin card shows: active toggle, featured toggle, last-updated date, image preview, reorder, delete confirm, validation, success/error toasts.
- Public pages read active rows; homepage reads active+featured ordered by `order_index`.
- Verify hidden items don't leak publicly.
- Events: ensure calendar (`CalendarActions`) builds Google/ICS links from row data (already does — verify).

## Phase 4 — Security & RLS audit

- Verify each public table has `SELECT` policy scoped to `is_active = true` where applicable (faq, lectures, testimonials, support_items already correct; workshops, gallery currently allow all rows — tighten to active where appropriate, keeping admin full access via service role).
- Verify form submission tables (`contact_messages`, `volunteers`, `event_registrations`, `workshop_registrants`, `donations`, `orders`) and `integration_logs` are not publicly readable (already correct — admin reads via service role through server fns).

## Phase 5 — Refresh behavior

- After every admin save, invalidate relevant React Query keys (`["site-settings"]`, `["site-content", page]`, `["workshops"]`, etc.).
- Toasts: `השינוי נשמר בהצלחה` / error message.
- Public pages re-fetch on next mount; no redeploy.

## Out of scope / preserved as-is

- Existing pages, design tokens, RTL, WhatsApp/Accessibility/Chatbot floating buttons, calendar feature, AI analysis pipeline, admin auth/login, Supabase client files.
- No new admin from scratch — only extending current routes under `src/routes/admin._authed.*`.

## Suggested checkpoint cadence

I'll stop after **Phase 1** so you can confirm the WhatsApp/phone/email update flow works end-to-end before I tackle the larger page-texts and CMS sweeps. Reply "המשך" / "continue" to proceed phase by phase, or tell me to do everything in one go.
