-- Remove permissive public INSERT policies. All form submissions are handled by
-- server functions using the service role client (supabaseAdmin), which bypasses RLS.
-- These public policies are unnecessary and were flagged as overly permissive.
DROP POLICY IF EXISTS "anyone_can_insert_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "anyone_can_insert_volunteer" ON public.volunteers;
DROP POLICY IF EXISTS "public_register_event" ON public.event_registrations;
DROP POLICY IF EXISTS "public_register" ON public.workshop_registrants;