# DevFlow AI

The AI workspace for engineering teams. DevFlow AI gives your team written async standups with AI summaries and one click weekly digests, plus a codebase onboarding agent that indexes any GitHub repository for semantic search, grounded Q&A, and an automatically generated onboarding guide.

Open source, bring your own API keys, and your data stays in your own database.

> Repository: https://github.com/faizan-devyst/devflow-ai
> If DevFlow AI saves your team time, please star and fork the repo so other teams can find it.

---

## What it does

**StandupAI**
- Written async standups scoped to each team (yesterday, today, blockers).
- AI daily summaries that group related work and surface blockers, powered by Claude.
- One click weekly sprint digest that is emailed to the whole team.
- Filter the feed by teammate or date.

**Codebase Onboarding Agent**
- Connect any GitHub repository (a personal access token is only needed for private repos).
- The code is fetched, chunked, and embedded into a private vector index (pgvector).
- Semantic search over the repo from a plain English query.
- Grounded Q&A chat whose answers cite the exact files and line ranges.
- An automatically generated onboarding guide (overview, architecture, key modules, where to start).

**Roles & access**
- Three roles: a single **Owner** (seeded manually), **Team Leads**, and **Members**.
- **Invite-only.** There is no public sign-up. The Owner creates teams and invites Team Leads and Members; Team Leads can invite Members into their own teams. Each invitee gets an email link to set their password and join.
- The Owner manages every team; Team Leads manage people within the teams they lead, all from a dedicated Team page.

**Foundation**
- Secure auth with Better Auth (email and password), gated behind invitations.
- Team workspaces. Standups and repositories are scoped per team.
- Bring your own keys. The app calls Anthropic, OpenAI, and Resend with the keys you provide.

---

## Tech stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Designrift color system, react-icons (Phosphor)
- **State:** Redux Toolkit
- **Database:** PostgreSQL with pgvector, via Prisma 7 (tested on Neon)
- **Auth:** Better Auth
- **AI:** Claude (`claude-opus-4-8`) for summaries, digests, answers, and docs; OpenAI `text-embedding-3-small` for code embeddings
- **Email:** Resend

---

## Prerequisites

- Node.js 20 or newer
- pnpm (`npm install -g pnpm`)
- A PostgreSQL database with the pgvector extension available (Neon works out of the box)
- API keys (see the table below)

---

## Quick start

### 1. Fork and clone

Fork the repository on GitHub first (this gives you your own copy to deploy and contribute from), then clone your fork:

```bash
git clone https://github.com/<your-username>/devflow-ai.git
cd devflow-ai
pnpm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and fill in the values below.

```bash
# Database (PostgreSQL with pgvector, e.g. Neon)
DEVFLOW_AI_DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# App URL (used by Better Auth and metadata)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Better Auth
BETTER_AUTH_SECRET="a long random string"
BETTER_AUTH_URL="http://localhost:3000"

# Owner account (seeded manually — see step 4). This email is the only one
# allowed to sign up without an invitation.
OWNER_EMAIL="owner@yourcompany.com"
OWNER_PASSWORD="a strong password, at least 8 characters"
OWNER_NAME="Owner"

