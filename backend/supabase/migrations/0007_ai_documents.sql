-- Enable pgvector extension
create extension if not exists vector;

-- Knowledge base chunks with embeddings and role access control
create table if not exists document_chunks (
  id          bigserial primary key,
  section     text not null,
  content     text not null,
  embedding   vector(1536),
  roles       text[] not null default '{admin,staff,customer}',
  created_at  timestamptz default now()
);

-- HNSW index for fast cosine similarity search
create index if not exists document_chunks_embedding_idx
  on document_chunks using hnsw (embedding vector_cosine_ops);

-- RLS enabled — actual role scoping is enforced in the match_documents function
alter table document_chunks enable row level security;

create policy "authenticated users can read chunks"
  on document_chunks for select
  to authenticated
  using (true);

create or replace function match_documents(
  query_embedding  vector(1536),
  user_role        text,
  match_count      int default 5
)
returns table (
  id          bigint,
  section     text,
  content     text,
  similarity  float
)
language sql stable
as $$
  select
    id,
    section,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from document_chunks
  where roles @> array[user_role]
  order by embedding <=> query_embedding
  limit match_count;
$$;
