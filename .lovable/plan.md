# LinkedIn Agent — Build Plan

Add a LinkedIn post generator + publisher to the existing admin dashboard. Nothing existing is removed.

## 1. Database (migration)

New table `linkedin_posts` with columns from the spec (post_type, topic, context_data jsonb, draft_he/en, final_text_he/en, published_language, linkedin_post_id, linkedin_status, published_at, generated_options jsonb, selected_option, generation_model, created_at, updated_at).

- RLS enabled. Policy: `linkedin_posts_admin_all` for `authenticated` (same pattern as other admin tables).
- Trigger `touch_updated_at` for `updated_at`.
- Add `linkedin_token_updated_at` row in `site_settings`.

## 2. Server functions (TanStack `createServerFn`, not Edge Functions)

Per project stack rules, server logic = `createServerFn` under `src/lib/admin/linkedin.functions.ts`, all guarded by `requireAdmin` middleware.

- `generateLinkedInPosts({ post_type, context })` — pulls RAG context + relevant workshop/event/CMS data, calls Gemini via existing `chatCompletion` helper in `src/lib/ai/gateway.server.ts` with the prompt from the spec, returns `{ options: [{id, he, en, hashtags_he, hashtags_en, hook_he, hook_en}, ...] }`. Logs to `integration_logs`.
- `saveLinkedInDraft({ id?, post_type, context_data, generated_options, selected_option, final_text_he, final_text_en, published_language })` — upserts a `draft` row.
- `publishLinkedInPost({ post_id, text_he, text_en, language })` — reads `LINKEDIN_ACCESS_TOKEN` + `LINKEDIN_PERSON_ID` from `process.env`, POSTs to `https://api.linkedin.com/v2/ugcPosts` for each requested language, updates row to `published`/`failed`, logs to `integration_logs`, returns `{ success, post_urls? , error? }`.
- `listLinkedInPosts({ status?, post_type?, from?, to? })` — list/filter for history tab.
- `archiveLinkedInPost({ id })` — sets `linkedin_status = 'archived'`.

Both LinkedIn secrets already exist (`LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_ID`).

## 3. Admin UI

- Sidebar: add **💼 לינקדאין** to `AdminShell` items, below Gallery, route `/admin/linkedin`.
- New route file `src/routes/admin._authed.linkedin.tsx`. Two tabs: **Create** and **History**.

### Create tab (4 steps)

1. Post type cards (6) — workshop_promo, event_promo, success_story, educational, nonprofit_update, volunteer_call.
2. Dynamic context form per type. Workshop/event selectors load from existing tables via existing admin data functions.
3. After generation: show 3 options, each as a card with radio + editable HE/EN textareas + char counter (green <2800, yellow 2800–3000, red >3000) + hashtags pill row. "Regenerate" button keeps current selected card text untouched until user picks new options.
4. Publish step: language selector (he / en / both), "Publish to LinkedIn", "Save as draft". Success toast with post URL(s); failure toast with fallback-to-draft.

### History tab

Table with date / type / preview (80 chars) / language / status badge / actions (view, edit&publish, copy, archive). Filters by type, status, date range.

Token-expiry banner at top of the page from `site_settings.linkedin_token_updated_at`.

## 4. Translations

Add the `admin.linkedin.*` keys into `src/i18n/translations.ts` (Hebrew only — admin is Hebrew).

## 5. Acceptance

- Generate → edit → publish flow works in HE / EN / both.
- Drafts and failures persist; history shows everything.
- No credentials in frontend (only in server functions reading `process.env`).
- Existing features untouched.

## Technical notes

- We use `createServerFn` rather than Supabase Edge Functions because this stack is TanStack Start (per project rules).
- Reuses existing `chatCompletion` (Lovable AI gateway, model `google/gemini-2.5-flash`) — no new API key required.
- LinkedIn API call is a plain `fetch` from the server function.
- Auth: `requireAdmin` middleware already used by all other admin functions.
- I added `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_ID with the credentials to linkedin`