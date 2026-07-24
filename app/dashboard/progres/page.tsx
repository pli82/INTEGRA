import { Sidebar } from "@/components/Sidebar";
import { ProgressBar } from "@/components/ui";
import { prisma } from "@/lib/prisma";

const FALLBACK = {
  angajat: { nume: "Andrei Popescu", functie: "Consilier" },
  progresGeneral: 45,
  cursuri: [
    { titlu: "Integritate și prevenirea mitei", pct: 80, finalizate: 4, total: 5 },
    { titlu: "Sistemul de management anti-mită", pct: 55, finalizate: 3, total: 6 },
    { titlu: "Raportarea incidentelor", pct: 0, finalizate: 0, total: 4 },
  ],
  activitate: [
    { mesaj: 'Ai finalizat lecția „Principiile integrității"', cand: "19.07.2026" },
    { mesaj: 'Ai finalizat testul „Evaluare intermediară – Sistemul anti-mită"', cand: "19.07.2026" },
  ],
};

async function getData() {
  try {
    const angajat = await prisma.angajat.findFirst({
      where: { role: "ANGAJAT" },
      include: { enrollments: { include: { curs: { include: { lectii: true } } } } },
    });
    if (!angajat) return FALLBACK;

    const cursuri = angajat.enrollments.map((e) => ({
      titlu: e.curs.titlu,
      pct: e.progresPct,
      finalizate: e.lectiiFinal,
      total: e.curs.lectii.filter((l) => l.titlu !== "Test intermediar").length,
    }));

    const activitateLog = await prisma.activitateLog.findMany({
      where: { angajatId: angajat.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const progresGeneral = cursuri.length
      ? Math.round(cursuri.reduce((s, c) => s + c.pct, 0) / cursuri.length)
      : 0;

    return {
      angajat: { nume: `${angajat.prenume} ${angajat.nume}`, functie: angajat.functie },
      progresGeneral,
      cursuri: cursuri.length ? cursuri : FALLBACK.cursuri,
      activitate: activitateLog.length
        ? activitateLog.map((a) => ({ mesaj: a.mesaj, cand: new Date(a.createdAt).toLocaleDateString("ro-RO") }))
        : FALLBACK.activitate,
    };
  } catch {
    return FALLBACK;
  }
}

export default async function ProgresPage() {
  const data = await getData();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        variant="angajat"
        activeHref="/dashboard/progres"
        userName={data.angajat.nume}
        userRole={data.angajat.functie}
      />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Progresul tău</h1>
        <p className="mb-6 text-sm text-slate-500">
          O privire de ansamblu asupra parcursului tău de instruire.
        </p>

        <div className="mb-6 flex items-center gap-8 rounded-2xl bg-gradient-to-br from-[#101c58] to-[#1b2e8f] p-8 text-white">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 border-white/20">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#7DD3FC ${data.progresGeneral * 3.6}deg, transparent 0deg)`,
                mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))",
              }}
            />
            <div className="text-center">
              <div className="text-xl font-medium">{data.progresGeneral}%</div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-medium">Progres general</h2>
            <p className="mt-1 text-sm text-white/70">
              Media progresului pe toate cele {data.cursuri.length} module de instruire active.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-base font-medium text-slate-900">Progres pe curs</h3>
            <div className="flex flex-col gap-5">
              {data.cursuri.map((c) => (
                <div key={c.titlu}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{c.titlu}</span>
                    <span className="text-slate-500">{c.finalizate}/{c.total} lecții</span>
                  </div>
                  <ProgressBar pct={c.pct} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-base font-medium text-slate-900">Istoric activitate</h3>
            <ul className="flex flex-col gap-3">
              {data.activitate.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                    ✓
                  </span>
                  <div>
                    <div className="text-slate-700">{a.mesaj}</div>
                    <div className="text-xs text-slate-400">{a.cand}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}