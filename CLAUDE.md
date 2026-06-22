# CLAUDE.md — DevFlow AI

Read fully before touching any file. This is the single source of truth for architecture, conventions, and build status.

---

## What This Is

DevFlow AI — SaaS for small dev teams. Two features: **StandupAI** (async standups → AI digest) and **Codebase Onboarding Agent** (GitHub repo → RAG-powered Q&A + onboarding docs). Built to demonstrate full-stack + AI engineering: LangChain/LangGraph, RAG, RBAC, GraphQL, multi-provider LLM routing.

---

## Stack (strict — ask before deviating)

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 App Router, TypeScript strict, Tailwind, ShadCN, Framer Motion |
| Auth | Better Auth — session via `auth.api.getSession({ headers: await headers() })` |
| ORM | Prisma → custom client output path, `@prisma/adapter-pg` |
| Database | NeonDB (PostgreSQL) + pgvector extension |
| Backend 1 | Next.js API Routes + Server Actions (light CRUD) |
| Backend 2 | Express.js + Apollo GraphQL microservice (`server/`) — reads, RBAC, LangChain |
| Backend 3 | Python FastAPI microservice (`python-service/`) — OCR, Speech, Vision, ingestion |
| LLM primary | Claude API `claude-sonnet-4-5` — long-form, reasoning |
| LLM secondary | Groq API (free) — fast summaries, simulates Azure OpenAI role |
| Speech-to-Text | Groq Whisper (free) — voice standups |
| Embeddings | HuggingFace Inference API (free) |
| OCR | Tesseract.js (open source) |
| Image analysis | Claude Vision API |
| Orchestration | LangChain (chains) + LangGraph (stateful Q&A agent) |
| Icons | `react-icons/pi` only — never lucide |
| Email | Resend |
| Hosting | Vercel (Next.js) + Railway free tier (Express + Python) |

---

## Color System — DesignRift theme, never hardcode

```
text-canvas-text-contrast   → headings
text-canvas-text            → muted text
text-primary-text           → teal brand text
bg-canvas-base               → page bg
bg-canvas-bg-subtle          → card bg
bg-primary-solid              → primary button
border-canvas-border/50      → ALWAYS /50 opacity
```
Groups: `canvas-*`, `primary-*`, `secondary-*`, `success-*`, `warning-*`, `alert-*`, `info-*` (each: base, bg-subtle, bg, bg-hover, bg-active, line, border, border-hover, solid, solid-hover, text, text-contrast, on-*).

ShadCN overrides: `bg-primary`→`bg-primary-solid`, `text-muted-foreground`→`text-canvas-text`, `border-input`→`border-canvas-border/50`, `bg-background`→`bg-canvas-base`, `bg-card`→`bg-canvas-bg-subtle`, `ring-ring`→`ring-primary-solid`, `text-destructive`→`text-alert-text`.

---

## File Structure

```
src/
├── app/
│   ├── (auth)/                       # Better Auth pages — DONE
│   ├── (app)/dashboard/
│   │   ├── page.tsx                  # Overview — DONE
│   │   ├── settings/                 # DONE
│   │   ├── standup/                  # Mock UI DONE, real data PENDING
│   │   │   ├── page.tsx
│   │   │   └── [sprintId]/page.tsx
│   │   └── onboarding/               # Mock UI DONE, real data PENDING
│   │       ├── page.tsx
│   │       └── [repoId]/page.tsx
│   └── api/                          # Light routes only
├── components/
│   ├── ui/                           # ShadCN, theme-overridden — DONE
│   ├── standup/                      # 5 components — DONE
│   ├── onboarding/                   # 6 components — DONE
│   └── dashboard/, shared/           # DONE
├── lib/
│   ├── auth.ts, db/prisma.ts         # DONE
│   ├── mock/                         # standup + onboarding mock data — DONE, to be removed in Phase 6
│   └── ai/                           # PENDING — wraps server/ calls from frontend
├── actions/                          # PENDING — replace mock data calls
server/                                # Express + Apollo — DONE (scaffolded Phase 4)
├── src/middleware/{auth,rbac}.ts
├── src/graphql/{schema,resolvers}.ts
├── src/langchain/{model-router,standup-chain,digest-chain,rag-chain}.ts
python-service/                        # FastAPI — DONE (scaffolded Phase 5)
├── routers/{speech,ocr,vision,search,ingest}.py
├── services/{azure_speech,azure_ocr,azure_vision,azure_search,github}.py
prisma/schema.prisma                   # 14 tables — DONE
```

---

## Database Schema (Prisma — current, source of truth)

Existing Better Auth: `User` (extended), `Session`, `Account`, `Verification` — untouched.

