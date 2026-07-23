import { TrendingUp, Users, Award } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { StatCard, ProgressBar } from "@/components/ui";
import { prisma } from "@/lib/prisma";

async function getData() {
  try {
    const [cursuri, enrollments] = await Promise.all([
      prisma.curs.findMany({ orderBy: { ordine: "asc" } }),
      prisma.enrollment.findMany({
        include: { curs: true, angajat: { include: { structura: true } } },
      }),
    ]);

    const perCurs = cursuri.map((c) => {
      const ale = enrollments.filter((e) => e.cursId === c.id);
      const pct = ale.length
        ? Math.round(ale.reduce((s, e) => s + e.progresPct, 0) / ale.length)
        : 0;
      const promovati = ale.filter((e) => e.status === "PROMOVAT").length;
      return { id: c.id, titlu: c.titlu, pct, promovati, total: ale.length };
    });

    const structuriMap = new Map();
    for (const e of enrollments) {
      const nume = e.angajat.structura.nume;
      const cur = structuriMap.get(nume) ?? { nume, sum: 0, count: 0 };
      cur.sum += e.progresPct;
      cur.count += 1;
      structuriMap.set(nume, cur);
    }
    const perStructura = Array.from(structuriMap.values()).map((s) => ({
      nume: s.nume,
      pct: s.count ? Math.round(s.sum / s.count) : 0,
    }));

    const progresGeneral = enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + e.progresPct, 0) / enrollments.length)
      : 0;
    const totalPromovati = enrollments.filter((e) => e.status === "PROMOVAT").length;

    return {
      progresGeneral,
      totalAngajatiActivi: new Set(enrollments.map((e) => e.angajatId)).size,
      totalPromovati,
      perCurs,
      perStructura,
    };
  } catch (e) {
    console.error("Eroare getData admin progres:", e);
    return {
      progresGeneral: 0,
      totalAngajatiActivi: 0,
      totalPromovati: 0,
      perCurs: [],
      perStructura: [],
    };
  }
}

export default async function AdminProgresPage() {
  const data = await getData();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant="admin" activeHref="/admin/progres" />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Progres</h1>
        <p className="mb-6 text-sm text-slate-500">
          Progresul agregat al angajatilor pe cursuri si structuri.
        </p>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCard icon={<TrendingUp size={20} />} label="Progres mediu general" value={`${data.progresGeneral}%`} />
          <StatCard icon={<Users size={20} />} label="Angajati cu progres activ" value={String(data.totalAngajatiActivi)} />
          <StatCard icon={<Award size={20} />} label="Total promovari" value={String(data.totalPromovati)} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-base font-medium text-slate-900">Progres pe curs</h2>
            {data.perCurs.length === 0 ? (
              <p className="text-sm text-slate-400">Nu exista date de progres momentan.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {data.perCurs.map((c) => (
                  <div key={c.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-700">{c.titlu}</span>
                      <span className="text-slate-500">{c.pct}% - {c.promovati}/{c.total} promovati</span>
                    </div>
                    <ProgressBar pct={c.pct} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-base font-medium text-slate-900">Progres pe structura</h2>
            {data.perStructura.length === 0 ? (
              <p className="text-sm text-slate-400">Nu exista date de progres momentan.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {data.perStructura.map((s) => (
                  <div key={s.nume}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-700">{s.nume}</span>
                      <span className="text-slate-500">{s.pct}%</span>
                    </div>
                    <ProgressBar pct={s.pct} color="bg-emerald-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
