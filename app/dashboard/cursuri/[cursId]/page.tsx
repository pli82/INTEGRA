import Link from "next/link";
import { FileText, Presentation } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ProgressBar } from "@/components/ui";
import { VideoMaterial } from "@/components/VideoMaterial";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/auth/actions";

async function getData(cursId: string) {
  try {
    const angajat = await getSession();
    const curs = await prisma.curs.findUnique({
      where: { id: cursId },
      include: {
        lectii: { orderBy: { ordine: "asc" } },
        materiale: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!curs) return null;
    const enrollment = angajat
      ? await prisma.enrollment.findUnique({
          where: { angajatId_cursId: { angajatId: angajat.id, cursId: curs.id } },
        })
      : null;
    return {
      angajat: angajat
        ? { nume: angajat.prenume + " " + angajat.nume, functie: angajat.functie, fotoUrl: angajat.fotoUrl }
        : { nume: "Andrei Popescu", functie: "Consilier", fotoUrl: null as string | null },
      curs,
      enrollment,
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

  const { angajat, curs, enrollment } = data;
  const vizualizat = enrollment?.vizualizat ?? false;
  const pct = enrollment?.progresPct ?? 0;
  const finalizate = enrollment?.lectiiFinal ?? 0;

  const videomateriale = curs.materiale.filter((m) => m.tip === "VIDEO");
  const altemateriale = curs.materiale.filter((m) => m.tip !== "VIDEO");

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
          <span className="text-xs text-slate-500">{pct}% · {finalizate}/{curs.lectii.length} lectii</span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-base font-medium text-slate-900">Capitole</h2>
              <ul className="flex flex-col gap-2">
                {curs.lectii.map((l, i) => {
                  const esteTest = l.titlu === "Test intermediar";
                  return (
                    <li key={l.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50">
                      <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium " + (i < finalizate ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")}>
                        {i < finalizate ? "✓" : i + 1}
                      </span>
                      <div className="flex-1">
                        {esteTest ? (
                          vizualizat ? (
                            <Link href={"/dashboard/cursuri/" + curs.id + "/test-intermediar"} className="text-sm font-medium text-blue-700 hover:underline">
                              {l.titlu}
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-400">{l.titlu} (se deblocheaza dupa vizionare)</span>
                          )
                        ) : (
                          <span className="text-sm text-slate-700">{l.titlu}</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{l.durataMin} min</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {videomateriale.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-base font-medium text-slate-900">Materiale video</h2>
                {videomateriale.map((m) => (
                  <VideoMaterial
                    key={m.id}
                    url={m.url}
                    titlu={m.titlu}
                    cursId={curs.id}
                    vizualizatInitial={vizualizat}
                  />
                ))}
              </div>
            )}

            {altemateriale.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-base font-medium text-slate-900">Documente si prezentari</h2>
                <ul className="flex flex-col gap-2">
                  {altemateriale.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-3">
                      {m.tip === "PDF" ? <FileText size={18} className="text-red-500" /> : <Presentation size={18} className="text-orange-500" />}
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 hover:underline">
                        {m.titlu}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
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
              ) : videomateriale.length > 0 ? (
                <p className="text-sm text-slate-500">
                  Vizualizeaza un material video cel putin 20 de secunde pentru a debloca testul.
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  Niciun material video disponibil inca.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}