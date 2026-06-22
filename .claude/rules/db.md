---
paths: prisma/**, src/lib/db/**, src/actions/**
---

# Database & Prisma Rules for DevFlow AI

## Prisma Client Singleton (CRITICAL)
Always import from the singleton — never instantiate directly:
```ts
import { prisma } from '@/lib/db/prisma'
```

The singleton file (src/lib/db/prisma.ts) — use exactly as-is:
```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = `${process.env.DEVFLOW_AI_DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

## Current Schema State
Located at: `prisma/schema.prisma`

Currently deployed tables (Better Auth only):
- User
- Session
- Account
- Verification

### Prisma Config:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"  // Custom output path!
}

datasource db {
  provider = "postgresql"
}
```

## Phase 3 Schema Changes (TO BE ADDED)
When ready, add these tables to prisma/schema.prisma:

```prisma
// Roles enum for RBAC
enum Role {
  OWNER       // Full access, can manage team
  MEMBER      // Can submit standups, use onboarding
  VIEWER      // Read-only access
}

// Extend User model
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // New relations (Phase 3)
  teamMembers   TeamMember[]
  standupEntries StandupEntry[]
  onboardingSessions OnboardingSession[]
  
  sessions      Session[]
  accounts      Account[]

  @@map("user")
}

// New models
model Team {
  id            String   @id @default(cuid())
  name          String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
  
  members       TeamMember[]
  sprints       Sprint[]
  repos         Repo[]
}

model TeamMember {
  id       String  @id @default(cuid())
  userId   String
  teamId   String
  role     Role    @default(MEMBER)
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  team     Team    @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@unique([userId, teamId])
}

model Sprint {
  id            String   @id @default(cuid())
  teamId        String
  team          Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  name          String
  startDate     DateTime
  endDate       DateTime
  entries       StandupEntry[]
  digest        String?  // AI-generated HTML
  digestSentAt  DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
}

model StandupEntry {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sprintId      String
  sprint        Sprint   @relation(fields: [sprintId], references: [id], onDelete: Cascade)
  didToday      String
  doingNext     String
  blockers      String?
  summary       String?  // AI-generated
  hasBlocker    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Repo {
  id            String   @id @default(cuid())
  teamId        String
  team          Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  githubUrl     String
  name          String
  description   String?
  onboardingDoc String?  // AI-generated markdown
  ingestStatus  String   @default("pending") // pending, ingesting, complete, error
  ingestError   String?
  chunks        RepoChunk[]
  sessions      OnboardingSession[]
  ingestedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
}

model RepoChunk {
  id            String   @id @default(cuid())
  repoId        String
  repo          Repo     @relation(fields: [repoId], references: [id], onDelete: Cascade)
  filePath      String
  content       String   // max ~2000 chars
  language      String?  // programming language (auto-detected)
  embedding     Unsupported("vector(1536)")?  // pgvector: 1536 dimensions
  createdAt     DateTime @default(now())
}

model OnboardingSession {
  id            String   @id @default(cuid())
  repoId        String
  repo          Repo     @relation(fields: [repoId], references: [id], onDelete: Cascade)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages      Json     // [{role: "user"|"assistant", content: string}]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Schema Change Workflow (Phase 3)
1. Add the new models to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_features_tables`
3. Run `npx prisma generate` (auto-runs, but verify)
4. Test the types in TypeScript
5. Update CLAUDE.md schema section

## pgvector Setup (Phase 3)
After adding RepoChunk model with Unsupported("vector(1536)"):
1. Ensure NeonDB connection is active
2. Run raw SQL on NeonDB console: `CREATE EXTENSION IF NOT EXISTS vector;`
3. Run `npx prisma db push` (or migrate)
4. pgvector is now enabled

## Soft Delete Pattern
NEVER hard delete user-owned data — always use soft deletes:

```ts
// WRONG
await prisma.repo.delete({ where: { id } })

// RIGHT
await prisma.repo.update({
  where: { id },
  data: { deletedAt: new Date() }
})
```

Always filter in queries:
```ts
// Correct query
await prisma.repo.findMany({
  where: { teamId, deletedAt: null }  // ← exclude deleted
})
```

## Transaction Pattern
Use transactions for any multi-step write:
```ts
await prisma.$transaction(async (tx) => {
  const sprint = await tx.sprint.create({ data: sprintData })
  await tx.team.update({
    where: { id: teamId },
    data: { /* if needed */ }
  })
  return sprint
})
```

## Vector Search (Phase 5)
For semantic search over RepoChunk embeddings:
```ts
// Raw query required for vector similarity
const chunks = await prisma.$queryRaw<RepoChunk[]>`
  SELECT id, "filePath", content,
    1 - (embedding <=> ${embedding}::vector) AS similarity
  FROM "RepoChunk"
  WHERE "repoId" = ${repoId}
  ORDER BY embedding <=> ${embedding}::vector
  LIMIT ${limit}
`
```

## Prisma Studio
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

## Commands Reference
```bash
npx prisma db push            # Push schema changes (dev)
npx prisma migrate dev        # Create named migration (dev)
npx prisma migrate deploy     # Apply migrations (prod)
npx prisma generate           # Regenerate client types
npx prisma db seed            # Run seed.ts if it exists
npx prisma studio             # Open DB GUI
npx tsc --noEmit              # Type check generated types
```
