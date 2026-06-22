---
paths: src/lib/ai/**, src/lib/embeddings.ts, src/lib/github.ts
---

# AI Integration Rules for DevFlow AI

## Model & Client Setup
```ts
// ALWAYS use claude-sonnet-4-5 — never change
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
```

## AI Features to Build (Phase 5-6)

### 1. StandupAI Summarizer (src/lib/ai/standup.ts)
Transform raw standup input → structured summary:

```ts
export async function summarizeStandup(
  userName: string,
  didToday: string,
  doingNext: string,
  blockers?: string
): Promise<string> {
  const systemPrompt = `You are a standup summarizer for DevFlow AI.
<role>Convert raw developer standup notes into clean, structured summaries.</role>
<rules>
- Be concise — max 3 bullet points per section
- Flag blockers clearly with [BLOCKER] prefix
- Use past tense for completed work, present for in-progress
- Never add information not present in the input
</rules>`

  const userPrompt = `
<task>Summarize this standup entry</task>
<developer>${userName}</developer>
<context>
Did today: ${didToday}
Doing next: ${doingNext}  
Blockers: ${blockers || 'None'}
</context>
<format>Return a concise summary in 2-4 sentences. Start with what was done, then what's next, then flag any blockers.</format>
`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 256,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })
  
  return message.content[0].type === 'text' ? message.content[0].text : ''
}
```

### 2. Sprint Digest Generator (src/lib/ai/digest.ts)
Aggregate all team entries → professional weekly digest:

```ts
export async function generateSprintDigest(
  sprintName: string,
  dateRange: string,
  compiledEntries: string[]
): Promise<string> {
  const systemPrompt = `You are a sprint digest writer for DevFlow AI.
<role>Create a professional weekly digest from team standup entries to share with clients and stakeholders.</role>
<rules>
- Write in third person (team accomplished X, not we did X)
- Group by theme not by person (avoid naming individuals unless a blocker needs owner)
- Highlight blockers and risks prominently
- Keep tone professional but human
- Max 400 words
</rules>`

  const userPrompt = `
<task>Generate a weekly sprint digest</task>
<sprint>${sprintName} — ${dateRange}</sprint>
<team_entries>
${compiledEntries.join('\n')}
</team_entries>
<format>
## Sprint Summary
[2-3 sentence overview]

## Completed This Week
[bullet list of key accomplishments]

## In Progress
[bullet list of current work]

## Blockers & Risks
[bullet list, or "None" if clear]

## Next Week Focus
[1-2 sentence forward look]
</format>
`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })
  
  return message.content[0].type === 'text' ? message.content[0].text : ''
}
```

### 3. Codebase Onboarding Doc Generator (src/lib/ai/ingest.ts)
After ingesting repo chunks, generate the onboarding doc:

```ts
export async function generateOnboardingDoc(
  repoName: string,
  fileList: string[],
  topChunks: Array<{ filePath: string; content: string }>
): Promise<string> {
  const codeContext = topChunks
    .map(c => `// ${c.filePath}\n${c.content}`)
    .join('\n\n')

  const systemPrompt = `You are a codebase documentation expert for DevFlow AI.
<role>Generate clear, developer-friendly onboarding documentation from actual source code.</role>
<rules>
- Base everything on the actual code provided — never assume or invent
- Write for a developer joining the project on day 1
- Include specific file paths when referencing code
- Use markdown with clear headings
</rules>`

  const userPrompt = `
<task>Generate a codebase onboarding document</task>
<repo>${repoName}</repo>
<files_analyzed>${fileList.join(', ')}</files_analyzed>
<code_samples>
${codeContext}
</code_samples>
<format>
# ${repoName} Onboarding Guide

## Overview
[Brief description of what this codebase does]

## Tech Stack
[List of frameworks, libraries, database, etc.]

## Project Structure
[Folder hierarchy and what each folder contains]

## Key Files & What They Do
[List of important entry points and their purpose]

## Data Flow
[How data moves through the application]

## How to Run Locally
[Setup steps to get the project running]

## Architecture Notes
[Important architectural decisions or patterns]
</format>
`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })
  
  return message.content[0].type === 'text' ? message.content[0].text : ''
}
```

### 4. Codebase Q&A Chat (src/lib/ai/chat.ts)
Semantic search → inject relevant chunks → stream answer:

```ts
export async function answerCodebaseQuestion(
  userQuestion: string,
  relevantChunks: Array<{ filePath: string; content: string }>
): Promise<ReadableStream> {
  const codeContext = relevantChunks
    .map(c => `// ${c.filePath}\n${c.content}`)
    .join('\n\n')

  const systemPrompt = `You are a codebase assistant for DevFlow AI.
<role>Answer developer questions about a specific codebase using only the provided code context.</role>
<rules>
- Only answer based on the code provided in context
- If the answer isn't in the context, say "I couldn't find that in the analyzed code"
- Always cite the file path when referencing code: "In src/lib/auth.ts, line ~45..."
- Be specific and technical — this audience is developers
</rules>`

  const userPrompt = `
<question>${userQuestion}</question>
<code_context>
${codeContext}
</code_context>
`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    }
  })
}
```

## Embeddings (src/lib/embeddings.ts)
```ts
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',  // 1536 dimensions, cheap
    input: text.slice(0, 8000),        // trim to avoid token limit
  })
  return response.data[0].embedding
}
```

## Code Chunking Strategy (src/lib/ai/ingest.ts)
```ts
// Chunk by: file (small files), function/class (large files)
// Max chunk size: ~500 tokens (~2000 chars)
// Include: file path header in every chunk for context
// Skip: node_modules, .git, lock files, images, compiled files
// Prioritize: README, main entry points, schema files, key lib files

const SKIP_PATTERNS = [
  'node_modules', '.git', 'package-lock.json', 'yarn.lock',
  '.next', 'dist', 'build', '.jpg', '.png', '.svg', '.ico'
]

// Strategy: 
// 1. Clone repo or read files from GitHub API
// 2. Filter by language (keep .ts, .tsx, .js, .jsx, .json, .md)
// 3. Split files by lines into chunks < 2000 chars
// 4. Embed each chunk with OpenAI
// 5. Store in RepoChunk table with embedding vector
```

## GitHub Integration (src/lib/github.ts)
To be built - will handle:
- Cloning repos
- Parsing file structure
- Reading file contents
- Language detection
- HuggingFace inference API for language detection (free)

## Token Optimization
- Trim input text to reasonable lengths before sending
- For standup: max 500 chars per input field
- For digest: compile max 20 entries, summarize older ones
- For Q&A: max 5 chunks, max 500 chars per chunk
