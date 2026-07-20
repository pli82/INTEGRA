-- CreateEnum
CREATE TYPE "MaterialTip" AS ENUM ('VIDEO', 'PDF', 'PPTX');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "vizualizat" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "cursId" TEXT NOT NULL,
    "tip" "MaterialTip" NOT NULL,
    "titlu" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_cursId_fkey" FOREIGN KEY ("cursId") REFERENCES "Curs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
