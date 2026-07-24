import { notFound } from "next/navigation";
import { Award } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { DescarcaCertificatFinal } from "@/components/DescarcaCertificatFinal";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/auth/actions";

type IntrebareDetaliu = { enunt: string; raspunsAles: string; raspunsCorect: string; corect: boolean };

async function getData() {
  const angajat = await getSession();
  if (!angajat) return null;

  const rezultate = await prisma.testFinalResult.findMany({
    where: { angajatId: angajat.id },
    include: { testFinal: { include: { curs: true } } },
    orderBy: { susTinutLa: "desc" },
  });

  return {
    angajat,
    teste: rezultate.map((r) => {
      let intrebari: IntrebareDetaliu[] = [];
      if (r.raspunsuriDetaliu) {
        try {
          intrebari = JSON.parse(r.raspunsuriDetaliu) as IntrebareDetaliu[];
        } catch {
          intrebari = [];
        }
      }
      return {
        id: r.id,
        cursTitlu: r.testFinal.curs.titlu,
        titluTest: r.testFinal.titlu,
        data: new Date(r.susTinutLa).toLocaleDateString("ro-RO"),
        scor: r.scor,
        dinTotal: r.dinTotal,
        promovat: r.promovat,
        semnatura: r.semnatura,
        intrebari,
      };
    }),
  };
}

export default async function CertificatePage() {
  const data = await getData();
  if (!data) return notFound();
  const { angajat, teste } = data;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        variant="angajat"
        activeHref="/dashboard/certificate"
        userName={`${angajat.prenume} ${angajat.nume}`}
        userRole={angajat.functie}
        fotoUrl={angajat.fotoUrl}
      />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Certificate</h1>
        <p className="mb-6 text-sm text-slate-500">
          Testele finale susținute și certificatele PDF asociate, disponibile oricând pentru descărcare.
        </p>

        {teste.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Award size={28} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">Nu ai susținut încă niciun test final.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {teste.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                      t.promovat ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}
                  >
                    <Award size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{t.titluTest}</div>
                    <div className="text-xs text-slate-500">{t.cursTitlu} · {t.data}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      t.promovat
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {t.promovat ? "Promovat" : "Respins"} {t.scor}/{t.dinTotal}
                  </span>
                  <DescarcaCertificatFinal
                    angajat={{ nume: angajat.nume, prenume: angajat.prenume, functie: angajat.functie, structura: angajat.structura.nume }}
                    cursTitlu={t.cursTitlu}
                    titluTest={t.titluTest}
                    data={t.data}
                    scor={t.scor}
                    dinTotal={t.dinTotal}
                    promovat={t.promovat}
                    semnatura={t.semnatura}
                    intrebari={t.intrebari}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}