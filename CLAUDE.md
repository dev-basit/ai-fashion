# Glow By Miral — Claude Code Reference

Premium parlor/salon/spa management app. Multi-role (admin / staff / customer) with full CRUD, chat, bookings, products, and reports.

**Architecture**: Next.js 16 frontend (pure UI) + FastAPI Python backend (all business logic). The frontend calls the FastAPI backend via axios (`http.ts`). There are no Next.js API route handlers except `auth/callback`.

---

## Commands

See **`backend/README.md`** for complete server, database, and script documentation.

### Frontend (Next.js)

```bash
cd frontend
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint

# Type-check (no emit)
npx tsc --noEmit

# Format all source files
npx prettier --write "src/**/*.{ts,tsx,css,json}" "*.{ts,tsx,mjs,json}"

# npm install (always use these flags — root-owned cache + legacy peer deps)
npm install --legacy-peer-deps --cache /tmp/npm-cache-glow
```

### Backend (FastAPI)

Run from `backend/` directory. See `backend/README.md` for full details:

```bash
cd backend

# Start development server
uvicorn main:app --reload --port 8000

# Seed database
python -m scripts.seed

# Ingest knowledge base
python -m scripts.ingest_kb
```

### Database Migrations

Run from `backend/` directory (migrations are in `backend/supabase/`):

```bash
cd backend
supabase db push          # Apply new migrations WITHOUT resetting data (preferred)
supabase db reset         # DESTRUCTIVE — wipes all data, always ask user first
```

---

## Tech Stack

### Frontend

| Layer         | Library                                       | Notes                                                                   |
| ------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js 16.2.11                               | Pure UI — no API routes except `auth/callback`                          |
| Runtime       | React 19.2.4                                  |                                                                         |
| Language      | TypeScript ^5 (strict)                        |                                                                         |
| Database      | Supabase (PostgreSQL + RLS + Realtime)        | `@supabase/supabase-js ^2` — browser client for auth/realtime only      |
| Styling       | Tailwind CSS ^4                               |                                                                         |
| UI components | shadcn **base-nova** style (`@base-ui/react`) | ^1.7 — NOT standard shadcn/Radix                                        |
| Server State  | TanStack Query `@tanstack/react-query` ^5     | hooks in `src/hooks/` — all data fetching goes through hooks            |
| Client State  | Zustand ^5                                    | persisted stores (`auth`, `cart`, `ui`, `chat`, `appointments`)         |
| Forms         | react-hook-form ^7 + zod ^4                   | `z` from `zod/v4`                                                       |
| Charts        | Recharts ^3                                   |                                                                         |
| Calendar      | FullCalendar **v6** (`^6.1.21`)               | Must stay on v6 — v7 breaks all plugins                                 |
| Date picker   | react-day-picker via `calendar.tsx`           | wrapped in `date-picker.tsx`                                            |
| Theme         | next-themes ^0.4                              | attribute="class", default="light"                                      |
| Icons         | lucide-react ^1.31                            |                                                                         |
| HTTP          | axios ^1                                      | `src/services/http.ts` — `baseURL: NEXT_PUBLIC_BACKEND_URL`, Bearer JWT |

### Backend

| Layer     | Library                      | Notes                                                       |
| --------- | ---------------------------- | ----------------------------------------------------------- |
| Framework | FastAPI + uvicorn            | Port 8000                                                   |
| Language  | Python 3.14                  |                                                             |
| Database  | supabase-py ^2               | `get_admin_client()` (singleton) + `get_user_client(token)` |
| AI / LLM  | langchain-openai + langgraph | RAG + streaming agent with tool use                         |
| Config    | pydantic-settings            | `app/config/settings.py` — reads from `backend/.env`        |

---

## Project Structure

