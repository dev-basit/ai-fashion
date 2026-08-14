# Glow By Miral — Claude Code Reference

Premium parlor/salon/spa management app. Multi-role (admin / staff / customer) with full CRUD, chat, bookings, products, and reports.

---

## Commands

```bash
npm run dev          # Start dev server (Next.js 16, port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run seed         # Seed DB — tsx --env-file=.env src/scripts/seed.ts
npm run ingest-kb    # Embed knowledge-base.md and upsert into Supabase (requires OPENAI_API_KEY)

# Type-check (no emit)
npx tsc --noEmit

# Format all source files
npx prettier --write "src/**/*.{ts,tsx,css,json}" "*.{ts,tsx,mjs,json}"

# npm install (always use these flags — root-owned cache + legacy peer deps)
npm install --legacy-peer-deps --cache /tmp/npm-cache-glow

# Apply new migrations WITHOUT resetting data (ask user before resetting)
supabase db push
# Full reset + reseed (DESTRUCTIVE — always ask user first)
supabase db reset && npm run seed
```

---

## Tech Stack

| Layer         | Library                                               | Version                                                                 |
| ------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js                                               | 16.2.11                                                                 |
| Runtime       | React                                                 | 19.2.4                                                                  |
| Language      | TypeScript                                            | ^5 (strict)                                                             |
| Database      | Supabase (PostgreSQL + RLS + Realtime)                | @supabase/supabase-js ^2                                                |
| Styling       | Tailwind CSS                                          | ^4                                                                      |
| UI components | shadcn **base-nova** style (Base UI `@base-ui/react`) | ^1.7                                                                    |
| State         | Zustand ^5                                            | persisted stores                                                        |
| Forms         | react-hook-form ^7 + zod ^4                           | `z` from `zod/v4`                                                       |
| Charts        | Recharts ^3                                           |                                                                         |
| Calendar      | FullCalendar **v6**                                   | `@fullcalendar/{react,core,daygrid,timegrid,interaction}` all `^6.1.21` |
| Date picker   | react-day-picker (via `calendar.tsx`)                 | wrapped in `date-picker.tsx`                                            |
| Theme         | next-themes ^0.4                                      | attribute="class", default="light"                                      |
| Icons         | lucide-react ^1.31                                    |                                                                         |
| HTTP          | axios ^1                                              | via `src/services/http.ts`                                              |
| AI / LLM      | `@langchain/openai` ^1 + `@langchain/langgraph` ^1   | RAG pipeline + streaming agent                                          |

---

## Project Structure

