import { prisma } from "@/lib/prisma";

const KEY_FILE_RE =
  /(^|\/)(readme|package\.json|cargo\.toml|go\.mod|pyproject\.toml|requirements\.txt|tsconfig\.json|next\.config|schema\.prisma|index\.[tj]sx?|main\.[tj]sx?|app\.[tj]sx?|server\.[tj]sx?)/i;

const MAX_PATHS = 300;
const MAX_KEY_FILES = 15;
const MAX_EXCERPT_CHARS = 2500;

export interface RepoContext {
  paths: string[];
  totalFiles: number;
  excerpts: { path: string; content: string }[];
}

/**
 * Builds context for the onboarding doc from indexed chunks: the file tree plus the
 * first chunk of high-signal files (README, manifests, entry points). No AI here.
 */
export async function gatherRepoContext(repositoryId: string): Promise<RepoContext> {
  const chunks = await prisma.codeChunk.findMany({
    where: { repositoryId },
    select: { path: true, content: true, chunkIndex: true },
    orderBy: [{ path: "asc" }, { chunkIndex: "asc" }],
  });

  const paths = Array.from(new Set(chunks.map((chunk) => chunk.path)));

  const excerpts: { path: string; content: string }[] = [];
  const seen = new Set<string>();

  for (const chunk of chunks) {
    if (excerpts.length >= MAX_KEY_FILES) break;
    if (chunk.chunkIndex !== 0 || seen.has(chunk.path)) continue;
    if (!KEY_FILE_RE.test(chunk.path)) continue;
    seen.add(chunk.path);
    excerpts.push({ path: chunk.path, content: chunk.content.slice(0, MAX_EXCERPT_CHARS) });
  }

  // Fallback: if nothing matched the key-file heuristic, take the first few files
  if (excerpts.length === 0) {
    for (const chunk of chunks) {
      if (excerpts.length >= MAX_KEY_FILES) break;
      if (chunk.chunkIndex !== 0 || seen.has(chunk.path)) continue;
      seen.add(chunk.path);
      excerpts.push({ path: chunk.path, content: chunk.content.slice(0, MAX_EXCERPT_CHARS) });
    }
  }

  return { paths: paths.slice(0, MAX_PATHS), totalFiles: paths.length, excerpts };
}
