-- CreateTable
CREATE TABLE "Intrebare" (
    "id" TEXT NOT NULL,
    "cursId" TEXT NOT NULL,
    "enunt" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Intrebare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Optiune" (
    "id" TEXT NOT NULL,
    "intrebareId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "corecta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Optiune_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Intrebare" ADD CONSTRAINT "Intrebare_cursId_fkey" FOREIGN KEY ("cursId") REFERENCES "Curs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Optiune" ADD CONSTRAINT "Optiune_intrebareId_fkey" FOREIGN KEY ("intrebareId") REFERENCES "Intrebare"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
