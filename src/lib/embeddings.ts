import OpenAI from "openai";

const MODEL = "text-embedding-3-small";
export const EMBEDDING_DIM = 1536;

const BATCH_SIZE = 100;
const MAX_INPUT_CHARS = 8000;
const MAX_ATTEMPTS = 3;

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  cachedClient ??= new OpenAI();
  return cachedClient;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedBatch(inputs: string[]): Promise<number[][]> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await getClient().embeddings.create({ model: MODEL, input: inputs });
      return response.data.map((item) => item.embedding);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) await sleep(attempt * 1000);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Embedding request failed");
}

/** Yields embeddings batch-by-batch so callers can persist + report progress incrementally. */
export async function* embedInBatches(
  texts: string[]
): AsyncGenerator<{ start: number; vectors: number[][] }> {
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE).map((text) => text.slice(0, MAX_INPUT_CHARS) || " ");
    const vectors = await embedBatch(batch);
    yield { start: i, vectors };
  }
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedBatch([text.slice(0, MAX_INPUT_CHARS) || " "]);
  return vector;
}

/** pgvector text literal, e.g. "[0.1,0.2,...]" — cast with ::vector in SQL. */
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
