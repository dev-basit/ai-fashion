# Glow By Miral — Backend (FastAPI)

Premium salon/spa management app backend. All business logic, Supabase queries, user management, AI, and notifications live here.

---

## Quick Start

### Prerequisites

- Python 3.14+
- PostgreSQL (via Supabase)
- OpenAI API key (for AI features)

### Environment Setup

1. Copy `.env.example` to `.env` and fill in your secrets:

   ```bash
   cp .env.example .env
   ```

2. Required environment variables:

   **Supabase (required):**

   ```
   SUPABASE_URL              # Your Supabase project URL
   SUPABASE_PUBLISHABLE_KEY  # Supabase publishable/anon key
   SUPABASE_SECRET_KEY       # Supabase service-role key (never expose to client)
   ```

   **OpenAI (required for AI features):**

   ```
   OPENAI_API_KEY            # OpenAI API key for embeddings & LLM chat
   OPENAI_CHAT_MODEL         # LLM for chat (default: gpt-4o-mini)
   OPENAI_EMBEDDING_MODEL    # Model for embeddings (default: text-embedding-3-small)
   AI_DAILY_LIMIT            # Daily AI chat limit per user (default: 20)
   ```

   **Frontend Integration:**

   ```
   FRONTEND_URL              # Frontend origin for CORS (default: http://localhost:3000)
   ```

### Installation

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## Running the Server

### Development Server

```bash
# Start with auto-reload on code changes
uvicorn main:app --reload --port 8000
```

The API will be available at:

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

### Production Server

```bash
# Run with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Database Migrations

Migrations are stored in `backend/supabase/migrations/` and managed via Supabase CLI.

### Apply Migrations

All migration commands must be run from the `backend/` directory:

```bash
cd backend

# Apply new migrations WITHOUT resetting data (preferred)
supabase db push

# ⚠️ DESTRUCTIVE — wipes all data, always ask user first
supabase db reset
```

### Create a New Migration

```bash
cd backend

# Create a new migration file
supabase migration new <migration_name>

# Edit the created file in backend/supabase/migrations/

# Then apply it
supabase db push
```

### Canonical Schema

The authoritative database schema is in:

- `backend/supabase/migrations/0001_initial_schema.sql` — **DO NOT EDIT**

Additional migrations handle:

- `0002_grants.sql` — Role-based access
- `0003_profiles_select_authenticated.sql` — Staff visibility to customers
- `0004_remove_service_tags.sql` — Schema cleanup
- `0005_fix_chat_rls_recursion.sql` — Chat RLS recursion fix
- `0006_consultation_records_customer_insert.sql` — Customer consultation inserts
- `0007_ai_documents.sql` — AI knowledge base (document_chunks, pgvector)
- `0008_ai_usage.sql` — AI rate-limiting table
- `0009_ai_conversations.sql` — AI conversation history table

---

## Database Seeding

Populate the database with initial data (users, services, products, templates, settings).

```bash
# Run seeding script
python -m scripts.seed
```

### What Gets Seeded

- **Users**: 5 demo users (admin, 2 staff, 2 customers)
- **Profiles**: Role assignments (admin, staff, customer)
- **Staff Profiles**: Bio, certifications, hourly rates
- **Service Categories & Services**: 5 categories, 16 services
- **Consultation Templates**: 1 template (more can be added)
- **Treatment Plan Templates**: 13 comprehensive treatment plans
- **Product Categories & Products**: 4 categories, 16 products with SVG images
- **Business Settings**: Hours, timezone, booking rules, notifications

- `admin@gmail.com` — Admin (full access)
- `staff@gmail.com` — Staff (Sarah Mitchell)
- `ahmad@gmail.com` — Staff (Ahmad)
- `customer@gmail.com` — Customer (Emma Johnson)
- `basit@gmail.com` — Customer (Basit)

---

## Knowledge Base Ingestion

Parse `knowledge-base.md`, embed sections with OpenAI, and upsert into Supabase for AI RAG.

```bash
# Ingest knowledge base
python -m scripts.ingest_kb
```

### Workflow

1. Edit `knowledge-base.md` with your content
2. Optionally mark sections with role restrictions:

   ```markdown
   ## Admin-Only Section

   <!-- roles: admin -->

   This section is only visible to admins...
   ```

3. Run ingestion to embed and upsert all sections:
   ```bash
   python -m scripts.ingest_kb
   ```
4. AI RAG will use the embedded sections in responses

### Requirements

- `OPENAI_API_KEY` must be set
- `OPENAI_EMBEDDING_MODEL` (default: text-embedding-3-small)

---

## Project Structure

```
backend/
├── main.py                  # FastAPI app, CORS, auth middleware, router registration
├── requirements.txt         # Python dependencies
├── knowledge-base.md        # AI knowledge base (edit here, then ingest)
├── .env                     # Secrets (gitignored)
├── .env.example             # Template for .env
│
├── scripts/
│   ├── seed.py              # Database seeding
│   └── ingest_kb.py         # Knowledge base ingestion
│
└── app/
    ├── config/
    │   └── config.py        # Pydantic Config (class Config, instance `config`)
    ├── core/
    │   ├── supabase.py      # get_admin_db_client(), get_db_client(token)
    │   ├── context.py       # ContextVars: get_db(), get_current_user(), get_token()
    │   ├── auth.py          # require_admin(), get_admin_auth()
    │   └── notify.py        # notify_user_and_admins(), notify_admins()
    ├── routes/              # Thin controllers (parse, call service, return)
    │   ├── health.py
    │   ├── me.py, profiles.py
    │   ├── appointments.py, clients.py
    │   ├── products.py, salon_services.py, staff.py, orders.py
    │   ├── consultation.py, treatment_plans.py
    │   ├── notifications.py, settings.py, reports.py, ai.py
    │   └── chat.py
    ├── services/            # Business logic + Supabase queries (use get_db() from context)
    │   ├── appointments.py, clients.py, products.py
    │   ├── salon_services.py, staff.py, orders.py
    │   ├── consultation.py, treatment_plans.py
    │   ├── notifications.py, settings.py, reports.py
    │   ├── profiles.py, ai_service.py
    │   └── chat.py
    ├── ai/                  # LangGraph + RAG + tool-calling
    │   ├── state.py         # AgentState (TypedDict)
    │   ├── models.py        # ChatOpenAI, OpenAIEmbeddings
    │   ├── rag.py           # retrieve node (cosine similarity)
    │   ├── agent.py         # agent node + conditional routing
    │   ├── graph.py         # Compiled StateGraph
    │   └── tools/           # Role-scoped tool implementations
    │       ├── __init__.py  # get_role_tools(), customer/staff/admin tool lists
    │       └── utils.py     # get_user_id(config)
    ├── schemas/             # Pydantic request/response models (one file per domain)
    └── utils/
        ├── product_svgs.py  # PRODUCT_SVGS (15 product icons)
        └── seed_data.py     # Seed data (services, products, templates, etc.)
