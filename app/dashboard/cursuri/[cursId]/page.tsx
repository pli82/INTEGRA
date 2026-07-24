import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { ProgressBar } from "@/components/ui";
import { CapitoleViewer } from "@/components/CapitoleViewer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/auth/actions";

async function getData(cursId: string) {
  try {
    const angajat = await getSession();
    const curs = await prisma.curs.findUnique({
      where: { id: cursId },
      include: {
        lectii: {
          orderBy: { ordine: "asc" },
          include: { materiale: { orderBy: { createdAt: "desc" } } },
        },
      },
    });
    if (!curs) return null;
    const enrollment = angajat
      ? await prisma.enrollment.findUnique({
          where: { angajatId_cursId: { angajatId: angajat.id, cursId: curs.id } },
        })
      : null;
    const testFinalRaw = await prisma.testFinal.findUnique({ where: { cursId: curs.id } });
    const testFinal = testFinalRaw && testFinalRaw.activ ? { id: testFinalRaw.id, titlu: testFinalRaw.titlu, nrIntrebari: testFinalRaw.nrIntrebari } : null;
    const rezultatTestFinal =
      angajat && testFinal
        ? await prisma.testFinalResult.findUnique({
            where: { testFinalId_angajatId: { testFinalId: testFinal.id, angajatId: angajat.id } },
          })
        : null;
    return {
      angajat: angajat
        ? { nume: angajat.prenume + " " + angajat.nume, functie: angajat.functie, fotoUrl: angajat.fotoUrl }
        : { nume: "Andrei Popescu", functie: "Consilier", fotoUrl: null as string | null },
      curs,
      enrollment,
      testFinal,
      rezultatTestFinal: rezultatTestFinal
        ? { scor: rezultatTestFinal.scor, dinTotal: rezultatTestFinal.dinTotal, promovat: rezultatTestFinal.promovat }
        : null,
    };
  } catch {
    return null;
  }
}

export default async function CursDetaliuPage({ params }: { params: Promise<{ cursId: string }> }) {
  const { cursId } = await params;
  const data = await getData(cursId);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">Cursul nu a putut fi incarcat.</p>
          <Link href="/dashboard/cursuri" className="mt-4 inline-block text-sm text-blue-700">Inapoi</Link>
        </div>
      </div>
    );
  }

  const { angajat, curs, enrollment, testFinal, rezultatTestFinal } = data;
  const vizualizat = enrollment?.vizualizat ?? false;
  const pct = enrollment?.progresPct ?? 0;
  const finalizate = enrollment?.lectiiFinal ?? 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        variant="angajat"
        activeHref="/dashboard/cursuri"
        userName={angajat.nume}
        userRole={angajat.functie}
        fotoUrl={angajat.fotoUrl}
      />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">{curs.titlu}</h1>
        <p className="mb-4 text-sm text-slate-500">{curs.descriere}</p>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex-1"><ProgressBar pct={pct} /></div>
          <span className="text-xs text-slate-500">{pct}% · {finalizate}/{curs.lectii.filter((l) => l.titlu !== "Test intermediar").length} lectii</span>
        </div>

        <div className="mb-6">
          <CapitoleViewer cursId={curs.id} lectii={curs.lectii} finalizate={finalizate} vizualizat={vizualizat} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-base font-medium text-slate-900">Test intermediar</h2>
            {vizualizat ? (
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Testul este deblocat.
                </div>
                <Link
                  href={"/dashboard/cursuri/" + curs.id + "/test-intermediar"}
                  className="block w-full rounded-lg bg-blue-700 py-2 text-center text-sm font-medium text-white hover:bg-blue-800"
                >
                  Incepe testul
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Vizualizeaza un material video cel putin 20 de secunde pentru a debloca testul.
              </p>
            )}
          </div>

          {testFinal && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-base font-medium text-slate-900">Test final</h2>
              {rezultatTestFinal ? (
                <div
                  className={
                    rezultatTestFinal.promovat
                      ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                      : "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  }
                >
                  {rezultatTestFinal.promovat ? "Promovat" : "Respins"} — {rezultatTestFinal.scor}/{rezultatTestFinal.dinTotal}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-slate-500">{testFinal.nrIntrebari} intrebari, alese aleatoriu din testul intermediar.</p>
                  <Link
                    href={"/dashboard/cursuri/" + curs.id + "/test-final"}
                    className="block w-full rounded-lg bg-blue-700 py-2 text-center text-sm font-medium text-white hover:bg-blue-800"
                  >
                    Incepe testul final
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}