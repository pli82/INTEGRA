-- CreateTable
CREATE TABLE "LectieProgres" (
    "id" TEXT NOT NULL,
    "angajatId" TEXT NOT NULL,
    "lectieId" TEXT NOT NULL,
    "vizualizat" BOOLEAN NOT NULL DEFAULT false,
    "vizualizatLa" TIMESTAMP(3),

    CONSTRAINT "LectieProgres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LectieProgres_angajatId_lectieId_key" ON "LectieProgres"("angajatId", "lectieId");

-- AddForeignKey
ALTER TABLE "LectieProgres" ADD CONSTRAINT "LectieProgres_angajatId_fkey" FOREIGN KEY ("angajatId") REFERENCES "Angajat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectieProgres" ADD CONSTRAINT "LectieProgres_lectieId_fkey" FOREIGN KEY ("lectieId") REFERENCES "Lectie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