```
frontend/src/
  app/
    (auth)/              # Login, forgot-password (unauthenticated layout)
    api/
      auth/callback/     # ONLY remaining Next.js route — Supabase auth code exchange
    dashboard/           # Authenticated dashboard pages (all client components using useAuth hook)
    globals.css
    layout.tsx           # Root layout — wraps with <Providers>
    page.tsx             # Landing page
  components/
    ai/                  # AssistantChat — streaming chat UI with rate-limit display
    appointments/        # AppointmentForm, AppointmentList, AppointmentCalendar, AppointmentDetail, AppointmentFilters
    chat/                # ChatView, NewConversationDialog
    clients/             # ClientForm, ClientsView, ClientProfileView
    common/              # ConfirmDialog, EmptyState, LoadingSpinner, Logo, PageHeader, RoleGuard, StatusBadge, ThemePickerModal, ThemeToggle
    consultation/        # ConsultationForm, ConsultationView, ConsultationTemplateBuilder, ConsultationRecordView
    dashboard/           # AdminDashboard, StaffDashboard, CustomerDashboard, Header, Sidebar, StatsCard, DateRangeFilter
    landing/             # LandingPage, useInView
    products/            # ProductsView, ProductForm, ProductDetailView, ProductInventory, CartSheet, Checkout, OrderList
    profile/             # ProfileView
    reports/             # ReportsView
    services/            # ServicesView, ServiceForm, ServiceVariantManager
    settings/            # SettingsView
    staff/               # StaffView, StaffForm, StaffProfileView, StaffScheduleGrid, StaffLeaveCalendar, StaffServiceAssignment
    treatment-plans/     # TreatmentPlansView, TreatmentPlanTemplateBuilder, TreatmentPlanAssign, TreatmentPlanProgress
    ui/                  # shadcn primitives — button, card, dialog, dropdown-menu, input, select, tabs,
                         #   date-picker (DatePicker + DateTimePicker), calendar, popover, etc.
  config/
    constants.ts         # APP_NAME, ROUTES, ROLES, API_ROUTES, status labels/colors
    config.ts            # Typed env access — always import from here, never process.env directly
    ai.ts                # SUGGESTED_QUESTIONS for the AI assistant UI
    query.ts             # TanStack Query: queryClient defaults + QK key factory
  hooks/                 # TanStack Query hooks — one file per domain
  lib/
    utils.ts             # cn(), responseData(), responseError(), relativeTime() — (auth.ts deleted: use useAuth hook instead)
  providers/
    index.tsx            # <QueryProvider> → <ThemeProvider> → <ThemePickerModal> → <AuthProvider>
    QueryProvider.tsx
    AuthProvider.tsx     # Calls useAuthStore.initialize() on mount
    ThemeProvider.tsx
  proxy.ts               # Auth/role guard — Next.js 16 Middleware (proxy.ts not middleware.ts)
  services/
    supabase.ts          # getBrowserClient() — singleton browser Supabase client (realtime + auth)
    supabase-server.ts   # getServerClient() — cookie-based server client (server components only)
    http.ts              # Axios (baseURL: NEXT_PUBLIC_BACKEND_URL) — Bearer token injected per request
    *.service.ts         # Thin HTTP clients — call FastAPI via http.ts, return { data, error }
    ai-conversations.service.ts  # Exception: uses http.ts for AI conversation history
  store/
    auth.store.ts, cart.store.ts, appointments.store.ts, chat.store.ts, ui.store.ts
  types/
    database.ts          # Hand-written domain types
    supabase.ts          # Auto-generated — DO NOT EDIT
    auth.ts, index.ts
  utils/
    csv.ts, date.ts, format.ts, role.ts

backend/
  main.py                # FastAPI app, CORS, router registration
  requirements.txt
  knowledge-base.md      # AI knowledge base source — edit here, then run python -m scripts.ingest_kb
  .env                   # Backend secrets (gitignored)
  .env.example           # Template for .env
  scripts/
    seed.py              # Database seeding — python -m scripts.seed
    ingest_kb.py         # Knowledge base ingestion — python -m scripts.ingest_kb
  supabase/
    migrations/          # Database migrations (run: supabase db push from project root)
    config.toml          # Supabase local development config
  app/
    config/
      settings.py        # Pydantic Settings — all env vars
      enums.py
    core/
      supabase.py        # get_admin_client() (lru_cache singleton) + get_user_client(token)
      auth.py            # AuthContext, get_auth, get_admin_auth (FastAPI Depends)
      notify.py          # notify_user_and_admins(), notify_admins()
    routes/              # Thin controllers — parse params, call service, return {"data": ...}
      health.py, me.py, profiles.py, appointments.py, clients.py
      products.py, salon_services.py, staff.py, orders.py, chat.py
      consultation.py, treatment_plans.py, notifications.py, settings.py, reports.py, ai.py
    services/            # Business logic + Supabase queries
      appointments.py, clients.py, products.py, salon_services.py, staff.py
      orders.py, chat.py, consultation.py, treatment_plans.py
      notifications.py, settings.py, reports.py, profiles.py, ai_service.py
    ai/
      state.py           # TypedDict AgentState (messages, user_role, context)
      models.py          # ChatOpenAI + OpenAIEmbeddings instances
      rag.py             # retrieve node (cosine similarity search)
      agent.py           # agent node + route_agent
      graph.py           # Compiled StateGraph: agent → retrieve/tools → agent → END
      tools/             # Role-scoped tools (appointments, clients, orders, etc.)
        utils.py         # get_supabase(config), get_user_id(config) — shared helpers
    schemas/             # Pydantic request/response models
    utils/
      product_svgs.py    # PRODUCT_SVGS dictionary — 15 product icons as SVG strings
      seed_data.py       # Seed data: SERVICE_CATEGORIES, SERVICES, PRODUCTS, CONSULTATION_TEMPLATES, TREATMENT_PLAN_TEMPLATES, BUSINESS_SETTINGS()

```

