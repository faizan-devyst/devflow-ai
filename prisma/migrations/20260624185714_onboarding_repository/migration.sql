-- CreateEnum
CREATE TYPE "RepoStatus" AS ENUM ('PENDING', 'INDEXING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "repository" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "default_branch" TEXT,
    "status" "RepoStatus" NOT NULL DEFAULT 'PENDING',
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "last_indexed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_chunk" (
    "id" TEXT NOT NULL,
    "repository_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "language" TEXT,
    "content" TEXT NOT NULL,
    "start_line" INTEGER NOT NULL,
    "end_line" INTEGER NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repository_team_id_idx" ON "repository"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "repository_team_id_owner_repo_key" ON "repository"("team_id", "owner", "repo");

-- CreateIndex
CREATE INDEX "code_chunk_repository_id_idx" ON "code_chunk"("repository_id");

-- AddForeignKey
ALTER TABLE "repository" ADD CONSTRAINT "repository_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_chunk" ADD CONSTRAINT "code_chunk_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