```
src/
  app/
    (auth)/              # Login, forgot-password (unauthenticated layout — register removed, admin creates users)
    api/                 # Route handlers — REST API for each domain
    dashboard/           # Authenticated dashboard pages (server components by default)
    globals.css          # Tailwind + CSS custom properties (light/dark tokens)
    layout.tsx           # Root layout — wraps with <Providers>
    page.tsx             # Landing page
  ai/
    knowledge-base.md    # Source-of-truth document — edit here, then run npm run ingest-kb
    models.ts            # LangChain LLM (ChatOpenAI) + embeddings (OpenAIEmbeddings) instances
    state.ts             # LangGraph AgentAnnotation — messages, userRole, context
    rag.ts               # retrieve + generate nodes (RAG pipeline)
    graph.ts             # Compiled StateGraph: retrieve → generate → END
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
    services/            # ServicesView, ServiceForm, ServiceVariantManager (ServiceTagManager removed — tags feature dropped)
    settings/            # SettingsView
    staff/               # StaffView, StaffForm, StaffProfileView, StaffScheduleGrid, StaffLeaveCalendar, StaffServiceAssignment
    treatment-plans/     # TreatmentPlansView, TreatmentPlanTemplateBuilder, TreatmentPlanAssign, TreatmentPlanProgress
    ui/                  # shadcn primitives — button, card, dialog, dropdown-menu, input, select, tabs,
                         #   date-picker (DatePicker + DateTimePicker), calendar, popover, etc.
  config/
    constants.ts         # APP_NAME, ROUTES, ROLES, status labels/colors
    env.ts               # Typed env access — always import from here, never process.env directly
    ai.ts                # SUGGESTED_QUESTIONS for the AI assistant UI
  hooks/                 # useRole, useAuth, useAppointments, useClients, useChat, etc.
  lib/
    utils.ts             # cn() — clsx + tailwind-merge
    notify.ts            # notifyUserAndAdmins() / notifyAdmins() — server-only notification helpers (use getAdminClient)
  providers/
    index.tsx            # <ThemeProvider> → <ThemePickerModal> → <AuthProvider>
    AuthProvider.tsx     # Calls useAuthStore.initialize() on mount
    ThemeProvider.tsx    # next-themes wrapper (attribute="class", defaultTheme="light")
  proxy.ts               # Auth/role guard — used as Next.js middleware (see below)
  scripts/
    seed.ts              # DB seed script
  services/
    supabase.ts          # getBrowserClient() — client components only
    supabase-server.ts   # getServerClient() / getAdminClient() — server only
    supabase-admin.ts    # getAdminClient() (service-role, bypasses RLS) — server only
    *.service.ts         # Domain services (all use getBrowserClient)
    ai.service.ts        # matchDocuments() — cosine similarity search against document_chunks via getAdminClient
  store/
    auth.store.ts        # Zustand auth store (persisted: profile only)
    cart.store.ts        # Zustand cart (persisted)
    appointments.store.ts, chat.store.ts, ui.store.ts
  types/
    database.ts          # Hand-written domain types (Profile, Appointment, Service, etc.)
    supabase.ts          # Auto-generated Supabase types — DO NOT EDIT
    auth.ts, index.ts
  utils/
    csv.ts, date.ts, format.ts, role.ts
supabase/
  migrations/
    0001_initial_schema.sql   # Full DB schema — DO NOT EDIT
    0002_grants.sql           # Explicit GRANT statements for service_role / authenticated / anon
    0003_profiles_select_authenticated.sql  # RLS: all authenticated users can read any profile
    0004_remove_service_tags.sql            # Drops service_tags + service_tag_relations tables
    0005_fix_chat_rls_recursion.sql         # SECURITY DEFINER is_conversation_member() — fixes 42P17 infinite recursion
    0006_consultation_records_customer_insert.sql  # RLS: customers can INSERT their own consultation records
    0007_ai_documents.sql  # Creates document_chunks table (pgvector), HNSW index, match_documents() SQL function
    0008_ai_usage.sql      # Creates ai_usage table for per-user daily rate limiting
```

---

## Critical Rules

### Next.js 16 Breaking Changes

- **`params` is a `Promise`** in page/layout components — always `await params`:
  ```ts
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  ```
- **`cookies()` and `headers()` are async** — `const cookieStore = await cookies();`
- **Middleware is now called Proxy in Next.js 16** — the conventional file is `proxy.ts` (not `middleware.ts`). This project uses `src/proxy.ts`. Export a named `proxy` function and a `config` matcher. Do not create a `middleware.ts` file.
- **`useSearchParams` requires a `<Suspense>` boundary** — wrap the component that calls it.
- Route handlers live in `src/app/api/`.

### Supabase Client Rules (Critical)

Three clients — use the right one or you'll break auth/RLS:

| Client               | Import                                                      | Use in                                                          |
| -------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| `getBrowserClient()` | `@/services/supabase`                                       | Client components (`'use client'`), all `*.service.ts` files    |
| `getServerClient()`  | `@/services/supabase-server`                                | Server components, route handlers (respects session cookies)    |
| `getAdminClient()`   | `@/services/supabase-server` or `@/services/supabase-admin` | Server-only, bypasses RLS — admin user creation, privileged ops |

**Never import `supabase-server` or `supabase-admin` into a client component.**

### Database Migrations

- **Never run `supabase db reset` without explicit user approval** — it wipes all data.
- To apply a new migration without data loss use `supabase db push`.
- Migration files live in `supabase/migrations/`. Name them `NNNN_description.sql`.
- `0001_initial_schema.sql` is the canonical schema — do not modify it.