---

## Critical Rules

### Architecture: Frontend is Pure UI

- **No business logic in the frontend.** All Supabase queries, notifications, user creation, AI, RAG, etc. live in the FastAPI backend.
- **No Next.js API routes** — `src/app/api/auth/callback/` is the only exception (Supabase SSR code exchange).
- **`src/ai/` is deleted** — the AI system is in `backend/app/ai/`.
- The frontend `http.ts` axios instance points to `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8000`).
- Components **never import `http` directly** — all data fetching goes through TanStack Query hooks in `src/hooks/`.

### Next.js 16 Breaking Changes

- **`params` is a `Promise`** — In client components, use `useParams()` (returns a synchronous object). In server components (rarely used now), always `await params`.
- **`cookies()` and `headers()` are async** — `const cookieStore = await cookies();` (server components only)
- **Middleware file is `proxy.ts`** (not `middleware.ts`) — export named `proxy` function + `config` matcher.
- **`useSearchParams` requires `<Suspense>` boundary** (client components only).

### Supabase Clients (Frontend)

| Client               | Import                       | Use in                                                   |
| -------------------- | ---------------------------- | -------------------------------------------------------- |
| `getBrowserClient()` | `@/services/supabase`        | Client components only — Realtime, `http.ts` auth header |
| `getServerClient()`  | `@/services/supabase-server` | Auth callback route handler only (`app/api/auth/callback`) |

**Never import Supabase directly into dashboard pages or regular components.** Use `useAuth()` hook from `@/hooks/useAuth` for auth state, and TanStack Query hooks for data fetching.

### Supabase Clients (Backend)

| Client                     | When to use                                                                 |
| -------------------------- | --------------------------------------------------------------------------- |
| `auth.supabase` (injected) | Route handlers receive this from `get_auth` — RLS-scoped to the JWT user    |
| `get_admin_client()`       | Bypass RLS: user creation, notifications, stock decrement, privileged reads |
| `get_user_client(token)`   | AI tools — builds per-request JWT-scoped client from `config.configurable`  |

### Backend Route Pattern

