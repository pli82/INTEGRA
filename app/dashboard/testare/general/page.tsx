import { notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/auth/actions";
import { TestFinalQuiz } from "@/components/TestFinalQuiz";

function amesteca<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

async function getData() {
  const angajat = await getSession();
  if (!angajat) return null;

  const testFinal = await prisma.testFinal.findFirst({ orderBy: { createdAt: "desc" } });
  if (!testFinal || !testFinal.activ) {
    return { angajat, testFinal: null, rezultatExistent: null, intrebari: [] as { id: string; enunt: string; optiuni: { id: string; text: string; corecta: boolean }[] }[] };
  }

  const rezultatExistent = await prisma.testFinalResult.findUnique({
    where: { testFinalId_angajatId: { testFinalId: testFinal.id, angajatId: angajat.id } },
  });

  const toateIntrebarile = await prisma.intrebare.findMany({ include: { optiuni: true } });
  const intrebari = amesteca(toateIntrebarile).slice(0, testFinal.nrIntrebari);

  return { angajat, testFinal, rezultatExistent, intrebari };
}

export default async function TestFinalPage() {
  const data = await getData();
  if (!data || !data.angajat) return notFound();
  const { angajat, testFinal, rezultatExistent, intrebari } = data;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant="angajat" activeHref="/dashboard/testare" userName={`${angajat.prenume} ${angajat.nume}`} userRole={angajat.functie} fotoUrl={angajat.fotoUrl} />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Test general de evaluare</h1>
        <p className="mb-6 text-sm text-slate-500">{testFinal?.titlu ?? ""}</p>

        {!testFinal ? (
          <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Testul general nu este disponibil momentan.
          </div>
        ) : rezultatExistent ? (
          <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="mb-2 text-xl font-medium text-slate-900">Ai sustinut deja acest test</h2>
            <p className="text-sm text-slate-500">
              Rezultat: {rezultatExistent.scor}/{rezultatExistent.dinTotal} · {rezultatExistent.promovat ? "Promovat" : "Respins"}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl">
            <TestFinalQuiz
              testFinalId={testFinal.id}
              intrebari={intrebari.map((i) => ({ id: i.id, enunt: i.enunt, optiuni: i.optiuni.map((o) => ({ id: o.id, text: o.text, corecta: o.corecta })) }))}
              angajat={{ nume: angajat.nume, prenume: angajat.prenume, functie: angajat.functie, structura: angajat.structura.nume }}
            />
          </div>
        )}
      </main>
    </div>
  );
}