### Base UI / shadcn "base-nova" — Not Standard shadcn

This project uses the **base-nova** style which is built on `@base-ui/react`, not Radix UI. Breaking differences:

- **No `asChild` prop** anywhere. For a link that looks like a button, use `buttonVariants()` on a `<Link>`:
  ```tsx
  import Link from "next/link";
  import { buttonVariants } from "@/components/ui/button";
  <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
    Go
  </Link>;
  ```
- **No Radix imports** (`@radix-ui/*`). All primitives come from `@base-ui/react/*`.
- **`DropdownMenuLabel` must be inside `DropdownMenuGroup`** (Base UI GroupLabel requirement).
- **`Select` `onValueChange` gives `unknown`** — cast: `(v: unknown) => setState(String(v ?? ''))`.
- **`Select` must receive an `items` prop** to show labels in the trigger instead of raw values:
  ```tsx
  <Select
    value={value}
    items={{ key1: "Label 1", key2: "Label 2" }}
    onValueChange={(v: unknown) => setValue(String(v ?? ""))}
  >
  ```
- **`Dialog` open/close** is controlled via `open` + `onOpenChange` props.

### Date Pickers — Never Use Native `<input type="date">`

Use the custom components from `@/components/ui/date-picker` for all date/datetime fields:

```tsx
import { DatePicker, DateTimePicker } from '@/components/ui/date-picker';

// Date only — value is "YYYY-MM-DD" string
<DatePicker value={dateStr} onChange={(v) => setValue("field", v)} placeholder="Pick a date" />

// Date + time — value is "YYYY-MM-DDTHH:MM" string (same format as datetime-local)
<DateTimePicker value={dateTimeStr} onChange={(v) => setValue("field", v)} />
```

Both open a popover with a `Calendar` (react-day-picker). `DateTimePicker` adds a `<input type="time">` below the calendar. Since these are controlled, use `watch()` + `setValue()` with react-hook-form — not `register()`.

### TypeScript

- Use `as any` on Supabase insert/update calls where hand-written types in `database.ts` diverge from the generated `supabase.ts` types. This is an established pattern in the codebase.
- Import `z` from `zod/v4` (not `zod`) — the project uses zod v4 API.
- All imports use `@/` alias (maps to `src/`).

### Theme System

- Black-and-white only. Never add pink, rose, or color tokens.
- `ThemeProvider` wraps the whole app with `attribute="class"` — dark mode is applied via `.dark` class on `<html>`.
- Use Tailwind semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, etc.) — never hardcode hex/rgb colors in components.
- `ThemePickerModal` shows once on first visit (`gbm-theme-chosen` localStorage key).
- Toggle: `useTheme()` from `next-themes`.

---

## Auth & Role Access

Three roles: `admin`, `staff`, `customer`.

**Route-level protection** (`src/proxy.ts` — Next.js 16 Proxy, the renamed Middleware):

- Unauthenticated → redirected to `/login` for any `/dashboard` route.
- Logged-in visiting auth pages → redirected to `/dashboard`.
- `ADMIN_ONLY_ROUTES`: `/dashboard/settings`, `/dashboard/staff`, `/dashboard/reports`
- `STAFF_RESTRICTED_ROUTES`: `/dashboard/clients`, `/dashboard/services` (blocked for customers)

**Component-level access** — use `<RoleGuard roles={['admin', 'staff']}>`:

```tsx
import { RoleGuard } from "@/components/common/RoleGuard";
<RoleGuard roles={["admin"]}>
  <DeleteButton />
</RoleGuard>;
```

**Hook access** — `useRole()` returns `{ role, isAdmin, isStaff, isStaffOrAdmin, isCustomer, can }`.

Role info in server components: the proxy sets `x-user-role` and `x-user-id` headers; the dashboard layout reads role fresh from Supabase.

**RLS note**: Migration `0003` adds `profiles_select_authenticated` so any authenticated user can read any profile row. This is required for customers to see staff names on appointments.

---

## Form Pattern

All forms use react-hook-form + zod + Base UI Select. Reference: `src/components/appointments/AppointmentForm.tsx`.

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';