```python
@router.get("")
def list_things(auth: AuthContext = Depends(get_auth)):
    data = things_svc.list_things(auth.supabase)
    return {"data": data}

@router.post("")
def create_thing(body: dict, auth: AuthContext = Depends(get_auth)):
    data = things_svc.create_thing(auth.supabase, auth.user.id, body)
    return {"data": data}
```

- Always return `{"data": ...}` on success; raise `HTTPException` for errors.
- Use `def` (sync) for Supabase CRUD — FastAPI runs sync handlers in thread pool.
- Use `async def` + `StreamingResponse` only for the AI chat endpoint.
- `from` is a Python keyword → use `from_` with `Query(None, alias="from")`.
- **Route declaration order matters**: static paths (`/stats`, `/low-stock`, `/templates`, `/categories`) must be declared BEFORE `/{id}`.

### Database Migrations

- **Never run `supabase db reset` without explicit user approval** — it wipes all data.
- To apply a new migration without data loss: `supabase db push`.
- Migration files live in `supabase/migrations/`. Name them `NNNN_description.sql`.
- `0001_initial_schema.sql` is the canonical schema — do not modify it.

### Base UI / shadcn "base-nova" — Not Standard shadcn

This project uses **base-nova** built on `@base-ui/react`, not Radix UI:

- **No `asChild` prop**. Use `buttonVariants()` on a `<Link>` for link-buttons.
- **No Radix imports** (`@radix-ui/*`). All primitives from `@base-ui/react/*`.
- **`DropdownMenuLabel` must be inside `DropdownMenuGroup`**.
- **`Select` `onValueChange` gives `unknown`** — cast: `(v: unknown) => setState(String(v ?? ''))`.
- **`Select` must receive an `items` prop** to show labels in the trigger.
- **`Dialog` open/close** via `open` + `onOpenChange` props.

### Date Pickers — Never Use Native `<input type="date">`

```tsx
import { DatePicker, DateTimePicker } from '@/components/ui/date-picker';
<DatePicker value={dateStr} onChange={(v) => setValue("field", v)} />
<DateTimePicker value={dateTimeStr} onChange={(v) => setValue("field", v)} />
```

Use `watch()` + `setValue()` with react-hook-form — not `register()`.

### TypeScript

- `z` from `zod/v4` (not `zod`).
- All imports use `@/` alias (maps to `src/`).

### Theme System

- Black-and-white only. Never add pink, rose, or color tokens.
- Use Tailwind semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`) — never hardcode hex/rgb.

---

## Auth & Role Access

Three roles: `admin`, `staff`, `customer`.

**Route-level protection** (`src/proxy.ts`):

- `ADMIN_ONLY_ROUTES`: `/dashboard/settings`, `/dashboard/staff`, `/dashboard/reports`
- `STAFF_RESTRICTED_ROUTES`: `/dashboard/clients`, `/dashboard/services`

**Component-level**: `<RoleGuard roles={['admin', 'staff']}>`, `useRole()`.

---

## Form Pattern

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';

const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
// Base UI Select:
<Select items={{ a: "Option A" }} onValueChange={(v: unknown) => setValue('field', String(v ?? ''))}>
// DatePicker:
<DatePicker value={watch("date_field") ?? ""} onChange={(v) => setValue("date_field", v)} />
```

---

## Dashboard Date Filter

```tsx
import {
  DateRangeFilter,
  computeDateRange,
  PRESET_RANGE_LABEL,
} from "@/components/dashboard/DateRangeFilter";
import type { DatePreset } from "@/components/dashboard/DateRangeFilter";
```

- Presets: Today, Last 7 Days, Last Month, Custom Range
- `computeDateRange(preset, from?, to?)` → `{ from: string, to: string }` (ISO)
- `reportsService.getDashboardStats(range: DateRange)` requires a `DateRange` arg

---

## Data Fetching — TanStack Query

**Components must never import services, `http`, or Supabase directly.** All data fetching goes through hooks in `src/hooks/`.

### Request chain (data fetching)

