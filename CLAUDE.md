# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glow By Miral is a parlor/salon/spa app. The repo is a monorepo with two independent sub-projects:

- `backend/` — FastAPI + PostgreSQL + pgvector + LangGraph/LangChain AI layer
- `frontend/` — Next.js 16 + React 19 + Tailwind CSS 4

---

## Backend

All backend commands must be run from `backend/` with the venv activated.

```bash
cd backend
source venv/bin/activate
```

### Dev server

```bash
uvicorn main:app --reload --port 8000
```

### Database migrations (Alembic)

```bash
# After adding/changing SQLAlchemy models:
alembic revision --autogenerate -m "describe change"
alembic upgrade head

# Downgrade one step:
alembic downgrade -1
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Environment

Copy `backend/.env.example` → `backend/.env` and fill in values. The app loads `.env` via pydantic-settings; `PYTHONPATH` must be set to `backend/` when running outside uvicorn (e.g. `PYTHONPATH=. python ...`).

---

## Frontend

> **Critical:** This project uses Next.js **16.2.11** and React **19**. APIs, conventions, and file structure may differ significantly from Next.js 13–15. Before writing any frontend code, read the relevant guide in `frontend/node_modules/next/dist/docs/`.

```bash
cd frontend
npm run dev       # dev server (default port 3000)
npm run build     # production build
npm run lint      # ESLint
```

---

## Architecture

### Backend layers

**`backend/main.py`** — FastAPI app entry point. Registers routers and global CORS middleware. Add new routers here.

**`backend/app/config/`** — Central config hub.

- `settings.py`: Pydantic `Settings` loaded from `.env`. Single source of truth for all env vars.
- `database.py`: SQLAlchemy `engine`, `SessionLocal`, `Base` (all models must inherit from this `Base` for Alembic autogenerate to work), and `get_db` FastAPI dependency.
- `enums.py`: Shared enums (`ChatRole`, `AIModel`).
- `__init__.py`: Re-exports `settings`, `Base`, `get_db`, `AIModel`, `ChatRole` — always import from `app.config` rather than from sub-modules.

**`backend/app/ai/`** — AI/RAG pipeline (LangChain-based).

- `llm.py`: `get_llm()` — cached `ChatOpenAI` instance (default: `gpt-4o-mini`).
- `embeddings.py`: `get_embeddings()` — cached `OpenAIEmbeddings` (`text-embedding-3-small`).
- `rag.py`: Full RAG pipeline using PGVector as the vector store, history-aware retriever, and a stuff-documents QA chain. Exposes `run_rag_chain()` (one-shot) and `stream_rag_chain()` (async generator for SSE streaming). Vector documents are filtered by `conversation_id`.
- `memory.py`: Not yet implemented.

**`backend/app/routes/`** — FastAPI `APIRouter` modules. Register each router in `main.py`.

**`backend/app/models/`** — SQLAlchemy ORM models. Every model must import and subclass `Base` from `app.config` so Alembic can detect it.

**`backend/app/schemas/`** — Pydantic request/response models.

**`backend/app/services/`** — Business logic, called by route handlers.

**`backend/app/controllers/`** — Optional controller layer between routes and services.

**`backend/migrations/`** — Alembic migrations directory. `env.py` reads `DATABASE_URL` from `settings` and uses `Base.metadata` for autogenerate — no manual wiring needed when new models are added.

### Frontend structure

Standard Next.js App Router layout under `frontend/src/app/`. Subdirectories in `frontend/src/` (`components/`, `hooks/`, `providers/`, `services/`, `store/`, `types/`, `utils/`) are empty scaffolding to be filled.

### Data flow

```
Frontend (Next.js) → FastAPI routes → services → SQLAlchemy models (Postgres)
                                               → AI services → LangChain/LangGraph → OpenAI
                                                            → PGVector (pgvector in Postgres)
```
