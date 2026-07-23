import Link from "next/link";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";

async function getData() {
  try {
    const [teste, rezultate, testeInAsteptare, cursuri] = await Promise.all([
      prisma.test.findMany({ include: { curs: true, rezultate: true } }),
      prisma.testResult.findMany({
        include: { angajat: true, test: { include: { curs: true } } },
        orderBy: { susTinutLa: "desc" },
        take: 20,
      }),
      prisma.enrollment.count({ where: { status: "IN_CURS" } }),
      prisma.curs.findMany({
        orderBy: { ordine: "asc" },
        include: { testFinal: { include: { rezultate: true } } },
      }),
    ]);

    const totalPromovati = rezultate.filter((r) => r.promovat).length;
    const rataPromovare = rezultate.length ? Math.round((totalPromovati / rezultate.length) * 100) : 0;

    return {
      teste: teste.map((t) => ({
        id: t.id,
        titlu: t.titlu,
        curs: t.curs.titlu,
        nrIntrebari: t.nrIntrebari,
        durataMin: t.durataMin,
        totalSustineri: t.rezultate.length,
      })),
      rezultate: rezultate.map((r) => ({
        id: r.id,
        angajat: `${r.angajat.prenume} ${r.angajat.nume}`,
        test: r.test.titlu,
        curs: r.test.curs.titlu,
        scor: r.scor,
        dinTotal: r.dinTotal,
        promovat: r.promovat,
        data: new Date(r.susTinutLa).toLocaleDateString("ro-RO"),
      })),
      testeInAsteptare,
      rataPromovare,
      testeFinaleCursuri: cursuri.map((c) => ({
        cursId: c.id,
        cursTitlu: c.titlu,
        testFinal: c.testFinal
          ? {
              titlu: c.testFinal.titlu,
              activ: c.testFinal.activ,
              nrIntrebari: c.testFinal.nrIntrebari,
              totalSustineri: c.testFinal.rezultate.length,
            }
          : null,
      })),
    };
  } catch (e) {
    console.error("Eroare getData admin testare:", e);
    return {
      teste: [] as { id: string; titlu: string; curs: string; nrIntrebari: number; durataMin: number; totalSustineri: number }[],
      rezultate: [] as { id: string; angajat: string; test: string; curs: string; scor: number; dinTotal: number; promovat: boolean; data: string }[],
      testeInAsteptare: 0,
      rataPromovare: 0,
      testeFinaleCursuri: [] as {
        cursId: string;
        cursTitlu: string;
        testFinal: { titlu: string; activ: boolean; nrIntrebari: number; totalSustineri: number } | null;
      }[],
    };
  }
}

export default async function AdminTestarePage() {
  const data = await getData();
  const testeFinaleActive = data.testeFinaleCursuri.filter((c) => c.testFinal?.activ).length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant="admin" activeHref="/admin/testare" />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Testare</h1>
        <p className="mb-6 text-sm text-slate-500">
          Testele configurate si rezultatele recente ale angajatilor.
        </p>

        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard icon={<ClipboardList size={20} />} label="Teste configurate" value={String(data.teste.length)} />
          <StatCard icon={<CheckCircle2 size={20} />} label="Rata de promovare" value={`${data.rataPromovare}%`} />
          <StatCard icon={<XCircle size={20} />} label="Teste in asteptare" value={String(data.testeInAsteptare)} />
          <StatCard icon={<CheckCircle2 size={20} />} label="Teste finale active" value={`${testeFinaleActive} / ${data.testeFinaleCursuri.length}`} />
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-base font-medium text-slate-900">Teste finale pe curs</h2>
          <p className="mb-4 text-xs text-slate-400">
            Fiecare curs poate avea propriul test final, cu intrebari extrase din testul lui intermediar. Configurarea se face pe pagina fiecarui curs.
          </p>
          {data.testeFinaleCursuri.length === 0 ? (
            <p className="text-sm text-slate-400">Nu exista cursuri momentan.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="pb-2 font-normal">Curs</th>
                  <th className="pb-2 font-normal">Test final</th>
                  <th className="pb-2 font-normal">Status</th>
                  <th className="pb-2 font-normal">Intrebari</th>
                  <th className="pb-2 font-normal">Sustineri</th>
                  <th className="pb-2 font-normal">Actiuni</th>
                </tr>
              </thead>
              <tbody>
                {data.testeFinaleCursuri.map((c) => (
                  <tr key={c.cursId} className="border-b border-slate-50">
                    <td className="py-2 text-slate-800">{c.cursTitlu}</td>
                    <td className="py-2 text-slate-600">{c.testFinal?.titlu ?? "—"}</td>
                    <td className="py-2">
                      {c.testFinal ? (
                        <span className={c.testFinal.activ ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"}>
                          {c.testFinal.activ ? "Activ" : "Inactiv"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400">Neconfigurat</span>
                      )}
                    </td>
                    <td className="py-2 text-slate-600">{c.testFinal?.nrIntrebari ?? "—"}</td>
                    <td className="py-2 text-slate-600">{c.testFinal?.totalSustineri ?? 0}</td>
                    <td className="py-2">
                      <Link href={`/admin/cursuri/${c.cursId}`} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-700">
                        {c.testFinal ? "Configureaza" : "Adauga"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-medium text-slate-900">Teste configurate</h2>
          {data.teste.length === 0 ? (
            <p className="text-sm text-slate-400">Nu exista teste configurate momentan.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="pb-2 font-normal">Test</th>
                  <th className="pb-2 font-normal">Curs</th>
                  <th className="pb-2 font-normal">Intrebari</th>
                  <th className="pb-2 font-normal">Durata</th>
                  <th className="pb-2 font-normal">Sustineri</th>
                </tr>
              </thead>
              <tbody>
                {data.teste.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50">
                    <td className="py-2 text-slate-800">{t.titlu}</td>
                    <td className="py-2 text-slate-600">{t.curs}</td>
                    <td className="py-2 text-slate-600">{t.nrIntrebari}</td>
                    <td className="py-2 text-slate-600">{t.durataMin} min</td>
                    <td className="py-2 text-slate-600">{t.totalSustineri}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-medium text-slate-900">Rezultate recente</h2>
          {data.rezultate.length === 0 ? (
            <p className="text-sm text-slate-400">Nu exista rezultate momentan.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="pb-2 font-normal">Angajat</th>
                  <th className="pb-2 font-normal">Test</th>
                  <th className="pb-2 font-normal">Scor</th>
                  <th className="pb-2 font-normal">Status</th>
                  <th className="pb-2 font-normal">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.rezultate.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="py-2 text-slate-800">{r.angajat}</td>
                    <td className="py-2 text-slate-600">{r.test}</td>
                    <td className="py-2 text-slate-600">{r.scor}/{r.dinTotal}</td>
                    <td className="py-2">
                      <span className={r.promovat ? "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700" : "rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"}>
                        {r.promovat ? "Promovat" : "Respins"}
                      </span>
                    </td>
                    <td className="py-2 text-slate-500">{r.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}