```
Component
  → TanStack Query hook (useQuery / useMutation)
      → service function (src/services/*.service.ts)
          → http.ts (axios, baseURL: NEXT_PUBLIC_BACKEND_URL, Bearer JWT injected)
              → FastAPI route handler (backend/app/routes/...)
                  → get_auth / get_admin_auth (resolves user, builds RLS-scoped supabase client)
                      → service layer (backend/app/services/...)
                          → supabase query (RLS enforced)
                              ─ OR ─
                          → get_admin_client() for privileged ops
```

### Auth state (not server-side)

**All dashboard pages are now `"use client"` components.**

```tsx
"use client";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function MyPage() {
  const { user, profile, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  
  return <MyComponent userId={user!.id} role={profile?.role ?? "customer"} />;
}
```

The `useAuth()` hook reads from Zustand `useAuthStore`, which is initialized by `AuthProvider` on app mount with user/profile from Supabase session.

### Hook pattern

```ts
// src/hooks/useClients.ts
export function useClients(search?: string) {
  return useQuery({
    queryKey: QK.clients(search),
    queryFn: async () => {
      const { data, error } = await clientsService.getAll(search);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data, error } = await clientsService.create(payload);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.clients() }),
  });
}
```

### Query key factory (`QK`) — `src/config/query.ts`

```ts
QK.appointments(filters?)  QK.appointment(id)
QK.clients(search?)        QK.client(id)     QK.clientCounts()
QK.staff(filters?)         QK.staffById(id)
QK.services(catId?)        QK.service(id)    QK.serviceCategories()
QK.products(filters?)      QK.product(id)    QK.productCategories()
QK.orders(filters?)
QK.consultation.templates()  QK.consultation.records(filters?)  QK.consultation.record(id)
QK.treatmentPlans.templates()  QK.treatmentPlans.client(filters?)
QK.reports(type, from, to)
QK.settings(key?)
QK.profiles()  QK.profile(id)
QK.chatConversations()  QK.chatMessages(convId)  QK.chatRecipients()
QK.aiConversations()  QK.aiMessages(convId)
```

### QueryClient defaults

```ts
staleTime: 2 min  |  gcTime: 10 min  |  retry: 1  |  refetchOnWindowFocus: false
```

### Hook files

| File                   | Key exports                                                                                                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAppointments.ts`   | `useAppointments`, `useAppointment`, `useCreateAppointment`, `useUpdateAppointmentStatus`, `useUpdatePaymentStatus`, `useDeleteAppointment`, `useAppointmentProducts`, `useAddAppointmentProduct`, `useRemoveAppointmentProduct`                              |
| `useClients.ts`        | `useClients`, `useClient`, `useClientHistory`, `useClientAppointmentCounts`, `useCreateClient`, `useUpdateClient`, `useDeactivateClient`                                                                                                                      |
| `useStaff.ts`          | `useStaff`, `useStaffMember`, `useStaffByProfile`, `useStaffSchedule`, `useStaffLeaves`, `useCreateStaff`, `useUpdateStaff`, `useUpsertSchedule`, `useCreateLeave`, `useAssignService`, `useRemoveService`, `useSetAvailability`, `useDeactivateStaffProfile` |
| `useServices.ts`       | `useServices`, `useService`, `useServiceCategories`, `useServiceVariants`, `useCreateService`, `useUpdateService`, `useDeleteService`, `useCreateServiceCategory`, `useCreateServiceVariant`, `useDeleteServiceVariant`                                       |
| `useProducts.ts`       | `useProducts`, `useProduct`, `useProductCategories`, `useLowStockProducts`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useUpdateProductStock`                                                                                               |
| `useOrders.ts`         | `useOrders`, `useCreateOrder`, `useUpdateOrderStatus`                                                                                                                                                                                                         |
| `useConsultation.ts`   | `useConsultationTemplates`, `useConsultationRecords`, `useConsultationRecord`, `useCreateConsultationRecord`, `useUpdateConsultationRecord`, `useCreateConsultationTemplate`, `useUpdateConsultationTemplate`                                                 |
| `useTreatmentPlans.ts` | `useTreatmentPlanTemplates`, `useClientTreatmentPlans`, `useClientTreatmentPlan`, `useCreateTreatmentPlanTemplate`, `useUpdateTreatmentPlanTemplate`, `useCreateClientTreatmentPlan`, `useUpdateClientTreatmentPlan`                                          |
| `useReports.ts`        | `useRevenueReport`, `useAppointmentReport`, `useClientReport`, `useStaffReport`, `useOrderReport`, `useProductSalesReport`, `useDashboardStats`                                                                                                               |
| `useSettings.ts`       | `useSetting(key)`, `useUpdateSetting`                                                                                                                                                                                                                         |
| `useProfiles.ts`       | `useAllProfiles`, `useProfile`, `useUpdateProfile`                                                                                                                                                                                                            |
| `useChat.ts`           | `useConversations`, `useCreateConversation`, `useMessages`, `useChatRecipients`                                                                                                                                                                               |
| `useNotifications.ts`  | `useNotifications`, `useUnreadCount`, `useMarkNotificationRead`, `useMarkAllRead`                                                                                                                                                                             |
| `useAI.ts`             | `useAIConversations`, `useAIMessages`, `useCreateAIConversation`, `useDeleteAIConversation`                                                                                                                                                                   |

