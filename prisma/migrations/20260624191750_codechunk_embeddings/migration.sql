-- AlterTable
ALTER TABLE "code_chunk" ADD COLUMN     "embedding" vector(1536);

-- AlterTable
ALTER TABLE "repository" ADD COLUMN     "embedded_count" INTEGER NOT NULL DEFAULT 0;

-- HNSW index for cosine-distance similarity search over chunk embeddings
CREATE INDEX "code_chunk_embedding_idx" ON "code_chunk" USING hnsw ("embedding" vector_cosine_ops);
