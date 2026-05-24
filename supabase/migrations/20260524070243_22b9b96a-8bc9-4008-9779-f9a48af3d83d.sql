-- AI submission analysis
CREATE TABLE public.ai_submission_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  submission_type text NOT NULL CHECK (submission_type IN ('contact','volunteer')),
  summary text,
  sentiment text CHECK (sentiment IN ('positive','neutral','negative','urgent')),
  category text,
  priority text CHECK (priority IN ('low','medium','high')),
  suggested_response text,
  model text,
  rag_documents_used jsonb NOT NULL DEFAULT '[]'::jsonb,
  rag_context_chars integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_submission_analysis_submission_idx
  ON public.ai_submission_analysis(submission_type, submission_id, created_at DESC);

ALTER TABLE public.ai_submission_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_analysis_admin_all" ON public.ai_submission_analysis
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Integration logs
CREATE TABLE public.integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('success','failed','pending')),
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX integration_logs_type_created_idx
  ON public.integration_logs(integration_type, created_at DESC);

ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integration_logs_admin_all" ON public.integration_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);