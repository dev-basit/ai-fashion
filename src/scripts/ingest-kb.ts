/**
 * Knowledge base ingestion script.
 * Parses src/ai/knowledge-base.md, embeds each section, and upserts into Supabase.
 *
 * Run: npm run ingest-kb
 */

import fs from "fs";
import path from "path";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getAdminClient } from "@/services/supabase-admin";
import { env } from "@/config/env";

interface KBSection {
  section: string;
  content: string;
  roles: string[];
}

function parseKnowledgeBase(raw: string): KBSection[] {
  const sections: KBSection[] = [];
  // Split on lines that start with "## " (h2 headings)
  const parts = raw.split(/^(?=## )/m);

  for (const part of parts) {
    const lines = part.split("\n");
    const heading = lines[0]?.trim();
    if (!heading?.startsWith("## ")) continue;

    const section = heading.replace(/^## /, "").trim();

    // Look for <!-- roles: ... --> comment in first 3 lines after heading
    let roles: string[] = ["admin", "staff", "customer"];
    const rolesLine = lines.slice(1, 4).find((l) => l.trim().startsWith("<!-- roles:"));
    if (rolesLine) {
      const match = rolesLine.match(/<!--\s*roles:\s*([^>]+)\s*-->/);
      if (match) {
        roles = match[1]
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
      }
    }

    // Content = everything after the heading and optional roles comment, stripped of HR separators
    const content = lines
      .slice(1)
      .filter((l) => !l.trim().startsWith("<!-- roles:") && l.trim() !== "---")
      .join("\n")
      .trim();

    if (content.length > 0) {
      sections.push({ section, content, roles });
    }
  }

  return sections;
}

async function main() {
  const kbPath = path.join(process.cwd(), "src/ai/knowledge-base.md");
  const raw = fs.readFileSync(kbPath, "utf-8");
  const sections = parseKnowledgeBase(raw);

  console.log(`Parsed ${sections.length} sections from knowledge base`);
  sections.forEach((s) => console.log(`  [${s.roles.join(",")}] ${s.section}`));

  const embeddings = new OpenAIEmbeddings({
    model: env.openai.embeddingModel,
    apiKey: env.openai.apiKey,
  });

  const supabase = getAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Clear existing chunks
  const { error: deleteError } = await db.from("document_chunks").delete().neq("id", 0);
  if (deleteError) {
    console.error("Failed to clear existing chunks:", deleteError.message);
    process.exit(1);
  }

  // Embed and insert each section
  for (const { section, content, roles } of sections) {
    process.stdout.write(`  Embedding: ${section} ... `);
    const vectors = await embeddings.embedDocuments([content]);
    const embedding = vectors[0];

    const { error } = await db.from("document_chunks").insert({
      section,
      content,
      embedding: JSON.stringify(embedding),
      roles,
    });

    if (error) {
      console.error(`\nFailed to insert "${section}":`, error.message);
      process.exit(1);
    }
    console.log("done");
  }

  console.log(`\nIngested ${sections.length} chunks successfully.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
