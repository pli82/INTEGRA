/*
  Warnings:

  - A unique constraint covering the columns `[cursId]` on the table `Test` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Test" ALTER COLUMN "titlu" SET DEFAULT 'Test intermediar',
ALTER COLUMN "nrIntrebari" SET DEFAULT 30;

-- CreateIndex
CREATE UNIQUE INDEX "Test_cursId_key" ON "Test"("cursId");
