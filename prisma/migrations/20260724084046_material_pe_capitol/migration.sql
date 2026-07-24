-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "lectieId" TEXT;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_lectieId_fkey" FOREIGN KEY ("lectieId") REFERENCES "Lectie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
