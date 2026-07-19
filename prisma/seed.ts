import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const structuri = await Promise.all(
    ["Direcția juridică", "Direcția economică", "Serviciul IT", "Cabinet președinte", "DGRU", "Direcția de management al calității"].map((nume) =>
      prisma.structura.upsert({ where: { nume }, create: { nume }, update: {} })
    )
  );

  const byName = (nume: string) => structuri.find((s) => s.nume === nume)!;

  const cursIntegritate = await prisma.curs.create({
    data: {
      titlu: "Integritate și prevenirea mitei",
      descriere: "Principii de integritate, cadrul legal și studii de caz.",
      icon: "shield",
      ordine: 1,
      lectii: {
        create: [
          { titlu: "Ce este mita: definiții și cadru legal", ordine: 1, durataMin: 12 },
          { titlu: "Principiile integrității", ordine: 2, durataMin: 10 },
          { titlu: "Conflicte de interese și cadouri", ordine: 3, durataMin: 15 },
          { titlu: "Studii de caz din administrația publică", ordine: 4, durataMin: 15 },
          { titlu: "Recapitulare și verificare", ordine: 5, durataMin: 8 },
        ],
      },
    },
  });

  const cursSMAM = await prisma.curs.create({
    data: {
      titlu: "Sistemul de management anti-mită",
      descriere: "Cerințele SMAM conform ISO 37001:2025.",
      icon: "settings",
      ordine: 2,
      lectii: {
        create: [
          { titlu: "Introducere în ISO 37001:2025", ordine: 1, durataMin: 12 },
          { titlu: "Roluri și responsabilități", ordine: 2, durataMin: 10 },
          { titlu: "Evaluarea riscurilor de mită", ordine: 3, durataMin: 12 },
          { titlu: "Controale anti-mită", ordine: 4, durataMin: 12 },
          { titlu: "Monitorizare și îmbunătățire", ordine: 5, durataMin: 10 },
          { titlu: "Test intermediar", ordine: 6, durataMin: 10 },
        ],
      },
    },
  });

  const cursRaportare = await prisma.curs.create({
    data: {
      titlu: "Raportarea incidentelor",
      descriere: "Canale de raportare și protecția avertizorilor.",
      icon: "alert",
      ordine: 3,
      lectii: {
        create: [
          { titlu: "Canale interne de raportare", ordine: 1, durataMin: 10 },
          { titlu: "Protecția avertizorilor de integritate", ordine: 2, durataMin: 10 },
          { titlu: "Cum se documentează un incident", ordine: 3, durataMin: 12 },
          { titlu: "Studiu de caz și verificare", ordine: 4, durataMin: 10 },
        ],
      },
    },
  });

  await prisma.test.create({
    data: {
      cursId: cursSMAM.id,
      titlu: "Test final SMAM",
      durataMin: 15,
      nrIntrebari: 20,
      dataLimita: new Date("2026-07-24"),
    },
  });

  const angajati = [
    { prenume: "Andrei", nume: "Popescu", email: "andrei.popescu@aep.ro", functie: "Consilier", structuraNume: "Direcția de management al calității", role: "ANGAJAT" as const },
    { prenume: "Andrei", nume: "Ionescu", email: "andrei.ionescu@aep.ro", functie: "Consilier", structuraNume: "Direcția juridică", role: "ANGAJAT" as const },
    { prenume: "Elena", nume: "Popescu", email: "elena.popescu@aep.ro", functie: "Expert", structuraNume: "Direcția economică", role: "ANGAJAT" as const },
    { prenume: "Mihai", nume: "Dumitru", email: "mihai.dumitru@aep.ro", functie: "Inspector", structuraNume: "Serviciul IT", role: "ANGAJAT" as const },
    { prenume: "Ioana", nume: "Marinescu", email: "ioana.marinescu@aep.ro", functie: "Consilier", structuraNume: "Cabinet președinte", role: "ANGAJAT" as const },
    { prenume: "Radu", nume: "Petrescu", email: "radu.petrescu@aep.ro", functie: "Referent", structuraNume: "DGRU", role: "ANGAJAT" as const },
    { prenume: "Loredana", nume: "Pop", email: "loredana.pop@aep.ro", functie: "Administrator", structuraNume: "Direcția juridică", role: "ADMINISTRATOR" as const },
  ];

  const created: Record<string, string> = {};
  for (const a of angajati) {
    const rec = await prisma.angajat.create({
      data: {
        nume: a.nume,
        prenume: a.prenume,
        email: a.email,
        functie: a.functie,
        role: a.role,
        structuraId: byName(a.structuraNume).id,
        consimtamantGDPR: true,
        consimtamantData: new Date(),
      },
    });
    created[a.prenume + " " + a.nume] = rec.id;
  }

  await prisma.enrollment.createMany({
    data: [
      { angajatId: created["Andrei Popescu"], cursId: cursIntegritate.id, status: "IN_CURS", lectiiFinal: 4, progresPct: 80 },
      { angajatId: created["Andrei Popescu"], cursId: cursSMAM.id, status: "IN_CURS", lectiiFinal: 3, progresPct: 55 },
      { angajatId: created["Andrei Popescu"], cursId: cursRaportare.id, status: "NEINCEPUT", lectiiFinal: 0, progresPct: 0 },

      { angajatId: created["Andrei Ionescu"], cursId: cursSMAM.id, status: "PROMOVAT", lectiiFinal: 6, progresPct: 100 },
      { angajatId: created["Elena Popescu"], cursId: cursSMAM.id, status: "IN_CURS", lectiiFinal: 4, progresPct: 80 },
      { angajatId: created["Mihai Dumitru"], cursId: cursSMAM.id, status: "PROMOVAT", lectiiFinal: 6, progresPct: 100 },
      { angajatId: created["Ioana Marinescu"], cursId: cursSMAM.id, status: "IN_CURS", lectiiFinal: 3, progresPct: 60 },
      { angajatId: created["Radu Petrescu"], cursId: cursSMAM.id, status: "PROMOVAT", lectiiFinal: 6, progresPct: 100 },
    ],
  });

  const testFinal = await prisma.test.findFirstOrThrow({ where: { cursId: cursSMAM.id } });

  await prisma.testResult.createMany({
    data: [
      { testId: testFinal.id, angajatId: created["Andrei Ionescu"], scor: 9, dinTotal: 10, promovat: true },
      { testId: testFinal.id, angajatId: created["Mihai Dumitru"], scor: 10, dinTotal: 10, promovat: true },
      { testId: testFinal.id, angajatId: created["Radu Petrescu"], scor: 8, dinTotal: 10, promovat: true },
    ],
  });

  await prisma.activitateLog.createMany({
    data: [
      { angajatId: created["Andrei Popescu"], mesaj: 'Ai finalizat lecția „Principiile integrității"' },
      { angajatId: created["Andrei Popescu"], mesaj: 'Ai finalizat testul „Evaluare intermediară – Sistemul anti-mită"' },
    ],
  });

  console.log("Seed complet.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
