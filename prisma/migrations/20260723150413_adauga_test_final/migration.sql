-- CreateTable
CREATE TABLE "TestFinal" (
    "id" TEXT NOT NULL,
    "titlu" TEXT NOT NULL DEFAULT 'Test general de evaluare',
    "activ" BOOLEAN NOT NULL DEFAULT false,
    "nrIntrebari" INTEGER NOT NULL DEFAULT 20,
    "dataLimita" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestFinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestFinalResult" (
    "id" TEXT NOT NULL,
    "testFinalId" TEXT NOT NULL,
    "angajatId" TEXT NOT NULL,
    "scor" INTEGER NOT NULL,
    "dinTotal" INTEGER NOT NULL,
    "promovat" BOOLEAN NOT NULL,
    "semnatura" TEXT NOT NULL,
    "susTinutLa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestFinalResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestFinalResult_testFinalId_angajatId_key" ON "TestFinalResult"("testFinalId", "angajatId");

-- AddForeignKey
ALTER TABLE "TestFinalResult" ADD CONSTRAINT "TestFinalResult_testFinalId_fkey" FOREIGN KEY ("testFinalId") REFERENCES "TestFinal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestFinalResult" ADD CONSTRAINT "TestFinalResult_angajatId_fkey" FOREIGN KEY ("angajatId") REFERENCES "Angajat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