const schema = z.object({ name: z.string().min(1) });
type FormData = z.infer<typeof schema>;

const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});

// For Base UI Select — use setValue(), not register():
<Select items={{ a: "Option A" }} onValueChange={(v: unknown) => setValue('field', String(v ?? ''))}>

// For DatePicker / DateTimePicker — use watch() + setValue():
<DatePicker value={watch("date_field") ?? ""} onChange={(v) => setValue("date_field", v)} />
```

---

## Dashboard Date Filter

All three dashboard components (`AdminDashboard`, `StaffDashboard`, `CustomerDashboard`) include a `DateRangeFilter` in the header that drives data fetching:

- **Presets**: Today, Last 7 Days, Last Month, Custom Range
- **Custom Range**: shows two inline `DatePicker` fields
- **`computeDateRange(preset, from?, to?)`** — exported helper that returns `{ from: string, to: string }` (ISO strings)
- **`PRESET_RANGE_LABEL`** — map from preset key to display string (e.g. `"7d"` → `"Last 7 Days"`)
- `reportsService.getDashboardStats(range: DateRange)` now requires a `DateRange` argument (no default today range)

```tsx
import {
  DateRangeFilter,
  computeDateRange,
  PRESET_RANGE_LABEL,
} from "@/components/dashboard/DateRangeFilter";
import type { DatePreset } from "@/components/dashboard/DateRangeFilter";
```

---

## Domain Services

All services in `src/services/*.service.ts` use `getBrowserClient()` and return the raw Supabase query result (`{ data, error }`). Call them from client components or hooks.

Key services: `appointmentsService`, `clientsService`, `servicesService`, `staffService`, `consultationService`, `treatmentPlansService`, `productsService`, `ordersService`, `chatService`, `reportsService`, `settingsService`, `notificationsService`.

**`appointmentsService.getAll(filters?)`** supports `{ clientId, staffProfileId, serviceId, status, dateFrom, dateTo }`.

**`reportsService.getDashboardStats(range: DateRange)`** — `range` is required; returns `{ appointmentsCount, pendingAppointmentsCount, totalClientsCount, revenue, appointmentRevenue, orderRevenue }`.

**Revenue includes both appointment and order revenue.** The dashboard shows a single Revenue card with Total / Appointments / Products breakdown.

---

## Zustand Stores

| Store                  | Key state                                                            |
| ---------------------- | -------------------------------------------------------------------- |
| `useAuthStore`         | `user`, `session`, `profile`, `isLoading` — persisted (profile only) |
| `useCartStore`         | `items`, cart open/close, total — persisted                          |
| `useAppointmentsStore` | filters, view mode                                                   |
| `useChatStore`         | `activeConversationId`                                               |
| `useUIStore`           | sidebar open state                                                   |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  # Anon/publishable key (safe to expose)
SUPABASE_SECRET_KEY               # Service-role key — SERVER ONLY, never expose to client

# AI assistant (server-only)
OPENAI_API_KEY                    # OpenAI key — used by LangChain LLM + embeddings
OPENAI_CHAT_MODEL                 # Defaults to "gpt-4o-mini"
OPENAI_EMBEDDING_MODEL            # Defaults to "text-embedding-3-small" (1536 dims)
AI_DAILY_LIMIT                    # Per-user daily call cap — defaults to 20
```

All accessed via `src/config/env.ts` (`env.supabase.*`, `env.openai.*`, `env.ai.*`). **Never access `process.env` directly** anywhere else in the codebase.

---

## Prettier / Formatting

Config (`.prettierrc`):

```json
{ "singleQuote": false, "tabWidth": 2, "printWidth": 110, "trailingComma": "all" }
```

Run: `npx prettier --write "src/**/*.{ts,tsx,css,json}" "*.{ts,tsx,mjs,json}"`

---

## Files — Do Not Modify

| File                                          | Reason                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| `src/types/supabase.ts`                       | Auto-generated from Supabase schema — regenerate with `supabase gen types` |
| `supabase/migrations/0001_initial_schema.sql` | Canonical DB schema — do not edit; add new migrations instead              |
| `public/favicon.svg`                          | SVG favicon with light/dark media query built in                           |
| `components.json`                             | shadcn config — only change if adding new shadcn components                |

