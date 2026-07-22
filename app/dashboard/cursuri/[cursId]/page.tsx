import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { ProgressBar } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { marcheazaVizualizat } from "@/app/dashboard/actions";

async function getData(cursId: string) {
  try {
    const [angajat, curs] = await Promise.all([
      prisma.angajat.findFirst({ where: { role: "ANGAJAT" } }),
      prisma.curs.findUnique({
        where: { id: cursId },
        include: {
          lectii: { orderBy: { ordine: "asc" } },
          materiale: { orderBy: { createdAt: "desc" } },
        },
      }),
    ]);
    if (!curs) return null;
    const enrollment = angajat
      ? await prisma.enrollment.findUnique({
          where: { angajatId_cursId: { angajatId: angajat.id, cursId: curs.id } },
        })
      : null;
    return {
      angajat: angajat
        ? { nume: `${angajat.prenume} ${angajat.nume}`, functie: angajat.functie, fotoUrl: angajat.fotoUrl }
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
          <p className="text-slate-500">Cursul nu a putut fi încărcat.</p>
          <Link href="/dashboard/cursuri" className="mt-4 inline-block text-sm text-blue-700">← Înapoi</Link>
        </div>
      </div>
    );
  }

  const { angajat, curs, enrollment } = data;
  const vizualizat = enrollment?.vizualizat ?? false;
  const pct = enrollment?.progresPct ?? 0;
  const finalizate = enrollment?.lectiiFinal ?? 0;
  const marcheazaAction = marcheazaVizualizat.bind(null, curs.id);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant="angajat" activeHref="/dashboard/cursuri" userName={angajat.nume} userRole={angajat.functie} fotoUrl={angajat.fotoUrl} />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">{curs.titlu}</h1>
        <p className="mb-4 text-sm text-slate-500">{curs.descriere}</p>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1"><ProgressBar pct={pct} /></div>
          <span className="text-xs text-slate-500">{pct}% · {finalizate}/{curs.lectii.length} lecții</span>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-base font-medium text-slate-900">Lecții</h2>
              <ul className="flex flex-col gap-2">
                {curs.lectii.map((l, i) => (
                  <li key={l.id} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${i < finalizate ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                      {i < finalizate ? "✓" : i + 1}
                    </span>
                    {l.titlu === "Test intermediar" ? (
                      <Link href={`/dashboard/cursuri/${curs.id}/test-intermediar`} className="text-blue-700 hover:underline">{l.titlu}</Link>
                    ) : l.titlu}
                  </li>
                ))}
              </ul>
            </div>
            {curs.materiale.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6">