**Rule**: No component imports services directly. All data fetching goes through hooks in `src/hooks/`. The streaming AI chat (`fetch()` to `/ai/chat`) is the only intentional direct API call, kept in `AssistantChat.tsx` because it uses Server-Sent Events (not cacheable by TanStack Query).

### `useStaffByProfile` returns an array

```ts
const { data: staffData } = useStaffByProfile(userId);
const staffProfile = staffData?.[0] ?? null;
```

### `DateRange` type

Import from `@/services/reports.service` — `{ from: string; to: string }`.

---

## Zustand Stores (Client State Only)

| Store                  | Key state                                                            |
| ---------------------- | -------------------------------------------------------------------- |
| `useAuthStore`         | `user`, `session`, `profile`, `isLoading` — persisted (profile only) |
| `useCartStore`         | `items`, cart open/close, total — persisted                          |
| `useAppointmentsStore` | filters, view mode                                                   |
| `useChatStore`         | `activeConversationId`                                               |
| `useUIStore`           | sidebar open state                                                   |

---

## Environment Variables

### Frontend (`frontend/.env.local`)

Public env only (prefixed with `NEXT_PUBLIC_`):

```
NEXT_PUBLIC_SUPABASE_URL                # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY    # Supabase publishable/anon key
NEXT_PUBLIC_BACKEND_URL                 # Backend API URL (default: http://localhost:8000)
```

All frontend env accessed via `src/config/config.ts`. **Never access `process.env` directly** in the frontend.

### Backend (`backend/.env`)

**Supabase:**

```
SUPABASE_URL                 # Supabase project URL
SUPABASE_PUBLISHABLE_KEY     # Supabase publishable/anon key
SUPABASE_SECRET_KEY          # Service-role key (never expose to client)
```

**OpenAI (AI features only):**

```
OPENAI_API_KEY               # Required for AI chat, embeddings, RAG
OPENAI_CHAT_MODEL            # LLM model (default: gpt-4o-mini)
OPENAI_EMBEDDING_MODEL       # Embedding model (default: text-embedding-3-small)
AI_DAILY_LIMIT               # Daily AI calls per user (default: 20)
```

**Frontend Integration:**

```
FRONTEND_URL                 # Frontend origin (default: http://localhost:3000)
```

**⚠️ Important:** OpenAI keys are **backend-only**. Never expose them to the frontend.

---

## Prettier / Formatting (Frontend)

```json
{ "singleQuote": false, "tabWidth": 2, "printWidth": 110, "trailingComma": "all" }
```

---

## Files — Do Not Modify

