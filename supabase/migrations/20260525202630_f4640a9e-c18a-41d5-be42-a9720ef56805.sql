
-- Drop overly permissive "admin" policies that granted access to any authenticated user.
-- Server-side admin operations use the service role, which bypasses RLS, so no replacement policy is needed.

DROP POLICY IF EXISTS admin_all_active_volunteers ON public.active_volunteers;
DROP POLICY IF EXISTS ai_policies_admin_all ON public.ai_policies;
DROP POLICY IF EXISTS ai_analysis_admin_all ON public.ai_submission_analysis;
DROP POLICY IF EXISTS contact_messages_admin_read ON public.contact_messages;
DROP POLICY IF EXISTS contact_messages_admin_update ON public.contact_messages;
DROP POLICY IF EXISTS donations_admin_all ON public.donations;
DROP POLICY IF EXISTS event_registrations_admin_all ON public.event_registrations;
DROP POLICY IF EXISTS integration_logs_admin_all ON public.integration_logs;
DROP POLICY IF EXISTS linkedin_posts_admin_all ON public.linkedin_posts;
DROP POLICY IF EXISTS orders_admin_all ON public.orders;
DROP POLICY IF EXISTS rag_chunks_admin_all ON public.rag_chunks;
DROP POLICY IF EXISTS rag_documents_admin_all ON public.rag_documents;
DROP POLICY IF EXISTS admin_all_team ON public.team_members;
DROP POLICY IF EXISTS volunteers_admin_read ON public.volunteers;
DROP POLICY IF EXISTS volunteers_admin_update ON public.volunteers;
DROP POLICY IF EXISTS workshop_registrants_admin_all ON public.workshop_registrants;

-- Lock down SECURITY DEFINER function so it is not callable by anon/authenticated roles.
REVOKE EXECUTE ON FUNCTION public.handle_event_registration() FROM PUBLIC, anon, authenticated;
