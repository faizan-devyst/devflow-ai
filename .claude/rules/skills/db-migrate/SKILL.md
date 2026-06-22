---
name: db-migrate
description: Safely make a schema change — reads current schema, applies change, pushes to NeonDB, regenerates client, and confirms. Run with /db-migrate [description of change].
---

Perform this database schema change safely: $ARGUMENTS

## Step 1 — Read current schema
Read prisma/schema.prisma in full. Understand existing models and relations.

## Step 2 — Plan the change
State exactly what will change:
- New model? New field? Modified relation? New index?
- Any breaking changes to existing data?

## Step 3 — Apply to schema file
Edit prisma/schema.prisma with the change.
Follow rules:
- Use cuid() for new model IDs (unless external ID like Clerk)
- Add createdAt DateTime @default(now()) to every new model
- Add deletedAt DateTime? for user-owned data
- Vector columns: Unsupported("vector(1536)")

## Step 4 — Push and generate
```bash
npx prisma db push
npx prisma generate
```

## Step 5 — Verify
Run `npx tsc --noEmit` to confirm Prisma types are correct and no TypeScript errors.

## Step 6 — Report
List exactly what changed and confirm success.