# CLAUDE.md — Project Coding Guidelines

Read and strictly apply all rules before touching any file. Always use `pnpm` to add packages.

---

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit
- **Backend:** Next.js Route Handlers (serverless — no separate backend process)
- **Database:** PostgreSQL + Prisma 7
- **Auth:** Better-Auth
- **Icons:** react-icons/pi (Phosphor)
- **State:** Redux Toolkit (global), React state (local UI only)

---

## 1. Project Structure

```
src/
├── app/
│   ├── [route_name]/page.tsx         # Route entry
│   └── api/
│       ├── auth/[...all]/route.ts    # Better-Auth catch-all
│       └── [resource]/route.ts       # Resource route handlers
├── components/
│   ├── [route_name]/                 # Feature-specific components
│   └── ui/                           # shadcn/ui primitives only
├── store/
│   ├── index.ts
│   └── slices/featureSlice.ts
├── lib/
│   ├── api.ts                        # Client-side fetch utility
│   ├── auth.ts                       # Better-Auth server instance
│   ├── auth-client.ts                # Better-Auth client instance
│   └── prisma.ts                     # Prisma singleton
├── types/index.ts
└── hooks/useFeatureName.ts
```

- One component per file; filename = exported component name.
- Keep `page.tsx` thin — delegate logic and JSX to components.
- No barrel `index.ts` unless the folder has 3+ public exports.

---

## 2. Rendering Strategy

Document the choice with a comment at the top of every `page.tsx`.

| Strategy | When | How |
|---|---|---|
| **SSR** | Auth-gated, user-specific | `export const dynamic = 'force-dynamic'` |
| **ISR** | Public, infrequently changing | `export const revalidate = 60` |
| **CSR** | Interactive, no SEO need | `'use client'` + Redux |

Don't mix strategies in one `page.tsx`. Split into server wrapper + client child if needed.

---

## 3. Colors — Designrift CSS Variables Only

Never use Tailwind color utilities, hardcoded hex, or arbitrary values.

| Class | Purpose |
|---|---|
| `text-canvas-text` | Muted / secondary body text |
| `text-canvas-text-contrast` | Primary body text |
| `bg-canvas-base` | Page background |
| `bg-canvas-bg-subtle` | Card / surface background |
| `bg-canvas-bg-hover` | Hover state on surfaces |
| `border-canvas-border/50` | Default borders |
| `border-canvas-border-hover` | Hover borders |
| `text-primary-text` / `text-primary-text-contrast` | Brand text |
| `bg-primary-solid` / `bg-primary-bg-subtle` | Brand backgrounds |
| `text-success-text` / `text-alert-text` / `text-warning-text` / `text-info-text` | Semantic states |

---

## 4. Components — shadcn/ui Only

Always import from `@/components/ui`. Never use raw HTML elements or third-party component libraries when a shadcn equivalent exists. Apply Designrift colors from `@/global.css`. `className` on the **parent only**.

---

## 5. Icons — react-icons/pi Only

Import exclusively from `react-icons/pi`. Verify names before use — invented names cause runtime errors. Safe fallbacks: `PiHouse`, `PiUser`, `PiBell`, `PiGear`, `PiX`, `PiCheck`, `PiArrowRight`, `PiArrowLeft`, `PiPlus`, `PiMinus`, `PiMagnifyingGlass`, `PiTrash`, `PiPencil`, `PiEye`, `PiEyeSlash`, `PiWarning`, `PiInfo`. If unsure, add `// TODO: replace with correct Pi icon`. Colors via Designrift classes only.

---

## 6. Redux — Global State Only

Use Redux Toolkit with `createSlice` and `createAsyncThunk`. Only shared cross-route state goes in Redux — local UI state (modals, hover, form drafts) stays in `useState`. Handle loading/error in the slice.

---

## 7. Database — PostgreSQL + Prisma 7

**Singleton:** always import from `src/lib/prisma.ts` — never instantiate `PrismaClient` inline.

