import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { embedQuery, toVectorLiteral } from "@/lib/embeddings";
import type { CodeChunkMatch } from "@/types";

/**
 * Embeds the query and returns the most similar code chunks for a repo, ranked by
 * cosine similarity (1 − cosine distance). Uses the HNSW index on the embedding column.
 */
export async function searchRepository(
  repositoryId: string,
  query: string,
  limit = 8
): Promise<CodeChunkMatch[]> {
  const queryVector = toVectorLiteral(await embedQuery(query));

  return prisma.$queryRaw<CodeChunkMatch[]>(Prisma.sql`
    SELECT
      "id",
      "path",
      "language",
      "content",
      "start_line" AS "startLine",
      "end_line" AS "endLine",
      1 - ("embedding" <=> ${queryVector}::vector) AS "similarity"
    FROM "code_chunk"
    WHERE "repository_id" = ${repositoryId}
      AND "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${queryVector}::vector
    LIMIT ${limit}
  `);
}