---

## FullCalendar

All FullCalendar packages must stay on **v6** (`^6.1.21`). v7 uses a completely different internal structure and breaks v6 plugins. If you see "Can't resolve @fullcalendar/core/index.js" errors, a package was upgraded to v7.

---

## In-App Notifications

Notifications are stored in the `notifications` table and pushed live via Supabase Realtime. The bell icon in `Header` shows unread count and a popover list.

**`src/lib/notify.ts`** — server-only helper (uses `getAdminClient` to bypass RLS):

```ts
import { notifyUserAndAdmins, notifyAdmins } from "@/lib/notify";

// Notify a specific user + all admins (pass excludeId to skip the actor)
await notifyUserAndAdmins(recipientProfileId, { type, title, body, data }, excludeId?);

// Notify only admins
await notifyAdmins({ type, title, body, data }, excludeId?);
```

**Notification types**: `"appointment" | "message" | "order" | "system" | "reminder"`

**Where notifications are created** (all in route handlers, never in client components):
| Event | Route | Recipients |
|---|---|---|
| Appointment created | `POST /api/appointments` | Assigned staff + all admins |
| Order placed | `POST /api/orders` | Client (confirmation) + all admins |
| Order delivered | `PATCH /api/orders/[id]` | Client + all admins |
| Consultation record created | `POST /api/consultation/records` | Client (if staff created it) + all admins |
| Treatment plan assigned | `POST /api/treatment-plans` | Client + all admins |

**Critical**: mutations that trigger notifications must go through the API route, not the browser service directly. `AppointmentForm` uses `fetch("/api/appointments")` for create; `TreatmentPlanAssign` uses `fetch("/api/treatment-plans")`.

---

## User Management (No Register Page)

The `/register` route does not exist. Clients and staff are created by admin only:

- **Clients**: `POST /api/clients` — creates Supabase auth user + profile with `role: "customer"` via `getAdminClient().auth.admin.createUser()`
- **Staff**: `POST /api/staff` — same pattern with `role: "staff"`, also creates `staff_profiles` row

`ClientForm` and `StaffForm` handle both create (with email/password fields) and edit modes.

---

## Chat

- Conversations and participants are created via `POST /api/chat/conversations` using `getAdminClient()` — bypasses RLS to allow customers to start conversations
- **RLS recursion fix** (migration 0005): `is_conversation_member(conv_id uuid)` is a `SECURITY DEFINER` function that checks membership without re-triggering `conversation_participants` RLS (which caused `42P17` infinite recursion)
- `useConversations()` in `src/hooks/useChat.ts` exposes `refetch()` — call it after creating a new conversation so the list updates immediately
- `getConversations` does NOT filter embedded participants — returns all participants so the UI can display the other person's name (RLS scopes which conversations are visible)
- **Staff**: can message assigned clients + admins. **Customers**: can message their assigned staff + admins. **Admin**: can message anyone.

---

## Products / Orders

- **Stock decrement** happens server-side in `POST /api/orders` via `getAdminClient()` — customers cannot update `products.stock_quantity` directly (RLS blocks it)
- **Staff**: browse-only. Cannot add to cart or place orders.
- **Checkout** (`src/components/products/Checkout.tsx`) calls `fetch("/api/orders")` — not `ordersService.create()` directly

---

## AI Assistant

The `/dashboard/ai-assistant` page provides a role-aware RAG chatbot powered by LangGraph + OpenAI.

**Architecture** (all server-side, never expose OpenAI key to client):

```
POST /api/ai/chat
  → withAuth (session check)
  → rate limit check (ai_usage table, AI_DAILY_LIMIT per day)
  → graph.stream({ messages, userRole, context: "" })
      retrieve node: embed query → matchDocuments() cosine search → build context string
      generate node: SystemMessage(role-scoped prompt + context) + history → stream LLM response
  → ReadableStream back to client (text/plain chunks)
```

