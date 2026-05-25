ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS related_item_type text,
  ADD COLUMN IF NOT EXISTS related_item_id text,
  ADD COLUMN IF NOT EXISTS related_item_title text;