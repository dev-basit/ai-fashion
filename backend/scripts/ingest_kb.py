"""Knowledge base ingestion script.

Parses backend/knowledge-base.md, embeds each section, and upserts into Supabase.

Run from the backend/ directory:
    python -m scripts.ingest_kb
"""

import re
import sys
from pathlib import Path

from app.ai.models import embeddings
from app.core.supabase import get_admin_client

KB_PATH = Path(__file__).resolve().parents[1] / "knowledge-base.md"

DEFAULT_ROLES = ["admin", "staff", "customer"]


def parse_knowledge_base(raw: str) -> list[dict]:
    """Parse knowledge base markdown into sections."""
    sections: list[dict] = []
    parts = re.split(r"^(?=## )", raw, flags=re.MULTILINE)

    for part in parts:
        lines = part.split("\n")
        heading = lines[0].strip() if lines else ""
        if not heading.startswith("## "):
            continue

        section = heading[len("## ") :].strip()

        roles = list(DEFAULT_ROLES)
        roles_line = next(
            (line for line in lines[1:4] if line.strip().startswith("<!-- roles:")),
            None,
        )
        if roles_line:
            match = re.search(r"<!--\s*roles:\s*([^>]+)\s*-->", roles_line)
            if match:
                roles = [r.strip() for r in match.group(1).split(",") if r.strip()]

        content = "\n".join(
            line
            for line in lines[1:]
            if not line.strip().startswith("<!-- roles:") and line.strip() != "---"
        ).strip()

        if content:
            sections.append({"section": section, "content": content, "roles": roles})

    return sections


def main() -> None:
    """Main ingestion function."""
    raw = KB_PATH.read_text(encoding="utf-8")
    sections = parse_knowledge_base(raw)

    print(f"Parsed {len(sections)} sections from knowledge base")
    for s in sections:
        print(f"  [{','.join(s['roles'])}] {s['section']}")

    supabase = get_admin_client()

    delete_res = supabase.table("document_chunks").delete().neq("id", 0).execute()
    if getattr(delete_res, "error", None):
        print(f"Failed to clear existing chunks: {delete_res.error}")
        sys.exit(1)

    for s in sections:
        section, content, roles = s["section"], s["content"], s["roles"]
        print(f"  Embedding: {section} ... ", end="", flush=True)
        vectors = embeddings.embed_documents([content])
        embedding = vectors[0]

        res = (
            supabase.table("document_chunks")
            .insert(
                {
                    "section": section,
                    "content": content,
                    "embedding": embedding,
                    "roles": roles,
                }
            )
            .execute()
        )
        if getattr(res, "error", None):
            print(f"\nFailed to insert \"{section}\": {res.error}")
            sys.exit(1)
        print("done")

    print(f"\nIngested {len(sections)} chunks successfully.")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(err)
        sys.exit(1)
