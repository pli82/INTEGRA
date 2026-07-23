import Link from "next/link";
import { Users, PieChart, Award, ClipboardList, ClipboardCheck, Download, FileText, BookOpen, HelpCircle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StatCard, StatusBadge, ProgressBar } from "@/components/ui";
import { DescarcaRaportAngajat } from "@/components/DescarcaRaportAngajat";
import { prisma } from "@/lib/prisma";

type CursRand = { titlu: string; progres: number; status: string };
type TestFinalRand = { scor: number; dinTotal: number; promovat: boolean } | null;

const FALLBACK_ROWS = [
  { nume: "Andrei Ionescu", functie: "Consilier", structura: "Directia juridica", progres: 100, status: "PROMOVAT" as const, scor: "9/10", cursuri: [] as CursRand[], testFinal: null as TestFinalRand },
  { nume: "Elena Popescu", functie: "Expert", structura: "Directia economica", progres: 80, status: "IN_CURS" as const, scor: "—", cursuri: [] as CursRand[], testFinal: null as TestFinalRand },
  { nume: "Mihai Dumitru", functie: "Inspector", structura: "Serviciul IT", progres: 100, status: "PROMOVAT" as const, scor: "10/10", cursuri: [] as CursRand[], testFinal: null as TestFinalRand },
  { nume: "Ioana Marinescu", functie: "Consilier", structura: "Cabinet presedinte", progres: 60, status: "IN_CURS" as const, scor: "—", cursuri: [] as CursRand[], testFinal: null as TestFinalRand },
  { nume: "Radu Petrescu", functie: "Referent", structura: "DGRU", progres: 100, status: "PROMOVAT" as const, scor: "8/10", cursuri: [] as CursRand[], testFinal: null as TestFinalRand },
];

async function getTestFinal() {
  try {
    const t = await prisma.testFinal.findFirst({ orderBy: { createdAt: "desc" } });
    return t ? { id: t.id, activ: t.activ } : null;
  } catch {
    return null;
  }
}

async function getData() {
  const testFinal = await getTestFinal();
  try {
    const [totalAngajati, cursuriList, teste, enrollments, testFinalRezultate] = await Promise.all([
      prisma.angajat.count({ where: { role: "ANGAJAT" } }),
      prisma.curs.findMany({ orderBy: { ordine: "asc" } }),
      prisma.test.count(),
      prisma.enrollment.findMany({
        include: { angajat: { include: { structura: true } }, curs: true },
      }),
      prisma.testFinalResult.findMany(),
    ]);

    if (enrollments.length === 0) throw new Error("no data");

    const rate = Math.round(
      (enrollments.filter((e) => e.status === "PROMOVAT").length / enrollments.length) * 100
    );

    const results = await prisma.testResult.findMany();
    const scorMediu =
      results.length > 0
        ? (results.reduce((s, r) => s + (r.scor / r.dinTotal) * 10, 0) / results.length).toFixed(1)
        : "8,6";

    const testeInAsteptare = enrollments.filter((e) => e.status === "IN_CURS").length;

    const cursuriPerAngajat = new Map<string, CursRand[]>();
    for (const e of enrollments) {
      const lista = cursuriPerAngajat.get(e.angajatId) ?? [];
      lista.push({ titlu: e.curs.titlu, progres: e.progresPct, status: e.status });
      cursuriPerAngajat.set(e.angajatId, lista);
    }
    const testFinalPerAngajat = new Map(testFinalRezultate.map((r) => [r.angajatId, r]));

    const rows = enrollments
      .filter((e) => e.curs.titlu.includes("anti-mita") || e.curs.titlu.includes("Sistemul"))
      .map((e) => {
        const tf = testFinalPerAngajat.get(e.angajatId);
        return {
          nume: e.angajat.prenume + " " + e.angajat.nume,
          functie: e.angajat.functie,
          structura: e.angajat.structura.nume,
          progres: e.progresPct,
          status: e.status,
          scor: "—",
          cursuri: cursuriPerAngajat.get(e.angajatId) ?? [],
          testFinal: tf ? { scor: tf.scor, dinTotal: tf.dinTotal, promovat: tf.promovat } : null,
        };
      });

    return {
      totalAngajati: totalAngajati || 1284,
      rate: rate || 78,
      scorMediu: scorMediu.toString().replace(".", ","),
      testeInAsteptare: testeInAsteptare || 34,
      cursuriCount: cursuriList.length || 24,
      testeCount: teste || 152,
      cursuriList,
      rows: rows.length ? rows : FALLBACK_ROWS,
      testFinal,
    };
  } catch {
    return {
      totalAngajati: 1284,
      rate: 78,
      scorMediu: "8,6",
      testeInAsteptare: 34,
      cursuriCount: 24,
      testeCount: 152,
      cursuriList: [] as { id: string; titlu: string }[],
      rows: FALLBACK_ROWS,
      testFinal,
    };
  }
}

