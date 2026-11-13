/*
  Warnings:

  - You are about to drop the column `new_values` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `old_values` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `target_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `target_table` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `password_reset_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token_hash]` on the table `password_reset_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resource` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_hash` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "movies_release_date_idx";

-- DropIndex
DROP INDEX "theaters_city_idx";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "new_values",
DROP COLUMN "old_values",
DROP COLUMN "target_id",
DROP COLUMN "target_table",
ADD COLUMN     "details" JSONB,
ADD COLUMN     "resource" TEXT NOT NULL,
ADD COLUMN     "resource_id" TEXT;

-- AlterTable
ALTER TABLE "movies" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "password_reset_tokens" DROP COLUMN "token",
ADD COLUMN     "token_hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "theaters" ALTER COLUMN "city" SET DEFAULT 'Hà Nội';

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");