```

---

## Common Tasks

### Start Development Server + Frontend

From the project root:

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # or activate on Windows
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

Then visit http://localhost:3000.

### Seed the Database

```bash
cd backend
python -m scripts.seed
```

### Ingest Knowledge Base

```bash
cd backend
python -m scripts.ingest_kb
```

### Reset Database to Clean State

⚠️ **DESTRUCTIVE** — This will wipe all data. Only run if you mean to:

```bash
# From backend directory
cd backend
supabase db reset

# Then re-seed
python -m scripts.seed
```

### Test API Endpoints

Navigate to http://localhost:8000/docs for interactive Swagger UI.

---

## Architecture Overview

### Data Flow

```
Frontend (Next.js)
    ↓ axios + Bearer JWT
auth_middleware (main.py)
    ↓ validates JWT, sets get_db() / get_current_user() / get_token() in context vars
API Routes (FastAPI)
    ↓ parse params, call services (no auth params needed)
Business Logic (Services)
    ↓ get_db() — RLS-scoped client from context
Supabase (PostgreSQL + RLS)
    ↓ enforce row-level security
Database
```

### Key Patterns

- **Auth via middleware** — `auth_middleware` in `main.py` validates the JWT and sets context variables (`_db_var`, `_user_var`, `_token_var`) for the request lifetime. Routes need no auth parameters.
- **Sync handlers** (`def`, not `async def`) for Supabase CRUD — FastAPI runs them in a thread pool
- **RLS-scoped client via context** — services call `get_db()` from `app.core.context` (no argument needed)
- **Admin client** (`get_admin_db_client()`) only for bypass operations (user creation, stock decrement, notifications)
- **Streaming responses** (`StreamingResponse`) only for AI chat (`/ai/chat`)
- **Route declaration order matters** — static paths (`/stats`, `/templates`) must come before `/{id}`

### Supabase Clients

| Client                                   | When to Use                                                  |
| ---------------------------------------- | ------------------------------------------------------------ |
| `get_db()` (from `app.core.context`)     | In services — RLS-scoped client set by middleware per request |
| `get_admin_db_client()` (from supabase)  | Bypass RLS: user creation, notifications, privileged ops     |

---

## AI System

### Architecture

```
POST /ai/chat
  ↓ auth_middleware — JWT validated, context vars set
  ↓ Rate limit check (ai_usage table)
  ↓ graph.astream() — invoke LangGraph
      ├── agent node — bind role-scoped tools, call LLM
      ├── retrieve node — embed query, cosine search, build context
      ├── tools node — execute tool calls (each calls service via get_db())
      └── loop until END
  ↓ StreamingResponse — yield chunks back to client
```

### Knowledge Base

- Source: `backend/knowledge-base.md`
- Embed: Use `python -m scripts.ingest_kb`
- Search: Cosine similarity in `document_chunks` table
- Filter: By role (`document_chunks.roles text[]`)

### Rate Limiting

- Table: `ai_usage(user_id, date, call_count)`
- Limit: `AI_DAILY_LIMIT` (default: 20 calls/day)
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Troubleshooting

### Import Errors

Ensure you're in the virtual environment:

```bash
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate      # Windows
```

### Database Connection Failed

- Check `SUPABASE_URL`, `SUPABASE_SECRET_KEY` in `.env`
- Ensure Supabase project is active and running

### AI Features Not Working

- Check `OPENAI_API_KEY` is set and valid
- Ensure `OPENAI_EMBEDDING_MODEL` is configured
- Run `python -m scripts.ingest_kb` to seed knowledge base

### Chat Streaming Issues

- Ensure frontend connects to `NEXT_PUBLIC_BACKEND_URL` (default: `http://localhost:8000`)
- Check CORS is enabled (see `main.py`)

---

## Deployment

### Production Checklist

- [ ] Set `DEBUG = false` in settings
- [ ] Update `.env` with production Supabase + OpenAI keys
- [ ] Ensure `FRONTEND_URL` matches production origin
- [ ] Use uvicorn with multiple workers
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure database backups

### Example Production Command

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Supabase Python SDK](https://github.com/supabase/supabase-py)
- [LangChain & LangGraph](https://github.com/langchain-ai/langchain)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)

---

## Questions or Issues?

Refer to `CLAUDE.md` in the project root for the full architecture reference.
