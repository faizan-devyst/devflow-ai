-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- AlterEnum: Role { OWNER, ADMIN, MEMBER } -> { TEAM_LEAD, MEMBER }
-- No team_member rows currently use OWNER/ADMIN, so the cast below touches no data.
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('TEAM_LEAD', 'MEMBER');
ALTER TABLE "team_member" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "team_member" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE "role"::text WHEN 'MEMBER' THEN 'MEMBER' ELSE 'TEAM_LEAD' END
)::"Role_new";
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "team_member" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN "app_role" "AppRole" NOT NULL DEFAULT 'MEMBER';

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "invited_by_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitation_token_key" ON "invitation"("token");

-- CreateIndex
CREATE INDEX "invitation_team_id_idx" ON "invitation"("team_id");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
