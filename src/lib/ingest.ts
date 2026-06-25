import { prisma } from "@/lib/prisma";
import { Prisma, RepoStatus } from "@/generated/prisma/client";
import { getRepoMeta, getTree, getBlob, type TreeEntry } from "@/lib/github";
import { embedInBatches, toVectorLiteral } from "@/lib/embeddings";

const MAX_FILES = 200;
const MAX_FILE_BYTES = 100_000;
const MAX_CHUNKS = 4000;
const CHUNK_LINES = 120;
const CHUNK_OVERLAP = 20;
const FETCH_BATCH = 10;
const EMBED_UPDATE_BATCH = 200;

// extension → language label; also the allowlist of files we ingest
const LANGUAGE_BY_EXT: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript", mjs: "javascript",
  cjs: "javascript", py: "python", rb: "ruby", go: "go", java: "java", kt: "kotlin",
  rs: "rust", c: "c", h: "c", cpp: "cpp", hpp: "cpp", cc: "cpp", cs: "csharp", php: "php",
  swift: "swift", scala: "scala", sh: "shell", bash: "shell", sql: "sql", md: "markdown",
  mdx: "markdown", json: "json", yaml: "yaml", yml: "yaml", toml: "toml", css: "css",
  scss: "scss", less: "less", html: "html", vue: "vue", svelte: "svelte", astro: "astro",
  prisma: "prisma", graphql: "graphql", gql: "graphql",
};

const EXCLUDED_PATTERNS = [
  "node_modules/", "/dist/", "dist/", "/build/", "build/", ".next/", "vendor/",
  "__pycache__/", ".venv/", "coverage/", ".git/", "generated/",
];

const EXCLUDED_FILES = new Set([
  "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "poetry.lock", "Cargo.lock", "go.sum",
]);

function extensionOf(path: string): string {
  const base = path.slice(path.lastIndexOf("/") + 1);
  const dot = base.lastIndexOf(".");
  return dot === -1 ? "" : base.slice(dot + 1).toLowerCase();
}

function shouldIngest(entry: TreeEntry): boolean {
  if (entry.size > MAX_FILE_BYTES) return false;
  if (EXCLUDED_PATTERNS.some((pattern) => entry.path.includes(pattern))) return false;
  const base = entry.path.slice(entry.path.lastIndexOf("/") + 1);
  if (EXCLUDED_FILES.has(base)) return false;
  if (base.endsWith(".min.js") || base.endsWith(".map")) return false;
  return extensionOf(entry.path) in LANGUAGE_BY_EXT;
}

interface ChunkRow {
  path: string;
  language: string | null;
  content: string;
  startLine: number;
  endLine: number;
  chunkIndex: number;
}

function chunkFile(path: string, content: string): ChunkRow[] {
  const language = LANGUAGE_BY_EXT[extensionOf(path)] ?? null;
  const lines = content.split("\n");
  const rows: ChunkRow[] = [];
  const step = CHUNK_LINES - CHUNK_OVERLAP;

  for (let start = 0, index = 0; start < lines.length; start += step, index += 1) {
    const slice = lines.slice(start, start + CHUNK_LINES);
    if (!slice.join("\n").trim()) continue;
    rows.push({
      path,
      language,
      content: slice.join("\n"),
      startLine: start + 1,
      endLine: Math.min(start + CHUNK_LINES, lines.length),
      chunkIndex: index,
    });
    if (start + CHUNK_LINES >= lines.length) break;
  }
  return rows;
}

/**
 * Fetches a repo's tree, ingests eligible files into CodeChunk rows, embeds them
 * (OpenAI), stores vectors in the pgvector column, and tracks status + progress on
 * the Repository. The PAT is passed transiently and never persisted.
 */
export async function ingestRepository(repositoryId: string, token?: string): Promise<void> {
  const repository = await prisma.repository.findUnique({ where: { id: repositoryId } });
  if (!repository) return;

  try {
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { status: RepoStatus.INDEXING, error: null, chunkCount: 0, embeddedCount: 0 },
    });

    const { owner, repo } = repository;
    const { defaultBranch } = await getRepoMeta(owner, repo, token);
    const { entries } = await getTree(owner, repo, defaultBranch, token);

    const eligible = entries.filter(shouldIngest).slice(0, MAX_FILES);

    // Re-index cleanly: drop any prior chunks first
    await prisma.codeChunk.deleteMany({ where: { repositoryId } });

    const allChunks: ChunkRow[] = [];
    for (let i = 0; i < eligible.length; i += FETCH_BATCH) {
      const batch = eligible.slice(i, i + FETCH_BATCH);
      const contents = await Promise.all(
        batch.map((entry) =>
          getBlob(owner, repo, entry.sha, token)
            .then((content) => ({ entry, content }))
            .catch(() => null)
        )
      );
      for (const item of contents) {
        if (!item) continue;
        allChunks.push(...chunkFile(item.entry.path, item.content));
        if (allChunks.length >= MAX_CHUNKS) break;
      }
      if (allChunks.length >= MAX_CHUNKS) break;
    }

    const chunks = allChunks.slice(0, MAX_CHUNKS);
    for (let i = 0; i < chunks.length; i += 500) {
      await prisma.codeChunk.createMany({
        data: chunks.slice(i, i + 500).map((chunk) => ({ ...chunk, repositoryId })),
      });
    }

    // Total known up front so the UI can show an embedding progress bar
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { chunkCount: chunks.length },
    });

    // Embed stored chunks and write vectors via raw SQL (Prisma can't write `vector`).
    // Embeddings are optional: without OPENAI_API_KEY we still index the code so the repo
    // is connected and onboarding docs work; search and chat surface their own 503.
    let embedded = 0;
    if (process.env.OPENAI_API_KEY) {
      const stored = await prisma.codeChunk.findMany({
        where: { repositoryId },
        select: { id: true, content: true },
      });

      const texts = stored.map((chunk) => chunk.content);
      for await (const { start, vectors } of embedInBatches(texts)) {
        const rows = vectors.map((vector, offset) => ({
          id: stored[start + offset].id,
          literal: toVectorLiteral(vector),
        }));
        for (let i = 0; i < rows.length; i += EMBED_UPDATE_BATCH) {
          const slice = rows.slice(i, i + EMBED_UPDATE_BATCH);
          const tuples = slice.map((row) => Prisma.sql`(${row.id}::text, ${row.literal}::text)`);
          await prisma.$executeRaw(Prisma.sql`
            UPDATE "code_chunk" AS c
            SET "embedding" = v.emb::vector
            FROM (VALUES ${Prisma.join(tuples)}) AS v(id, emb)
            WHERE c."id" = v.id
          `);
        }
        embedded += vectors.length;
        await prisma.repository.update({
          where: { id: repositoryId },
          data: { embeddedCount: embedded },
        });
      }
    }

    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        status: RepoStatus.READY,
        defaultBranch,
        chunkCount: chunks.length,
        embeddedCount: embedded,
        lastIndexedAt: new Date(),
        error: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Indexing failed";
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { status: RepoStatus.FAILED, error: message.slice(0, 500) },
    });
  }
}
