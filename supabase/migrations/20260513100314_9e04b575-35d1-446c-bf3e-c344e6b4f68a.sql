-- Attach the featured cap trigger so the 8-image limit is actually enforced
DROP TRIGGER IF EXISTS enforce_featured_cap_trigger ON public.gallery;
CREATE TRIGGER enforce_featured_cap_trigger
  BEFORE INSERT OR UPDATE OF featured ON public.gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_featured_cap();