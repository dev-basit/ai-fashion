create or replace function match_documents(
  query_embedding  vector(1536),
  user_role        text,
  match_threshold  float default 0.5,
  match_count      int   default 5
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
    and 1 - (embedding <=> query_embedding) >= match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
