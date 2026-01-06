/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "echoParentId" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_echoParentId_fkey" FOREIGN KEY ("echoParentId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
