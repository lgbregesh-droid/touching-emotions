
CREATE TABLE IF NOT EXISTS public.linkedin_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type text NOT NULL,
  topic text,
  context_data jsonb DEFAULT '{}'::jsonb,
  draft_he text,
  draft_en text,
  final_text_he text,
  final_text_en text,
  published_language text DEFAULT 'he',
  linkedin_post_id text,
  linkedin_post_url text,
  linkedin_status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  generated_options jsonb DEFAULT '[]'::jsonb,
  selected_option integer,
  generation_model text DEFAULT 'google/gemini-2.5-flash',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "linkedin_posts_admin_all" ON public.linkedin_posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER trg_linkedin_posts_updated_at
  BEFORE UPDATE ON public.linkedin_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_linkedin_posts_created_at ON public.linkedin_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_status ON public.linkedin_posts (linkedin_status);

INSERT INTO public.site_settings (key, type, label, value)
VALUES ('linkedin_token_updated_at', 'text', 'LinkedIn token last updated', NULL)
ON CONFLICT DO NOTHING;