| File                                          | Reason                                                        |
| --------------------------------------------- | ------------------------------------------------------------- |
| `frontend/src/types/supabase.ts`              | Auto-generated — regenerate with `supabase gen types`         |
| `supabase/migrations/0001_initial_schema.sql` | Canonical DB schema — add new migrations instead              |
| `frontend/public/favicon.svg`                 | SVG favicon with light/dark media query                       |
| `frontend/components.json`                    | shadcn config — only change when adding new shadcn components |

---

## FullCalendar

All FullCalendar packages must stay on **v6** (`^6.1.21`). v7 uses a completely different internal structure and breaks all v6 plugins.

---

## In-App Notifications

Notifications live in the `notifications` table, pushed live via Supabase Realtime.

**Backend helper** (`backend/app/core/notify.py`):

```python
from app.core.notify import notify_user_and_admins, notify_admins

notify_user_and_admins(recipient_id, {"type": "appointment", "title": "...", "body": "...", "data": {}}, exclude_id)
notify_admins({"type": "order", "title": "...", "body": "..."})
```

**Notification types**: `"appointment" | "message" | "order" | "system" | "reminder"`

**Where notifications are created** (all in FastAPI route handlers):

| Event                       | Route                        | Recipients                         |
| --------------------------- | ---------------------------- | ---------------------------------- |
| Appointment created         | `POST /appointments`         | Assigned staff + all admins        |
| Order placed                | `POST /orders`               | Client + all admins                |
| Order delivered             | `PATCH /orders/{id}`         | Client + all admins                |
| Consultation record created | `POST /consultation/records` | Client (if staff created) + admins |
| Treatment plan assigned     | `POST /treatment-plans`      | Client + all admins                |

---

## User Management (No Register Page)

Clients and staff are created by admin only — no self-registration:

- **Clients**: `POST /clients` on FastAPI — `get_admin_client().auth.admin.create_user()`
- **Staff**: `POST /staff` — same pattern + `staff_profiles` row

`ClientForm` and `StaffForm` handle both create (email/password fields) and edit modes.

---

## Chat

- Conversations created via `POST /chat/conversations` using `get_admin_client()` — bypasses RLS to allow customers to start conversations.
- **RLS recursion fix** (migration 0005): `is_conversation_member()` is `SECURITY DEFINER` — avoids `42P17` infinite recursion.
- `useConversations()` exposes `refetch()` (calls `invalidateQueries`) — call after creating a new conversation.
- `useCreateConversation()` in `useChat.ts` wraps `chatService.getOrCreateDirectConversation`.

---

## Products / Orders

- **Stock decrement** happens server-side in `POST /orders` via `get_admin_client()`.
- **Staff**: browse-only. Cannot add to cart or place orders.
- `Checkout.tsx` uses `useCreateOrder()` hook — not a direct service call.

---

## AI Assistant

The `/dashboard/ai-assistant` page provides a role-aware RAG + tool-calling chatbot.

**Architecture** (all in FastAPI backend — OpenAI key never reaches the browser):

```
POST /ai/chat
  → get_auth (session check)
  → rate limit check (ai_usage table, AI_DAILY_LIMIT per day)
  → graph.astream({ messages, user_role, context: "" }, config={access_token, user_id, timezone})
      agent node: bind role-scoped tools → invoke LLM
      retrieve node: embed query → cosine search → build context string
      tools node: ToolNode executes tool calls (each tool builds JWT-scoped supabase client)
  → StreamingResponse back to client (text/plain chunks)
```

**Knowledge base workflow**:

1. Edit `backend/knowledge-base.md`
2. Run `npm run ingest-kb` from `frontend/` — parses sections, embeds with OpenAI, upserts into `document_chunks`

**Rate limiting**: `ai_usage(user_id, date, call_count)`. Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`. `AssistantChat` disables input when exhausted.

**Role scoping**: `document_chunks.roles text[]` — the `retrieve` node filters chunks by user role. The agent system prompt also instructs the LLM not to reveal admin-only data.

**AI tool pattern** (`backend/app/ai/tools/`):

```python
from app.ai.tools.utils import get_supabase, get_user_id

