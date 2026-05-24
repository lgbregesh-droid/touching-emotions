DROP POLICY IF EXISTS public_read_workshops ON public.workshops;
CREATE POLICY public_read_active_workshops ON public.workshops
  FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS public_read_gallery ON public.gallery;
CREATE POLICY public_read_active_gallery ON public.gallery
  FOR SELECT TO public USING (is_active = true);