Added: `Team`, `TeamMember` (role: OWNER/MEMBER/VIEWER), `Sprint` (status: ACTIVE/COMPLETED/PLANNED), `StandupEntry`, `Repo` (status: PENDING/PROCESSING/READY/FAILED), `RepoChunk` (`embedding vector(1536)`), `RepoDocument`, `OnboardingSession`, `PromptTemplate`.

Soft delete (`deletedAt`) on: Team, Sprint, Repo. All models have `createdAt`.

Schema change workflow: edit `prisma/schema.prisma` → `npx prisma db push` → `npx prisma generate` → `npx tsc --noEmit`.

---

## RBAC

```
ROLE_HIERARCHY = { OWNER: 3, MEMBER: 2, VIEWER: 1 }
OWNER  → everything incl. team mgmt, prompt templates, billing
MEMBER → submit standups, trigger onboarding, use Q&A
VIEWER → read-only (digests, progress)
```
Enforced in: Express middleware (`requireRole`), Prisma query filters, Next.js UI conditionals. Never trust client-only checks.

---

## AI Prompt Pattern (always XML-tagged)

```
System: <role>...</role> <rules>...</rules>
User:   <task>...</task> <context>...</context> <format>...</format>
```
Token budgets: standup summary=256, digest=1024, onboarding doc=4096, chat=1024.

Model routing (`server/src/langchain/model-router.ts`):
- `STANDUP_SUMMARY` → Groq (fast/cheap)
- `SPRINT_DIGEST`, `ONBOARDING_DOC`, `CODE_QA` → Claude `claude-sonnet-4-5`
- `EMBEDDING` → HuggingFace Inference API

RAG pipeline: GitHub fetch → semantic chunk (tiktoken, ~400 tok, file-path header) → HF embed → pgvector store → hybrid retrieval (vector + `ts_vector` keyword) → top 5 chunks → Claude context → stream. Q&A uses LangGraph (stateful, multi-turn) — not a plain chain.

---

## Coding Rules

**TypeScript** — zero `any`; explicit return types on exported functions; `unknown` + narrow over casting.

**API Routes** — auth check first → zod validate → try/catch → proper status codes → stream AI responses.

**Server Actions** — `'use server'` → auth → zod → write → `revalidatePath()`.

**Prisma** — singleton from `src/lib/db/prisma.ts`; never hard delete (`deletedAt`); always filter `deletedAt: null`; `$transaction()` for multi-step writes; pgvector needs raw `$queryRaw`.

**Animations** — Framer Motion on every interactive element. Card hover `whileHover={{y:-2}}`; list stagger `staggerChildren:0.05`; page entry fade+slide; modal scale 0.95→1. Exact variants are documented in `.claude/rules/components.md` from actual built components — read it, don't reinvent.

**Icons** — `react-icons/pi` only.

---

## Build Status

```
[x] Phase 1 — Setup, Better Auth, deployed (landing/about/terms/privacy/auth/settings)
[x] Phase 2 — Mock frontend: standup (5 components) + onboarding (6 components) + dashboard overview
[x] Phase 3 — Prisma schema: 14 tables, 4 enums, pgvector enabled
[x] Phase 4 — Express microservice: GraphQL, RBAC, LangChain chains scaffolded
[x] Phase 5 — Python FastAPI microservice: Speech/OCR/Vision/Search/Ingest scaffolded
[ ] Phase 6 — Connect frontend to real data (remove src/lib/mock/, wire GraphQL + actions)
[ ] Phase 7 — Core AI live: standup summarizer, sprint digest, health scoring
[ ] Phase 8 — RAG live: repo ingestion, embeddings, LangGraph Q&A agent
[ ] Phase 9 — Voice standup (Groq Whisper), document OCR upload, hybrid search
[ ] Phase 10 — Prompt templates UI, cost dashboard, prod deploy, README
```

---

## Environment Variables

```
DATABASE_URL=  DIRECT_URL=
BETTER_AUTH_SECRET=  BETTER_AUTH_URL=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
HF_TOKEN=
GITHUB_TOKEN=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
EXPRESS_API_URL=        # server/ on Railway
PYTHON_SERVICE_URL=     # python-service/ on Railway
```

---

## Commands

```bash
npm run dev                    # Next.js
npx prisma db push / generate / studio
npx tsc --noEmit
cd server && npm run dev       # Express
cd python-service && uvicorn main:app --reload   # FastAPI
```

---

## Pre-Commit Checklist
- [ ] Zero hardcoded colors — DesignRift classes only, borders `/50`
- [ ] Icons from `react-icons/pi` only
- [ ] Framer Motion on new interactive elements, matching existing variants
- [ ] No `any`, no raw Prisma deletes, `deletedAt: null` filter present
- [ ] Auth + RBAC check before any DB write or AI trigger
- [ ] AI prompts use XML tags, correct model per task type
- [ ] `npx tsc --noEmit` passes with 0 errors