@tool
def get_my_appointments(
    status: Annotated[Optional[str], "Filter by status"] = None,
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """List the current user's own appointments."""
    data = appointments_svc.list_appointments(get_supabase(config), status=status)
    return json.dumps(data, indent=2) if data else "No appointments."
```

`InjectedToolArg` hides `config` from the LLM schema. Tools call service functions directly — no HTTP round-trip.

**Key files**:

| File                                           | Purpose                                       |
| ---------------------------------------------- | --------------------------------------------- |
| `backend/knowledge-base.md`                    | Source document — edit here, then re-ingest   |
| `backend/app/ai/graph.py`                      | Compiled LangGraph                            |
| `backend/app/ai/rag.py`                        | `retrieve` node — cosine similarity search    |
| `backend/app/ai/agent.py`                      | `agent` node + `route_agent` conditional edge |
| `backend/app/ai/tools/`                        | Role-scoped tool implementations              |
| `backend/app/routes/ai.py`                     | Streaming POST handler + conversations CRUD   |
| `frontend/src/components/ai/AssistantChat.tsx` | Chat UI — streaming, rate-limit display       |

---

## Common Gotchas

- **All dashboard pages are `"use client"` components**: Use `useAuth()` hook to access `user` and `profile`. Do NOT use server-side `getCurrentUserDetails()` (deleted). Pages should always show `<LoadingSpinner />` while `isLoading` is true.
- **No useEffect + service calls**: All service calls moved to TanStack Query hooks. No pattern like `useEffect(() => { const load = async () => { await service.fetch() }` allowed. If data is needed, create a hook (e.g., `useAIConversations`).
- **No direct `http` imports in components**: All data fetching through `src/hooks/` (TanStack Query). Streaming SSE (`fetch()` to `/ai/chat`) is intentional exception in `AssistantChat.tsx`.
- **No direct Supabase queries in components**: `useAuth()` is for auth state (reads from Zustand store). Use TanStack Query hooks (like `useProduct()`, `useClient()`, `useStaffMember()`, `useAIConversations()`) for entity data fetching via backend API.
- **Services are thin HTTP clients**: `*.service.ts` call FastAPI via `http.ts`. They do not touch Supabase.
- **Backend uses sync `def` for Supabase routes**: FastAPI runs sync handlers in a thread pool — no blocking.
- **`get_admin_client()` only for bypass**: use in backend services only when explicitly skipping RLS.
- **Cache invalidation is automatic**: `onSuccess` → `qc.invalidateQueries(...)` triggers refetch. Components don't call `refetch()` manually.
- **npm install**: always `npm install --legacy-peer-deps --cache /tmp/npm-cache-glow`.
- **Supabase Realtime** for chat (`src/hooks/useRealtime.ts`). No custom WebSocket server.
- **`useSearchParams`** must be inside `<Suspense>` boundary (client components).
- **`useParams()` in client components** returns a synchronous object (unlike server components where params is a Promise).
- **Logo**: use `LogoSidebar`, `LogoIcon`, `LogoAuth` from `src/components/common/Logo.tsx`.
- **`supabase db reset` is destructive** — always ask before running.
- **Staff names visible to customers** — `profiles_select_authenticated` RLS policy (migration 0003).
- **Consultation records — customer insert** — migration 0006.
- **`get_low_stock_products`**: Supabase PostgREST cannot compare two columns with `.filter()` using a string value — filter is done in Python after fetching.
- **AI knowledge base re-ingestion**: editing `backend/knowledge-base.md` has no effect until `npm run ingest-kb` re-embeds all chunks.
- **Backend `salon_services`**: The Python module for services is named `salon_services` (not `services`) to avoid shadowing Python's `services` namespace.
- **`useCreateConversation` hook**: in `useChat.ts` — wraps `chatService.getOrCreateDirectConversation`. Use this in components, never call `chatService` directly.
