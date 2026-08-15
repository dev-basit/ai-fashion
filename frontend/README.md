# Glow By Miral — Frontend

Premium salon/spa management platform built with **Next.js 16** + **React 19** + **TypeScript** + **TanStack Query**.

## Architecture

**Pure UI layer** — All business logic, database queries, and Supabase interactions live in the backend. This frontend calls the FastAPI backend via `src/services/http.ts` (axios with Bearer token injection).

**All dashboard pages are client components** (`"use client"`):

- Use `useAuth()` hook to access authenticated user/profile from Zustand store
- Use TanStack Query hooks (e.g., `useProduct()`, `useClient()`) for entity data fetching via backend API
- Never import Supabase or `http.ts` directly in components

## Setup

```bash
# Install dependencies (always use these flags)
npm install --legacy-peer-deps --cache /tmp/npm-cache-glow

# Set environment variables
cp .env.example .env.local
# Update NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_BACKEND_URL

# Start dev server (port 3000)
npm run dev
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check
npx prettier --write "src/**/*.{ts,tsx,css,json}" "*.{ts,tsx,mjs,json}"  # Format
```

## Tech Stack

| Layer       | Library          | Version | Notes                                          |
| ----------- | ---------------- | ------- | ---------------------------------------------- |
| Framework   | Next.js          | 16.2.11 | Pure UI — no API routes except `auth/callback` |
| Runtime     | React            | 19.2.4  | Server/client component pattern                |
| Language    | TypeScript       | ^5      | Strict mode                                    |
| State Mgmt  | Zustand + Query  | ^5      | Persisted auth store + TanStack Query for data |
| Forms       | react-hook-form  | ^7      | With zod validation (`z` from `zod/v4`)        |
| UI Library  | shadcn base-nova | ^1.7    | Base UI primitives (not standard Radix)        |
| HTTP        | axios            | ^1      | Bearer JWT injected, points to backend API     |
| Styling     | Tailwind CSS     | ^4      | Black & white only, semantic tokens            |
| Calendar    | FullCalendar     | ^6.1.21 | Must stay on v6 (v7 breaks all plugins)        |
| Date Picker | react-day-picker | via UI  | Wrapped in `date-picker.tsx`                   |

## Environment Variables

**Frontend `.env.local`** (all public, prefixed with `NEXT_PUBLIC_`):

```
NEXT_PUBLIC_SUPABASE_URL               # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   # Supabase publishable/anon key
NEXT_PUBLIC_BACKEND_URL                # Backend API URL (default: http://localhost:8000)
```

Access via `src/config/config.ts` — **never** `process.env` directly.

## Key Folders

```
src/
  app/dashboard/              # All client components using useAuth() + TanStack Query hooks
  components/                 # Reusable React components
  hooks/                       # TanStack Query hooks (one file per domain)
  store/                       # Zustand stores (auth, cart, ui, etc.)
  services/                    # Thin HTTP clients calling backend API
  config/                      # Constants, env config, TanStack Query setup
```

## Critical Rules

- **Dashboard pages are `"use client"`**: Always use `useAuth()` for auth state. Show `<LoadingSpinner />` while loading.
- **No useEffect + service calls**: All service calls go through TanStack Query hooks (e.g., `useAIConversations()`, `useProducts()`). Never write `useEffect(() => { await service.fetch() })`.
- **No direct Supabase in components**: Use TanStack Query hooks for data. Auth comes from `useAuth()` hook.
- **No direct `http` imports in components**: All fetching through hooks in `src/hooks/`. Streaming SSE is the only exception (SSE in `AssistantChat.tsx`).
- **Base UI, not Radix**: No `asChild` prop, no Radix imports. Use `@base-ui/react/*` instead.
- **Date pickers**: Never use `<input type="date">`. Use `DatePicker` / `DateTimePicker` from `@/components/ui/date-picker`.
- **Form pattern**: `useForm()` + `zodResolver` + `watch()` + `setValue()`, not `register()` for date pickers.

## Shared Constants, Types & Utilities

**Single source of truth** — no inline definitions in components:

| Category           | Location                    | Examples                                                                                                                       |
| ------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Types**          | `src/types/database.ts`     | `ClientSegment`, `DatePreset`                                                                                                  |
| **Config**         | `src/config/constants.ts`   | `CLIENT_SEGMENTS`, `CONSULTATION_FIELD_TYPES`, `TREATMENT_PLAN_DURATIONS`, `DEFAULT_STAFF_SCHEDULE_ROWS`, `DATE_PRESET_LABELS` |
| **Date Utilities** | `src/utils/date.ts`         | `toLocalInput()`, `computeDateRange()`                                                                                         |
| **Consultation**   | `src/utils/consultation.ts` | `newConsultationField()`                                                                                                       |
| **Roles**          | `src/utils/role.ts`         | `getRoleBadgeColor()`, `isAdmin()`, `isStaff()`                                                                                |

## Data Fetching Pattern

All components fetch data through TanStack Query hooks defined in `src/hooks/`:

```tsx
"use client";
import { useAIConversations, useAIMessages } from "@/hooks/useAI";
import { CONSULTATION_FIELD_TYPES } from "@/config/constants";
import { toLocalInput, computeDateRange } from "@/utils/date";

export function MyComponent() {
  // Automatic caching + refetching
  const { data: conversations = [], isLoading } = useAIConversations();
  const { data: messages = [] } = useAIMessages(activeConvId);

  // Use centralized utilities & constants
  const dateStr = toLocalInput("2025-01-15T10:30:00Z");
  const dateRange = computeDateRange("today");

  if (isLoading) return <LoadingSpinner />;

  return <div>{/* render conversations + messages */}</div>;
}
```

**Never do this:**

```tsx
// ❌ WRONG: useEffect + service call
useEffect(() => {
  const load = async () => {
    const { data } = await aiConversationsService.getConversations();
    setConversations(data);
  };
  load();
}, []);

// ❌ WRONG: inline type or const
type MySegment = "all" | "new" | "recurring"; // Move to database.ts
const MY_OPTIONS = [{...}]; // Move to constants.ts
function myUtility() {} // Move to utils/
```

### Available Hooks by Domain

| Domain           | Hooks                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| **AI**           | `useAIConversations()`, `useAIMessages(convId)`, `useCreateAIConversation()`, `useDeleteAIConversation()` |
| **Chat**         | `useConversations()`, `useMessages(convId)`, `useCreateConversation()`                                    |
| **Appointments** | `useAppointments()`, `useAppointment(id)`, `useCreateAppointment()`, `useUpdateAppointmentStatus()`       |
| **Clients**      | `useClients(search)`, `useClient(id)`, `useCreateClient()`, `useUpdateClient()`                           |
| **Products**     | `useProducts(filters)`, `useProduct(id)`, `useCreateProduct()`, `useUpdateProduct()`                      |
| **Staff**        | `useStaff()`, `useStaffMember(id)`, `useStaffByProfile(userId)`, `useStaffSchedule(id)`                   |
| **Services**     | `useServices(catId)`, `useService(id)`, `useServiceCategories()`, `useCreateService()`                    |

For complete architectural details, see `../CLAUDE.md`.
