---
name: new-feature
description: Scaffold a complete new feature end-to-end — Prisma schema update, server action, API route, and component. Run with /new-feature [feature-name].
---

Scaffold the complete feature: $ARGUMENTS

Follow this order exactly:

## Step 1 — Schema (if needed)
Check prisma/schema.prisma. If a new model or field is needed for this feature:
- @agent-db-agent: add the model/field, run `npx prisma db push && npx prisma generate`

## Step 2 — Server Action
Create `src/actions/$ARGUMENTS.ts`:
- Use 'use server' directive
- Import auth from Clerk, prisma singleton, zod for validation
- Export named async functions
- Call revalidatePath() after mutations

## Step 3 — API Route (if AI streaming or webhooks involved)
Create `src/app/api/$ARGUMENTS/route.ts`:
- Auth check first
- Zod validation
- Try/catch with proper status codes
- Stream AI responses if applicable

## Step 4 — Component(s)
Create in `src/components/$ARGUMENTS/`:
- Use DesignRift theme classes (no hardcoded colors)
- Use react-icons/pi for all icons
- Add Framer Motion animations (card hover, list stagger, page entry)
- Replace ShadCN default colors with theme classes

## Step 5 — Page (if new route)
Create `src/app/(dashboard)/$ARGUMENTS/page.tsx`:
- Fetch data server-side
- Pass to client components
- Add loading.tsx with skeleton

## Step 6 — Type check
Run: `npx tsc --noEmit`
Fix any TypeScript errors before finishing.

## Step 7 — Review
@agent-reviewer: review all new files created in this feature
