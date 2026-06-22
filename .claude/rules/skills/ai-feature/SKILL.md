---
name: ai-feature
description: Build a complete AI-powered feature — prompt chain in lib/ai/, streaming API route, and the UI to display it. Run with /ai-feature [feature-name].
---

Build the complete AI feature: $ARGUMENTS

## Step 1 — Design the prompt chain
Think through:
- What is the input? (user data, DB records, code chunks)
- What is the output? (summary, doc, chat response)
- Should it stream? (user-facing = stream, background job = don't)
- What's the token budget? (summary=256, digest=1024, doc=4096, chat=1024)

## Step 2 — Build the lib/ai/ function
Create `src/lib/ai/$ARGUMENTS.ts`:
- Use Anthropic SDK client
- System prompt: role + XML rules
- User prompt: <task> + <context> + <format> tags
- Export a typed async function
- For streaming: return the stream, let the API route handle it

## Step 3 — Build the API route
Create `src/app/api/$ARGUMENTS/route.ts`:
- Auth check
- Validate input
- Call the lib/ai function
- For streaming: pipe to ReadableStream response
- For non-streaming: return JSON with the result

## Step 4 — Build the UI
- Loading state with Framer Motion pulse or spinner (PiSpinner animate-spin)
- Result display with smooth fade-in animation
- Error state with alert-* theme colors
- For streaming: show text as it arrives using fetch + ReadableStream reader

## Step 5 — Test the prompt
Manually verify the prompt produces good output. If not, iterate on:
- More specific format instructions
- Better context structuring
- Adjusting max_tokens

@agent-ai-agent for any prompt engineering questions or debugging