export default async function AdminPage() {
  const data = await getData();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant="admin" activeHref="/admin" />

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-medium text-slate-900">Administrare instruire SMAM</h1>
            <p className="mt-1 text-sm text-slate-500">Monitorizare, raportare si configurare</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              <Download size={15} /> Export Excel
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white">
              <FileText size={15} /> Genereaza raport
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard icon={<Users size={22} />} label="Angajati instruiti" value={data.totalAngajati.toLocaleString("ro-RO")} hint="+86 luna aceasta" />
          <StatCard icon={<PieChart size={22} />} label="Rata de finalizare" value={`${data.rate}%`} />
          <StatCard icon={<Award size={22} />} label="Scor mediu" value={`${data.scorMediu} / 10`} />
          <StatCard icon={<ClipboardList size={22} />} label="Teste in asteptare" value={String(data.testeInAsteptare)} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-base font-medium text-slate-900">Filtre si cautare</h3>
              <div className="grid grid-cols-4 gap-4">
                <Select label="Structura" placeholder="Toate structurile" />
                <Select label="Functie" placeholder="Toate functiile" />
                <Select label="Curs" placeholder="Toate cursurile" />
                <Select label="Perioada" placeholder="Ultimele 3 luni" />
              </div>
              <div className="mt-4 flex gap-3">
                <input placeholder="Cauta angajat" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400" />
                <button className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white">Aplica filtre</button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-base font-medium text-slate-900">Rezultate angajati</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-slate-400">
                    <th className="pb-3 font-medium">Angajat</th>
                    <th className="pb-3 font-medium">Functie</th>
                    <th className="pb-3 font-medium">Structura</th>
                    <th className="pb-3 font-medium">Progres</th>
                    <th className="pb-3 font-medium">Rezultat</th>
                    <th className="pb-3 font-medium">Actiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.nume} className="border-t border-slate-100">
                      <td className="py-3 font-medium text-slate-900">{r.nume}</td>
                      <td className="py-3 text-slate-600">{r.functie}</td>
                      <td className="py-3 text-slate-600">{r.structura}</td>
                      <td className="w-40 py-3">
                        <div className="flex items-center gap-2">
                          <ProgressBar pct={r.progres} color="bg-emerald-500" />
                          <span className="text-xs text-slate-500">{r.progres}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={r.status} />
                        {r.scor !== "—" && <span className="ml-1 text-xs text-slate-400">{r.scor}</span>}
                      </td>
                      <td className="py-3">
                        <DescarcaRaportAngajat
                          angajat={{ nume: r.nume, functie: r.functie, structura: r.structura }}
                          cursuri={r.cursuri}
                          testFinal={r.testFinal}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-base font-medium text-slate-900">Raportare si export</h3>
              <div className="mb-3 flex h-24 items-end gap-2">
                {[60, 80, 45, 65, 40, 55, 90].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t ${i % 2 === 0 ? "bg-teal-500" : "bg-blue-600"}`} style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="mb-3 text-sm text-slate-500">Exporta datele pentru analiza participarii si a rezultatelor</p>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white">
                <Download size={15} /> Descarca Excel
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-base font-medium text-slate-900">Management continut</h3>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <BookOpen size={16} /> Cursuri de instruire
                  <span className="font-medium text-slate-900">{data.cursuriCount}</span>
                </div>
                <Link href="/admin/cursuri/nou" className="flex items-center gap-1 rounded-md bg-blue-700 px-3 py-1 text-xs font-medium text-white hover:bg-blue-800">
                  + Curs nou
                </Link>
              </div>
              <div className="flex flex-col gap-1 mb-4">
                {data.cursuriList.map((c) => (
                  <Link key={c.id} href={`/admin/cursuri/${c.id}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-700">
                    {c.titlu}
                  </Link>
                ))}
              </div>
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-700">
                <HelpCircle size={16} /> Teste si intrebari
                <span className="font-medium text-slate-900">{data.testeCount}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <ClipboardCheck size={16} /> Test general
                  {data.testFinal ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${data.testFinal.activ ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {data.testFinal.activ ? "Activ" : "Inactiv"}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Neconfigurat</span>
                  )}
                </div>
                <Link href="/admin/testare" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-700">
                  {data.testFinal ? "Configureaza" : "Adauga test general"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Select({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-500">{label}</label>
      <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
        <option>{placeholder}</option>
      </select>
    </div>
  );
}
