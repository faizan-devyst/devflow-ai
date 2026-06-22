---
paths: src/app/api/**
---

# API Route Rules for DevFlow AI

## Standard Route Structure
Every route must follow this exact pattern using Better Auth:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const schema = z.object({ /* fields */ })

export async function POST(request: Request) {
  try {
    // 1. Get session via Better Auth
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // 3. Get user from session
    const userId = session.user.id
    
    // 4. Business logic
    const result = await prisma.someModel.create({
      data: { userId, ...parsed.data }
    })

    // 5. Return success
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    console.error('[ROUTE_NAME]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Session Access Pattern (Critical!)
Always use this exact pattern:
```ts
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const userId = session.user.id
```

## Session Type
Session object from Better Auth has this shape:
```ts
export type Session = typeof auth.$Infer.Session

interface Session {
  user: {
    id: string
    email: string
    emailVerified: boolean
    name: string
    image: string | null
    createdAt: Date
    updatedAt: Date
  }
  session: {
    id: string
    expiresAt: Date
    token: string
    createdAt: Date
    updatedAt: Date
    ipAddress: string | null
    userAgent: string | null
  }
}
```

## Streaming AI Routes
For any route that streams Claude API responses:
```ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  // Auth + validation first...
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Stream Claude response
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    }
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

## Claude API Prompt Pattern
Always use this XML-tagged structure for prompts:
```ts
const systemPrompt = `You are a specialized assistant for DevFlow AI.
<role>...</role>
<rules>
- Be concise and structured
- Return valid markdown when formatting is needed
- Never make up information
</rules>`

const userPrompt = `
<task>${taskDescription}</task>
<context>${contextData}</context>
<format>${outputFormat}</format>
`
```

## Response Patterns
Always return consistent JSON shapes:

### Success:
```ts
return NextResponse.json({ data: result }, { status: 200 })
```

### Error (client error):
```ts
return NextResponse.json({ error: message, details: validation }, { status: 400 })
```

### Error (auth):
```ts
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### Error (server):
```ts
return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
```

## Zod Validation Pattern
```ts
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  email: z.string().email('Invalid email'),
  count: z.number().int().positive('Must be positive'),
})

const parsed = schema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: parsed.error.flatten() },
    { status: 400 }
  )
}
```
