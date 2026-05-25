
-- Team members
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  role_he text NOT NULL,
  role_en text NOT NULL DEFAULT '',
  bio_he text,
  bio_en text,
  photo_url text,
  storage_path text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_team" ON public.team_members;
CREATE POLICY "public_read_team" ON public.team_members
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_all_team" ON public.team_members;
CREATE POLICY "admin_all_team" ON public.team_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS team_members_touch ON public.team_members;
CREATE TRIGGER team_members_touch BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- team-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-photos', 'team-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "team_photos_public_read" ON storage.objects;
CREATE POLICY "team_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'team-photos');

-- Active volunteers (separate from inquiries)
CREATE TABLE IF NOT EXISTS public.active_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  role text,
  area text,
  start_date date,
  notes text,
  status text NOT NULL DEFAULT 'active',
  source_inquiry_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.active_volunteers ADD COLUMN IF NOT EXISTS source_inquiry_id uuid;
ALTER TABLE public.active_volunteers ADD COLUMN IF NOT EXISTS area text;
ALTER TABLE public.active_volunteers ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.active_volunteers ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.active_volunteers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_active_volunteers" ON public.active_volunteers;
CREATE POLICY "admin_all_active_volunteers" ON public.active_volunteers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS active_volunteers_touch ON public.active_volunteers;
CREATE TRIGGER active_volunteers_touch BEFORE UPDATE ON public.active_volunteers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS active_volunteers_status_idx ON public.active_volunteers(status);
CREATE INDEX IF NOT EXISTS active_volunteers_source_idx ON public.active_volunteers(source_inquiry_id);
