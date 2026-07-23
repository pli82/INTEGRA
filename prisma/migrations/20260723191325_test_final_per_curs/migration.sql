/*
  Warnings:

  - A unique constraint covering the columns `[cursId]` on the table `TestFinal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cursId` to the `TestFinal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestFinal" ADD COLUMN     "cursId" TEXT NOT NULL,
ALTER COLUMN "titlu" SET DEFAULT 'Test final';

-- CreateIndex
CREATE UNIQUE INDEX "TestFinal_cursId_key" ON "TestFinal"("cursId");

-- AddForeignKey
ALTER TABLE "TestFinal" ADD CONSTRAINT "TestFinal_cursId_fkey" FOREIGN KEY ("cursId") REFERENCES "Curs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