# AI providers
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Email (transactional email for invitations, reset, and digests)
RESEND_API_KEY="re_..."
```

### 3. Set up the database

The schema includes the pgvector extension and the vector column for code embeddings. Apply migrations and generate the Prisma client:

```bash
pnpm prisma migrate deploy
pnpm prisma generate
```

For local schema changes during development, use:

```bash
pnpm prisma migrate dev --name your_change
```

### 4. Seed the Owner

There is no public sign-up — the first account is the Owner, created from the `OWNER_*` variables you set above:

```bash
pnpm db:seed
```

This creates (or updates) the Owner with email/password credentials and a pre-verified email, so you can sign in immediately. It is safe to re-run; it resets the Owner's password to the current `OWNER_PASSWORD`. Everyone else joins by invitation from inside the app.

### 5. Run the app

```bash
pnpm dev
```

Open http://localhost:3000.

---

## Where to get each API key

| Variable | Used for | Where to get it |
| --- | --- | --- |
| `DEVFLOW_AI_DATABASE_URL` | Primary database connection | Create a Postgres database at https://neon.tech (or any Postgres with pgvector) and copy the pooled connection string |
| `DIRECT_URL` | Direct connection for migrations | The direct (non pooled) connection string from your database provider |
| `BETTER_AUTH_SECRET` | Signing sessions | Generate one with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` | App base URL | `http://localhost:3000` locally, your deployed URL in production |
| `OWNER_EMAIL`, `OWNER_PASSWORD`, `OWNER_NAME` | The single Owner account seeded by `pnpm db:seed`; `OWNER_EMAIL` is also the only email allowed to sign up without an invite | Values you choose |
| `ANTHROPIC_API_KEY` | Summaries, digests, codebase answers, onboarding docs | https://console.anthropic.com |
| `OPENAI_API_KEY` | Code embeddings for indexing and search | https://platform.openai.com |
| `RESEND_API_KEY` | Verification, password reset, and digest emails | https://resend.com |
| GitHub personal access token | Only entered in the app to index a private repo | https://github.com/settings/tokens (a fine grained token with read access to the repo). It is used once to fetch the code and is never stored |

The AI features fail with a clear message if `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is missing, so you can run the app and add keys when you are ready.

---

## Using the app

1. **Sign in as the Owner** at `/sign-in` using the credentials you seeded in step 4.
2. **Create a team** from the workspace switcher in the dashboard sidebar (Owner only).
3. **Invite your team** from the **Team** page. The Owner can invite Team Leads and Members into any team; Team Leads can invite Members into the teams they lead. Each invitee receives an email link to set their password and join — manage pending invites (resend or revoke) and member roles from the same page.
4. **Standups:** open Standups, post your update, and use AI Insights to generate a daily summary or to generate and email a weekly digest.
5. **Onboarding:** open Onboarding, connect a GitHub repository, and watch the indexing progress. Once it is ready you can:
   - **Search code** with a plain English query.
   - **Ask** questions in a chat that cites the files and lines it used.
   - **Generate an onboarding doc** for the repository.

---

## Deploy on Vercel

1. Fork this repository to your own GitHub account.
2. In Vercel, click New Project and import your fork.
3. Add all environment variables from the table above. Set `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` to your production URL.
4. Make sure your database is reachable from Vercel and that migrations have been applied (`pnpm prisma migrate deploy`).
5. Seed the Owner once against your production database (`pnpm db:seed` with the production `OWNER_*` and `DEVFLOW_AI_DATABASE_URL` set).
6. Deploy. The build runs `prisma generate && next build`.

Repository indexing runs as background work after the connect request returns, which is supported on Vercel. On other platforms make sure background tasks are allowed to finish.

---

## Self hosting

DevFlow AI is a standard Next.js app. Build and run it anywhere that runs Node.js:

```bash
pnpm build
pnpm start
```

Provide the same environment variables and a reachable Postgres database with pgvector enabled.

---

## Project structure

```text
src/
  app/                 Routes and API route handlers
    api/               teams, members, invitations, standups, repositories (search, chat, onboarding), github
  components/          Feature components, shared primitives, and ui (shadcn)
  lib/                 prisma, auth, auth-utils, teams, ai, embeddings, github, ingest, search, rate-limit
  store/               Redux Toolkit store and slices
middleware.ts          Auth gate for /dashboard/* routes
prisma/                schema.prisma, migrations, and seed.ts (Owner seeding)
```

---

## Contributing

Contributions are welcome: bug fixes, features, docs, and design improvements. Fork the repo, create a branch, and open a pull request. If the project is useful to you, a star helps others discover it.

---

## License

MIT. You are free to use, copy, modify, and distribute this software under the terms of the MIT License.
