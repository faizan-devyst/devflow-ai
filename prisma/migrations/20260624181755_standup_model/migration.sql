-- CreateTable
CREATE TABLE "standup" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "yesterday" TEXT NOT NULL,
    "today" TEXT NOT NULL,
    "blockers" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "standup_team_id_date_idx" ON "standup"("team_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "standup_team_id_user_id_date_key" ON "standup"("team_id", "user_id", "date");

-- AddForeignKey
ALTER TABLE "standup" ADD CONSTRAINT "standup_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standup" ADD CONSTRAINT "standup_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
