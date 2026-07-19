-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ANGAJAT', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('NEINCEPUT', 'IN_CURS', 'PROMOVAT', 'RESPINS');

-- CreateTable
CREATE TABLE "Structura" (
    "id" TEXT NOT NULL,
    "nume" TEXT NOT NULL,

    CONSTRAINT "Structura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Angajat" (
    "id" TEXT NOT NULL,
    "nume" TEXT NOT NULL,
    "prenume" TEXT NOT NULL,
    "email" TEXT,
    "functie" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ANGAJAT',
    "structuraId" TEXT NOT NULL,
    "consimtamantGDPR" BOOLEAN NOT NULL DEFAULT false,
    "consimtamantData" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Angajat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curs" (
    "id" TEXT NOT NULL,
    "titlu" TEXT NOT NULL,
    "descriere" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'shield',
    "ordine" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Curs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lectie" (
    "id" TEXT NOT NULL,
    "cursId" TEXT NOT NULL,
    "titlu" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 0,
    "durataMin" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "Lectie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "angajatId" TEXT NOT NULL,
    "cursId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'NEINCEPUT',
    "lectiiFinal" INTEGER NOT NULL DEFAULT 0,
    "progresPct" INTEGER NOT NULL DEFAULT 0,
    "actualizatLa" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "cursId" TEXT NOT NULL,
    "titlu" TEXT NOT NULL,
    "durataMin" INTEGER NOT NULL DEFAULT 15,
    "nrIntrebari" INTEGER NOT NULL DEFAULT 20,
    "dataLimita" TIMESTAMP(3),

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "angajatId" TEXT NOT NULL,
    "scor" INTEGER NOT NULL,
    "dinTotal" INTEGER NOT NULL DEFAULT 10,
    "promovat" BOOLEAN NOT NULL,
    "susTinutLa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitateLog" (
    "id" TEXT NOT NULL,
    "angajatId" TEXT NOT NULL,
    "mesaj" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivitateLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Structura_nume_key" ON "Structura"("nume");

-- CreateIndex
CREATE UNIQUE INDEX "Angajat_email_key" ON "Angajat"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_angajatId_cursId_key" ON "Enrollment"("angajatId", "cursId");

-- AddForeignKey
ALTER TABLE "Angajat" ADD CONSTRAINT "Angajat_structuraId_fkey" FOREIGN KEY ("structuraId") REFERENCES "Structura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lectie" ADD CONSTRAINT "Lectie_cursId_fkey" FOREIGN KEY ("cursId") REFERENCES "Curs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_angajatId_fkey" FOREIGN KEY ("angajatId") REFERENCES "Angajat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_cursId_fkey" FOREIGN KEY ("cursId") REFERENCES "Curs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_cursId_fkey" FOREIGN KEY ("cursId") REFERENCES "Curs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResult" ADD CONSTRAINT "TestResult_angajatId_fkey" FOREIGN KEY ("angajatId") REFERENCES "Angajat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
