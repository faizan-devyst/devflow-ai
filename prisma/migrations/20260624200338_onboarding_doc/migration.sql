-- DropIndex
DROP INDEX "code_chunk_embedding_idx";

-- AlterTable
ALTER TABLE "repository" ADD COLUMN     "onboarding_doc" TEXT,
ADD COLUMN     "onboarding_generated_at" TIMESTAMP(3);
