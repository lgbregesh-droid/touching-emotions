
-- ============ New tables ============

CREATE TABLE public.lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text,
  full_description text,
  target_audience text,
  topics text,
  duration text,
  image_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_active_lectures ON public.lectures
  FOR SELECT USING (is_active = true);
CREATE TRIGGER trg_lectures_updated BEFORE UPDATE ON public.lectures
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  text text NOT NULL,
  image_url text,
  category text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_active_testimonials ON public.testimonials
  FOR SELECT USING (is_active = true);
CREATE TRIGGER trg_testimonials_updated BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.support_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price text,
  image_url text,
  contact_link text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_active_support_items ON public.support_items
  FOR SELECT USING (is_active = true);
CREATE TRIGGER trg_support_items_updated BEFORE UPDATE ON public.support_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_active_faq ON public.faq
  FOR SELECT USING (is_active = true);
CREATE TRIGGER trg_faq_updated BEFORE UPDATE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text,
  value text,
  type text NOT NULL DEFAULT 'text',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_settings ON public.site_settings
  FOR SELECT USING (true);
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  alt_text text,
  caption text,
  page text,
  section text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_media ON public.media
  FOR SELECT USING (true);

-- ============ Extend existing tables ============

ALTER TABLE public.workshops
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS full_description text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS age_group text,
  ADD COLUMN IF NOT EXISTS goals text,
  ADD COLUMN IF NOT EXISTS format text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS alt_text text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS page text,
  ADD COLUMN IF NOT EXISTS section text,
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'text';

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS inquiry_type text,
  ADD COLUMN IF NOT EXISTS source_page text;

ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS age text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS interests text,
  ADD COLUMN IF NOT EXISTS message text;

-- ============ Seed default site settings ============

INSERT INTO public.site_settings (key, label, value, type) VALUES
  ('phone', 'טלפון', '', 'text'),
  ('email', 'אימייל', '', 'text'),
  ('whatsapp_number', 'מספר וואטסאפ (כולל קידומת בינלאומית)', '', 'text'),
  ('facebook_url', 'קישור לפייסבוק', '', 'url'),
  ('instagram_url', 'קישור לאינסטגרם', '', 'url'),
  ('donation_link', 'קישור לתרומה', '', 'url'),
  ('footer_text', 'טקסט בתחתית האתר', 'לגעת ברגש © כל הזכויות שמורות', 'textarea'),
  ('association_number', 'מספר עמותה', '', 'text'),
  ('chatbot_enabled', 'הפעלת צ׳אטבוט (true/false)', 'false', 'text'),
  ('accessibility_statement_url', 'קישור להצהרת נגישות', '/accessibility', 'url'),
  ('privacy_policy_url', 'קישור למדיניות פרטיות', '/privacy', 'url')
ON CONFLICT (key) DO NOTHING;

-- ============ Storage buckets ============

INSERT INTO storage.buckets (id, name, public) VALUES
  ('lectures', 'lectures', true),
  ('testimonials', 'testimonials', true),
  ('support', 'support', true),
  ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for new buckets (writes happen via service role)
CREATE POLICY "public read lectures bucket" ON storage.objects FOR SELECT USING (bucket_id = 'lectures');
CREATE POLICY "public read testimonials bucket" ON storage.objects FOR SELECT USING (bucket_id = 'testimonials');
CREATE POLICY "public read support bucket" ON storage.objects FOR SELECT USING (bucket_id = 'support');
CREATE POLICY "public read media bucket" ON storage.objects FOR SELECT USING (bucket_id = 'media');
