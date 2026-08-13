import { getAdminClient } from "@/services/supabase-admin";

export interface MatchedChunk {
  id: number;
  section: string;
  content: string;
  similarity: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * (b[i] ?? 0);
    magA += a[i] * a[i];
    magB += (b[i] ?? 0) * (b[i] ?? 0);
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom ? dot / denom : 0;
}

function parseVector(v: unknown): number[] {
  if (Array.isArray(v)) return v as number[];
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return []; }
  }
  return [];
}

export async function matchDocuments(
  queryEmbedding: number[],
  userRole: string,
  matchCount = 5,
): Promise<MatchedChunk[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any;

  const { data, error } = await db
    .from("document_chunks")
    .select("id, section, content, embedding")
    .contains("roles", [userRole]);

  if (error) {
    console.error("matchDocuments error:", error.message);
    return [];
  }

  return ((data as { id: number; section: string; content: string; embedding: unknown }[]) ?? [])
    .map((chunk) => ({
      id: chunk.id,
      section: chunk.section,
      content: chunk.content,
      similarity: cosineSimilarity(queryEmbedding, parseVector(chunk.embedding)),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, matchCount);
}
