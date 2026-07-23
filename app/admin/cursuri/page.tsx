import Link from "next/link";
import { ShieldCheck, Settings, AlertTriangle, Plus, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

async function getData() {
  try {
    const cursuri = await prisma.curs.findMany({
      orderBy: { ordine: "asc" },
      include: {
        lectii: true,
        intrebari: true,
        enrollments: true,
      },
    });
    return cursuri.map((c) => ({
      id: c.id,
      titlu: c.titlu,
      descriere: c.descriere ?? "",
      icon: c.icon,
      totalLectii: c.lectii.length,
      totalIntrebari: c.intrebari.length,
      totalInscrisi: c.enrollments.length,
      totalPromovati: c.enrollments.filter((e) => e.status === "PROMOVAT").length,
    }));
  } catch (e) {
    console.error("Eroare getData admin cursuri:", e);
    return [];
  }
}

const iconFor = (icon: string) => {
  if (icon === "settings") return <Settings size={20} />;
  if (icon === "alert") return <AlertTriangle size={20} />;
  return <ShieldCheck size={20} />;
};

const bgFor = (icon: string) => {
  if (icon === "settings") return "bg-emerald-50 text-emerald-600";
  if (icon === "alert") return "bg-amber-50 text-amber-600";
  return "bg-blue-50 text-blue-600";
};

export default async function AdminCursuriPage() {
  const cursuri = await getData();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant="admin" activeHref="/admin/cursuri" />
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-medium text-slate-900">Cursuri</h1>
            <p className="text-sm text-slate-500">Gestioneaza cursurile, materialele si intrebarile de test.</p>
          </div>
          <Link href="/admin/cursuri/nou" className="flex items-center gap-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
            <Plus size={15} /> Curs nou
          </Link>
        </div>

        {cursuri.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">Nu exista cursuri momentan.</p>
            <Link href="/admin/cursuri/nou" className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              <Plus size={15} /> Creeaza primul curs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {cursuri.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cursuri/${c.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgFor(c.icon)}`}>
                      {iconFor(c.icon)}
                    </div>
                    <div>
                      <h2 className="text-sm font-medium text-slate-900 group-hover:text-blue-700">{c.titlu}</h2>
                      {c.descriere && <p className="text-xs text-slate-500">{c.descriere}</p>}
                    </div>
                  </div>
                  <ChevronRight size={18} className="mt-1 shrink-0 text-slate-300 group-hover:text-blue-500" />
                </div>
                <div className="flex gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>{c.totalLectii} lectii</span>
                  <span>{c.totalIntrebari} intrebari</span>
                  <span>{c.totalInscrisi} inscrisi</span>
                  <span className="text-emerald-600">{c.totalPromovati} promovati</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}