
-- Extend ai_submission_analysis
ALTER TABLE public.ai_submission_analysis
  ADD COLUMN IF NOT EXISTS submission_table text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS main_need text,
  ADD COLUMN IF NOT EXISTS urgency_level text,
  ADD COLUMN IF NOT EXISTS short_summary text,
  ADD COLUMN IF NOT EXISTS missing_information jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_next_step text,
  ADD COLUMN IF NOT EXISTS suggested_activity_type text,
  ADD COLUMN IF NOT EXISTS matched_workshop_or_lecture jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS draft_reply text,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS ai_provider text,
  ADD COLUMN IF NOT EXISTS ai_model text,
  ADD COLUMN IF NOT EXISTS ai_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS error_message text;

CREATE UNIQUE INDEX IF NOT EXISTS ai_submission_analysis_submission_unique
  ON public.ai_submission_analysis (submission_id, submission_type);

-- Extend integration_logs
ALTER TABLE public.integration_logs
  ADD COLUMN IF NOT EXISTS submission_id uuid,
  ADD COLUMN IF NOT EXISTS submission_table text;

-- Add ai_status / email_status to all submission tables
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS ai_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_status text DEFAULT 'pending';
ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS ai_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_status text DEFAULT 'pending';
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS ai_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_status text DEFAULT 'pending';
ALTER TABLE public.workshop_registrants
  ADD COLUMN IF NOT EXISTS ai_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_status text DEFAULT 'pending';
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS ai_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_status text DEFAULT 'pending';
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS ai_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_status text DEFAULT 'pending';

-- ai_policies table
CREATE TABLE IF NOT EXISTS public.ai_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  instruction text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_policies_admin_all ON public.ai_policies;
CREATE POLICY ai_policies_admin_all ON public.ai_policies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow admin to read submission tables (currently public can only insert)
DROP POLICY IF EXISTS contact_messages_admin_read ON public.contact_messages;
CREATE POLICY contact_messages_admin_read ON public.contact_messages
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS contact_messages_admin_update ON public.contact_messages;
CREATE POLICY contact_messages_admin_update ON public.contact_messages
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS volunteers_admin_read ON public.volunteers;
CREATE POLICY volunteers_admin_read ON public.volunteers
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS volunteers_admin_update ON public.volunteers;
CREATE POLICY volunteers_admin_update ON public.volunteers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS event_registrations_admin_all ON public.event_registrations;
CREATE POLICY event_registrations_admin_all ON public.event_registrations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS workshop_registrants_admin_all ON public.workshop_registrants;
CREATE POLICY workshop_registrants_admin_all ON public.workshop_registrants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS donations_admin_all ON public.donations;
CREATE POLICY donations_admin_all ON public.donations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS orders_admin_all ON public.orders;
CREATE POLICY orders_admin_all ON public.orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- updated_at trigger for ai_policies
DROP TRIGGER IF EXISTS ai_policies_touch ON public.ai_policies;
CREATE TRIGGER ai_policies_touch
  BEFORE UPDATE ON public.ai_policies
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed default AI policies
INSERT INTO public.ai_policies (topic, instruction)
VALUES
  ('מחירים', 'אסור להמציא מחירים שאינם מופיעים ב-CMS. אם אין מחיר ב-CMS, ציין שצריך לבדוק עם בעלת האתר.'),
  ('תאריכים וזמינות', 'אסור להמציא תאריכים או זמינות. אם אין מידע ב-CMS, ציין שיש לבדוק זמינות.'),
  ('אבחון', 'אסור לאבחן או להציע אבחון. ההתייחסות היא ארגונית בלבד.'),
  ('טיפול', 'אסור להציע טיפול נפשי. אם נדרש טיפול, הפנה לאיש מקצוע מוסמך.'),
  ('הבטחת תוצאות', 'אסור להבטיח תוצאות רגשיות או הצלחה.'),
  ('מצוקה ובטיחות', 'אם זוהית מצוקה, פגיעה עצמית, אלימות או סכנה — קבע urgency_level=דורשת מענה מהיר והפנה למענה אנושי/מקצועי.')
ON CONFLICT DO NOTHING;

-- Seed site_settings keys
INSERT INTO public.site_settings (key, label, value, type) VALUES
  ('ai_provider', 'ספק AI', 'gemini', 'text'),
  ('gemini_model', 'מודל Gemini', 'google/gemini-2.5-flash', 'text'),
  ('ai_enabled', 'AI פעיל', 'true', 'boolean'),
  ('ai_analysis_enabled', 'ניתוח פניות AI פעיל', 'true', 'boolean'),
  ('owner_email', 'אימייל בעלים להתראות', '', 'text'),
  ('email_notifications_enabled', 'התראות אימייל פעילות', 'true', 'boolean')
ON CONFLICT (key) DO NOTHING;
