import { notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { QuizIntermediar } from "@/components/QuizIntermediar";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/auth/actions";

function amesteca<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

async function getData(cursId: string) {
  try {
    const angajat = await getSession();
    const curs = await prisma.curs.findUnique({ where: { id: cursId }, include: { intrebari: { orderBy: { ordine: "asc" }, include: { optiuni: true } } } });
    if (!curs) return null;
    const testIntermediar = await prisma.test.findUnique({ where: { cursId } });
    const nrIntrebari = testIntermediar?.nrIntrebari ?? curs.intrebari.length;
    const intrebari = amesteca(curs.intrebari).slice(0, nrIntrebari);
    return {
      angajat: angajat ? { nume: angajat.prenume + " " + angajat.nume, functie: angajat.functie, fotoUrl: angajat.fotoUrl } : { nume: "Andrei Popescu", functie: "Consilier", fotoUrl: null },
      curs,
      intrebari,
    };
  } catch { return null; }
}

export default async function TestIntermediarPage({ params }: { params: Promise<{ cursId: string }> }) {
  const { cursId } = await params;
  const data = await getData(cursId);
  if (!data) return notFound();
  const { angajat, curs, intrebari } = data;
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant="angajat" activeHref="/dashboard/cursuri" userName={angajat.nume} userRole={angajat.functie} fotoUrl={angajat.fotoUrl} />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Test intermediar</h1>
        <p className="mb-6 text-sm text-slate-500">{curs.titlu}</p>
        <div className="max-w-2xl"><QuizIntermediar cursId={curs.id} intrebari={intrebari} /></div>
      </main>
    </div>
  );
}
