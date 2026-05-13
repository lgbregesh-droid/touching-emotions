
-- Status on existing tables
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Workshops
CREATE TABLE IF NOT EXISTS public.workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL,
  name_en text,
  desc_he text,
  desc_en text,
  date date,
  time time,
  location text,
  audience text,
  price numeric NOT NULL DEFAULT 0,
  max_participants integer,
  image_url text,
  status text NOT NULL DEFAULT 'open',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_workshops" ON public.workshops FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.workshop_registrants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workshop_registrants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_register" ON public.workshop_registrants FOR INSERT WITH CHECK (true);

-- Products (single product card)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_he text NOT NULL,
  name_en text,
  desc_he text,
  desc_en text,
  price numeric NOT NULL DEFAULT 0,
  image_url text,
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_products" ON public.products FOR SELECT USING (true);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name text NOT NULL,
  email text,
  phone text,
  quantity integer NOT NULL DEFAULT 1,
  amount numeric NOT NULL DEFAULT 0,
  shipping_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- no public policies; admin only

-- Donations (read-only mirror)
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text,
  email text,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'one_time',
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Site content (CMS)
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value_he text,
  value_en text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_content" ON public.site_content FOR SELECT USING (true);

-- Gallery
CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  storage_path text,
  order_index integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_gallery" ON public.gallery FOR SELECT USING (true);

-- Trigger: cap featured to 8
CREATE OR REPLACE FUNCTION public.enforce_featured_cap()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.featured = true THEN
    IF (SELECT COUNT(*) FROM public.gallery WHERE featured = true AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) >= 8 THEN
      RAISE EXCEPTION 'FEATURED_CAP_REACHED';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gallery_featured_cap ON public.gallery;
CREATE TRIGGER gallery_featured_cap BEFORE INSERT OR UPDATE ON public.gallery
FOR EACH ROW EXECUTE FUNCTION public.enforce_featured_cap();

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS workshops_touch ON public.workshops;
CREATE TRIGGER workshops_touch BEFORE UPDATE ON public.workshops FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS products_touch ON public.products;
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS site_content_touch ON public.site_content;
CREATE TRIGGER site_content_touch BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('workshops', 'workshops', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO NOTHING;

-- Public read policies for buckets
DO $$ BEGIN
  CREATE POLICY "public_read_gallery_obj" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public_read_workshops_obj" ON storage.objects FOR SELECT USING (bucket_id = 'workshops');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public_read_products_obj" ON storage.objects FOR SELECT USING (bucket_id = 'products');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed initial product
INSERT INTO public.products (slug, name_he, name_en, desc_he, desc_en, price, in_stock)
VALUES ('cards', 'קלפים טיפוליים', 'Therapeutic Cards', 'סט קלפים מקורי לעבודה רגשית.', 'Original card set for emotional work.', 120, true)
ON CONFLICT (slug) DO NOTHING;

-- Seed site_content keys (empty values; pages fall back to translations)
INSERT INTO public.site_content (key) VALUES
  ('home.hero.title'), ('home.hero.subtitle'),
  ('home.about.text'), ('home.quote'), ('home.cta.text'),
  ('about.main'),
  ('workshops.title'), ('workshops.subtitle')
ON CONFLICT (key) DO NOTHING;
