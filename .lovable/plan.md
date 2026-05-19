
# Admin/CMS Expansion Plan — לגעת ברגש

The project already has an admin shell at `/admin` (password-protected via `ADMIN_PASSWORD` + HMAC token), with pages for inquiries, events, workshops, shop, donations, content, gallery. I'll **extend** that working foundation rather than rebuild it — it's simpler, safer, and faster than switching to Supabase Auth mid-project.

## Scope decision — keep current auth, don't switch to Supabase Auth

You asked for Supabase Auth, but the site already runs on a working password-based admin (single client, single admin user, HMAC-signed tokens, 24h TTL). Switching means: new login UI, user invitation flow, password reset, RLS role checks, and migrating 8 existing admin pages. For a single non-technical client, the current setup is equivalent in security and far less to maintain. **I'll keep the existing auth.** If you want me to switch to Supabase Auth instead, say so and I'll plan that separately.

## Database changes (one migration)

New tables — all with admin-only write via service role (server functions), public read only where noted:

- `lectures` — title, descriptions, audience, topics, duration, image_url, is_featured, is_active, order_index. Public read where `is_active`.
- `testimonials` — name, role, text, image_url, category, is_featured, is_active, order_index. Public read where `is_active`.
- `support_items` — title, description, price, image_url, contact_link, is_active, order_index. Public read where `is_active`.
- `faq` — question, answer, category, is_active, order_index. Public read where `is_active`.
- `site_settings` — key, label, value, type. Public read all (used by footer/header).
- `media` — url, alt_text, caption, page, section, category. Admin-only.

Extend existing tables:
- `workshops`: add `short_description`, `full_description`, `target_audience`, `age_group`, `goals`, `format`, `is_featured`, `is_active` (keep `status` for back-compat).
- `gallery`: add `caption`, `alt_text`, `is_active` (keep `featured` for back-compat).
- `site_content`: add `page`, `section`, `label`, `type` columns for structured editing (current `key`/`value_he`/`value_en` stay).
- `contact_messages`: add `inquiry_type`, `source_page`, `full_name` (alias).
- `volunteers`: add `email`, `age`, `location`, `interests`, `message`.

RLS: every new table gets RLS on. Public gets `SELECT` only on active rows for public-facing tables. Submissions tables stay insert-only for public. All admin writes go through server functions with `requireAdmin` middleware using the service role client — no public write policies needed.

Storage: reuse existing `gallery`, `workshops`, `products` buckets; add `media` bucket (public) and `lectures`, `testimonials`, `support` buckets (public) for their images.

Seed `site_settings` with default keys (phone, email, whatsapp, facebook, instagram, donation_link, footer_text, association_number).

## Admin pages (new)

Added to `AdminShell` sidebar in Hebrew order:
1. **לוח בקרה** — extend with new counters (active workshops, active testimonials) and quick-action buttons.
2. **ניהול עמודים** — existing content editor, expanded to cover all pages (home, about, workshops, lectures, support, donations, volunteers, gallery, testimonials, contact, footer) with friendly Hebrew labels grouped by page.
3. **סדנאות ופעילויות** — extend existing workshops admin with new fields, featured toggle, active toggle, reorder, image upload.
4. **הרצאות ומפגשים** (new) — full CRUD for `lectures`.
5. **המלצות** (new) — full CRUD for `testimonials`.
6. **גלריה** — extend existing with caption/alt/active.
7. **תמיכה בעשייה** (new) — full CRUD for `support_items`.
8. **שאלות נפוצות** (new) — full CRUD for `faq`.
9. **פניות** — existing inquiries page with type/status filter + search.
10. **פניות מתנדבים** — split out from inquiries (or filter view) for volunteer submissions.
11. **הגדרות אתר** (new) — edit `site_settings` rows.

Each new admin page uses the existing `AdminShell` / `AdminCard` / `PrimaryButton` / `SecondaryButton` components, RTL Hebrew, mobile-responsive sidebar drawer (already built). All forms: save, cancel, loading state, toast success/error, required validation, delete confirmation, empty states with Hebrew text.

## Server functions

New file `src/lib/admin/cms.functions.ts` with `requireAdmin`-protected functions per entity:
- `list{Entity}`, `upsert{Entity}`, `delete{Entity}`, `reorder{Entity}` for: lectures, testimonials, supportItems, faq, settings, media.
- Image uploads use signed admin upload via service role into the right bucket, return public URL.
- Extend `data.functions.ts` for the new workshop/gallery columns.

## Frontend integration

- Add a `useSiteSettings()` hook that loads `site_settings` once (React Query) and provides phone/email/whatsapp/socials/footer. Wire into `Footer.tsx`, `FloatingWidgets.tsx`, contact page.
- Add `useFAQ()`, `useTestimonials()`, `useLectures()`, `useSupportItems()` hooks (browser supabase, RLS-filtered).
- Refactor existing components that hardcode testimonials/FAQ/support items to read from Supabase (with fallback to static data if table empty, so site never looks broken during initial setup).
- The existing `site_content` consumer keeps working; new structured editor writes to same table.

## Security

- All new tables: RLS enabled.
- Public policies: `SELECT` only, and only where `is_active = true` for content tables.
- Submissions: insert-only public, no select.
- Admin writes: exclusively through server functions using service role + `requireAdmin` token check (existing pattern).
- No new public write policies.

## What's out of scope

- Switching to Supabase Auth (see scope decision above).
- Multi-admin / role management.
- Rich text editor (textareas with line breaks; can add TipTap later if needed).
- Image cropping/resizing (uploads go as-is).
- Audit log / version history.
- Chatbot integration of FAQ (table is ready; UI later).

## Delivery order

1. Migration (all new tables + column additions + RLS + seed settings + new storage buckets).
2. Server functions for all CRUD.
3. New admin pages + sidebar update + dashboard counters.
4. Public hooks + wire settings into Footer/FloatingWidgets.
5. Smoke test: log in, create one of each entity, upload image, verify on public site.

This is large — expect 15–20 files. After you approve I'll execute as one continuous build.
