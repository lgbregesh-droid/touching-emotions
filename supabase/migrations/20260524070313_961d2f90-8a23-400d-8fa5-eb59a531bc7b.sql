-- pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents
CREATE TABLE public.rag_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('org_profile','workshops_full')),
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('pdf','docx','txt')),
  storage_path text NOT NULL,
  file_url text,
  extraction_status text NOT NULL DEFAULT 'pending' CHECK (extraction_status IN ('pending','completed','failed')),
  extraction_error text,
  is_active boolean NOT NULL DEFAULT true,
  language text NOT NULL DEFAULT 'he' CHECK (language IN ('he','en','both')),
  chars_total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_rag_documents_touch
BEFORE UPDATE ON public.rag_documents
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rag_documents_admin_all" ON public.rag_documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Chunks
CREATE TABLE public.rag_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.rag_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rag_chunks_document_idx ON public.rag_chunks(document_id, chunk_index);
CREATE INDEX rag_chunks_embedding_idx ON public.rag_chunks
  USING hnsw (embedding vector_cosine_ops);

ALTER TABLE public.rag_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rag_chunks_admin_all" ON public.rag_chunks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Match function
CREATE OR REPLACE FUNCTION public.match_rag_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 8,
  min_similarity float DEFAULT 0.5
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  chunk_index int,
  content text,
  similarity float,
  doc_title text,
  doc_category text,
  doc_language text
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT
    c.id AS chunk_id,
    c.document_id,
    c.chunk_index,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity,
    d.title AS doc_title,
    d.category AS doc_category,
    d.language AS doc_language
  FROM public.rag_chunks c
  JOIN public.rag_documents d ON d.id = c.document_id
  WHERE d.is_active = true
    AND d.extraction_status = 'completed'
    AND 1 - (c.embedding <=> query_embedding) >= min_similarity
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Private storage bucket for RAG source files
INSERT INTO storage.buckets (id, name, public)
VALUES ('rag-documents', 'rag-documents', false)
ON CONFLICT (id) DO NOTHING;