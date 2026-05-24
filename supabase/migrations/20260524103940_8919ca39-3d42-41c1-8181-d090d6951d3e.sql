ALTER TABLE public.workshops
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS goals_list text,
  ADD COLUMN IF NOT EXISTS duration_text text;