```ts
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Schema rules:**
- `cuid()` (or `uuid()`) PKs — never auto-increment integers on the frontend.
- Always `createdAt @default(now())` and `updatedAt @updatedAt`.
- `@map` / `@@map` to keep DB columns snake_case, Prisma fields camelCase.
- Schema changes: `pnpm prisma migrate dev --name <desc>` then `pnpm prisma generate`. Never edit DB directly.

**Types:** use Prisma-generated types — never hand-roll parallel interfaces.

```ts
import type { User, Product } from '@prisma/client'
import { Prisma } from '@prisma/client'

export type UserWithPosts = Prisma.UserGetPayload<{ include: { posts: true } }>
```

---

## 8. API — Next.js Route Handlers

All backend logic in `src/app/api/`. Always guard with `auth.api.getSession` before any DB call.

```ts
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await prisma.product.findMany())
}
```

Dynamic segments: `{ params }: { params: Promise<{ id: string }> }` — always `await params`.

**Client utility** (`src/lib/api.ts`) — all client fetches go through here, no inline fetch in components:

```ts
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? ''
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}
```

Server components query Prisma directly — never call `apiFetch` from a server component.

---

## 9. Authentication — Better-Auth

```ts
// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/prisma'
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
})
export type Session = typeof auth.$Infer.Session
```

```ts
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_APP_URL })
export const { signIn, signOut, signUp, useSession } = authClient
```

```ts
// src/app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
export const { GET, POST } = toNextJsHandler(auth)
```

**Middleware** — protect pages via `middleware.ts` at project root using `auth.api.getSession`.  
**Client** — use `useSession` from `auth-client.ts`; never fetch `/api/auth/session` manually.  
**Route handlers** — always derive `userId` from `session.user.id`; never trust client-supplied IDs.

---

## 10. TypeScript

- No `any`. Use `unknown` + narrowing, or define a proper type.
- Props interfaces above the component, named `[ComponentName]Props`.
- Shared types in `src/types/index.ts`; feature types co-located in slice or component file.
- Prisma-generated types for all DB models.

---

## 11. Code Quality

- **No duplication** — repeated JSX → component; repeated logic → hook or util.
- **No `console.log`**, **no `shadow-*`**, **no `any`**.
- **Comments explain *why* only** — never *what*.
- **No layout/logic changes** unless explicitly requested.
- Build components dynamic (props) not static (hardcoded values).

---

## 12. Pre-Commit Checklist

- [ ] Designrift classes only — no raw Tailwind colors or hex
- [ ] All UI from `@/components/ui`; all icons from `react-icons/pi` and verified
- [ ] Rendering strategy declared in `page.tsx`
- [ ] Redux for shared state only; local UI state in `useState`
- [ ] Client fetches via `src/lib/api.ts`; server components use Prisma directly
- [ ] Prisma imported from `src/lib/prisma.ts` — never instantiated inline
- [ ] `auth.api.getSession` checked before every DB call in route handlers
- [ ] Prisma-generated types used — no hand-rolled model interfaces
- [ ] `pnpm prisma generate` run after schema changes
- [ ] No `any`, `console.log`, shadows, or duplication
- [ ] `className` on parent only; comments explain *why* only

---

## 13. Conventions

- **Toasts only** for feedback — `sonner` `toast.error` / `toast.success`. No inline `FormMessage`, no `error` state just to render a message. List fetches: `dispatch(thunk()).unwrap().catch(toast.error)`. Persistent guidance (e.g. "create a brand first") → plain inline text.
- **No effects for setState** — init dialog/form state in `onOpenChange`; derive defaults instead.
- **Destructive actions** — shared `ConfirmDialog` (AlertDialog), never `window.confirm`.
- **Shared primitives** in `src/components/shared/` (`ConfirmDialog`, `SearchInput`, `BrandSelect`, `DataTablePagination`).
- **Page chrome** — `PageHeader` sticky with `children` slot. Fixed-height list pages: `h-screen flex flex-col overflow-hidden` → sticky header, `flex-1 min-h-0` table, pinned `DataTablePagination`.
- **Pagination** — client-side via `DataTablePagination`; reset to page 1 in filter/search handlers.
- **IDs** — `cuid()` strings everywhere; reference as `id` (never `_id`).
- **Migrations** — `pnpm prisma migrate dev --name <desc>`; commit migration files.
- **Brand-scoped data** requires `BrandSelect`; send `brandId` on create.