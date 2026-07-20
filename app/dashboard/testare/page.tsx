import Link from "next/link";
import { ClipboardCheck, CheckCircle2, Lock } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

const FALLBACK = {
  angajat: { nume: "Andrei Popescu", functie: "Consilier" },
  teste: [
    { titlu: "Test final SMAM", curs: "Sistemul de management anti-mită", cursId: "fallback-2", durataMin: 15, nrIntrebari: 20, status: "de_dat" as const, deblocat: true },
    {
      titlu: "Evaluare intermediară – Sistemul anti-mită",
      curs: "Sistemul de management anti-mită",
      cursId: "fallback-2",
      durataMin: 10,
      nrIntrebari: 10,
      status: "promovat" as const,
      deblocat: true,
      scor: "9/10",
    },
  ],
};

async function getData() {
  try {
    const angajat = await prisma.angajat.findFirst({
      where: { role: "ANGAJAT" },
      include: {
        testResults: { include: { test: { include: { curs: true } } } },
        enrollments: true,
      },
    });
    if (!angajat) return FALLBACK;

    const teste = await prisma.test.findMany({ include: { curs: true } });

    const finalizate = new Map(angajat.testResults.map((r) => [r.testId, r]));
    const enrollmentByCurs = new Map(angajat.enrollments.map((e) => [e.cursId, e]));

    const lista = teste.map((t) => {
      const rezultat = finalizate.get(t.id);
      const enrollment = enrollmentByCurs.get(t.cursId);
      return {
        titlu: t.titlu,
        curs: t.curs.titlu,
        cursId: t.cursId,
        durataMin: t.durataMin,
        nrIntrebari: t.nrIntrebari,
        status: rezultat ? ("promovat" as const) : ("de_dat" as const),
        deblocat: enrollment?.vizualizat ?? false,
        scor: rezultat ? `${rezultat.scor}/${rezultat.dinTotal}` : undefined,
      };
    });

    return {
      angajat: { nume: `${angajat.prenume} ${angajat.nume}`, functie: angajat.functie },
      teste: lista.length ? lista : FALLBACK.teste,
    };
  } catch {
    return FALLBACK;
  }
}

export default async function TestarePage() {
  const data = await getData();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        variant="angajat"
        activeHref="/dashboard/testare"
        userName={data.angajat.nume}
        userRole={data.angajat.functie}
      />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Testare</h1>
        <p className="mb-6 text-sm text-slate-500">
          Testele asociate modulelor tale de instruire.
        </p>

        <div className="flex flex-col gap-4">
          {data.teste.map((t) => (
            <div
              key={t.titlu}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                    t.status === "promovat" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {t.status === "promovat" ? <CheckCircle2 size={22} /> : <ClipboardCheck size={22} />}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{t.titlu}</div>
                  <div className="text-xs text-slate-500">{t.curs}</div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {t.durataMin} min · {t.nrIntrebari} întrebări
                  </div>
                </div>
              </div>

              {t.status === "promovat" ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Promovat {t.scor}
                </span>
              ) : t.deblocat ? (
                <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                  Începe testul
                </button>
              ) : (
                <Link
                  href={`/dashboard/cursuri/${t.cursId}`}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400"
                  title="Vizualizează mai întâi cursul"
                >
                  <Lock size={13} /> Blocat
                </Link>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}