**Knowledge base workflow**:
1. Edit `src/ai/knowledge-base.md` — sections delimited by `## Heading`, role access via `<!-- roles: admin,staff -->` comment
2. Run `npm run ingest-kb` — parses sections, embeds each with OpenAI, upserts into `document_chunks`
3. The `retrieve` node fetches role-scoped chunks at query time using cosine similarity

**Rate limiting**: tracked in `ai_usage(user_id, date, call_count)`. The API returns `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers; `AssistantChat` reads them and disables input when exhausted.

**Role scoping**: `document_chunks.roles text[]` controls which roles can retrieve a chunk. The `retrieve` node filters by `state.userRole`. The `generate` system prompt also instructs the LLM to never reveal admin-only data to staff/customers.

**Key files**:
| File | Purpose |
|---|---|
| `src/ai/knowledge-base.md` | Source document — edit this, then re-ingest |
| `src/ai/graph.ts` | Compiled LangGraph (retrieve → generate → END) |
| `src/ai/rag.ts` | `retrieve` + `generate` node implementations |
| `src/services/ai.service.ts` | `matchDocuments()` — in-process cosine similarity (bypasses pgvector fn) |
| `src/app/api/ai/chat/route.ts` | Streaming POST handler with rate limiting |
| `src/components/ai/AssistantChat.tsx` | Chat UI — streaming, rate-limit display, suggested questions |

**Note**: `ai.service.ts` uses in-process cosine similarity (fetches all role-scoped rows, ranks in JS) rather than the `match_documents` SQL function. The SQL function exists in the DB but is not called from application code.

---

## Common Gotchas

- **npm install**: Always use `npm install --legacy-peer-deps --cache /tmp/npm-cache-glow` to avoid pnpm-generated lockfile issues and root-owned cache collisions.
- **`getAdminClient` exists in two files**: `supabase-server.ts` (needs cookies context) and `supabase-admin.ts` (stateless, for auth.admin APIs). Use `supabase-admin.ts` for user creation via `auth.admin.*`.
- **Supabase Realtime** is used for chat (`src/hooks/useRealtime.ts`). No custom WebSocket server.
- **Product checkout is mock** — creates real `orders`/`order_items` rows but there is no payment gateway. `payment_status` is set manually.
- **`useSearchParams`** must be inside a `<Suspense>` boundary (Next.js 16 requirement for client components using search params).
- **Logo**: always use components from `src/components/common/Logo.tsx` (`LogoSidebar`, `LogoIcon`, `LogoAuth`) — do not create ad-hoc logo SVGs.
- **`supabase db reset` is destructive** — always ask the user before running it. Prefer `supabase db push` when only adding migrations.
- **Staff names visible to customers** — handled by RLS policy `profiles_select_authenticated` (migration 0003). If it ever seems missing, check that migration was applied.
- **Consultation records — customer insert** — migration 0006 adds `consultation_records_insert_own_client` so customers can submit their own records. Without it, customer submissions are silently blocked by RLS.
- **Notification mutations must go through API routes** — `notifyUserAndAdmins` uses `getAdminClient` which is server-only. Any form that should trigger a notification must call `fetch("/api/...")` not the browser service directly.
- **Chat message input auto-focuses** on conversation select — `inputRef` + `useEffect([conversationId])` in `ChatWindow`.
- **Chat scroll areas** use plain `overflow-y-auto` divs (not `ScrollArea` component) — the conversation list and message list scroll independently within a fixed-height grid container.
- **AI knowledge base changes require re-ingestion** — editing `src/ai/knowledge-base.md` has no effect until `npm run ingest-kb` is run again (it clears and re-embeds all chunks).
- **OpenAI key is server-only** — never import `src/ai/models.ts` or `src/services/ai.service.ts` into a client component; they reference `env.openai.apiKey` which is not prefixed `NEXT_PUBLIC_`.
- **`AI_DAILY_LIMIT` parsing bug** — `parseInt(process.env.AI_DAILY_LIMIT ?? "20", 20)` uses radix 20 instead of 10 (pre-existing; fix by changing to `, 10)` if the limit ever behaves unexpectedly).
