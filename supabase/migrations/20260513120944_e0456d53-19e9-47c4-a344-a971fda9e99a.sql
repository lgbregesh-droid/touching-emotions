ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'כללי';
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);