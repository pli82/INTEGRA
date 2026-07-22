/*
  Warnings:

  - Made the column `email` on table `Angajat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Angajat" ADD COLUMN     "parola" TEXT,
ALTER COLUMN "email" SET NOT NULL;
