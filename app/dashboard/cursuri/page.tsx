import Link from "next/link";
import { ShieldCheck, Settings, AlertTriangle, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ProgressBar } from "@/components/ui";
import { prisma } from "@/lib/prisma";

const FALLBACK = {
  angajat: { nume: "Andrei Popescu", functie: "Consilier" },
  cursuri: [
    {
      id: "fallback-1",
      titlu: "Integritate și prevenirea mitei",
      descriere: "Principii de integritate, cadrul legal și studii de caz.",
      icon: "shield",
      pct: 80,
      finalizate: 4,
      total: 5,
      lectii: [
        "Ce este mita: definiții și cadru legal",
        "Principiile integrității",
        "Conflicte de interese și cadouri",
        "Studii de caz din administrația publică",
        "Recapitulare și verificare",
      ],
    },
    {
      id: "fallback-2",
      titlu: "Sistemul de management anti-mită",
      descriere: "Cerințele SMAM conform ISO 37001:2025.",
      icon: "settings",
      pct: 55,
      finalizate: 3,
      total: 6,
      lectii: [
        "Introducere în ISO 37001:2025",
        "Roluri și responsabilități",
        "Evaluarea riscurilor de mită",
        "Controale anti-mită",
        "Monitorizare și îmbunătățire",
        "Test intermediar",
      ],
    },
    {
      id: "fallback-3",
      titlu: "Raportarea incidentelor",
      descriere: "Canale de raportare și protecția avertizorilor.",
      icon: "alert",
      pct: 0,
      finalizate: 0,
      total: 4,
      lectii: [
        "Canale interne de raportare",
        "Protecția avertizorilor de integritate",
        "Cum se documentează un incident",
        "Studiu de caz și verificare",
      ],
    },
  ],
};

async function getData() {
  try {
    const angajat = await prisma.angajat.findFirst({
      where: { role: "ANGAJAT" },
      include: {
        enrollments: { include: { curs: { include: { lectii: { orderBy: { ordine: "asc" } } } } } },
      },
    });
    if (!angajat) return FALLBACK;

    const cursuri = angajat.enrollments.map((e) => ({
      id: e.curs.id,
      titlu: e.curs.titlu,
      descriere: e.curs.descriere ?? "",
      icon: e.curs.icon,
      pct: e.progresPct,
      finalizate: e.lectiiFinal,
      total: e.curs.lectii.length,
      lectii: e.curs.lectii.map((l) => l.titlu),
    }));

    return {
      angajat: { nume: `${angajat.prenume} ${angajat.nume}`, functie: angajat.functie },
      cursuri: cursuri.length ? cursuri : FALLBACK.cursuri,
    };
  } catch {
    return FALLBACK;
  }
}

const iconFor = (icon: string) => {
  if (icon === "settings") return <Settings size={22} />;
  if (icon === "alert") return <AlertTriangle size={22} />;
  return <ShieldCheck size={22} />;
};

const cardColor = (icon: string) => {
  if (icon === "settings") return "bg-emerald-50 text-emerald-600";
  if (icon === "alert") return "bg-amber-50 text-amber-600";
  return "bg-blue-50 text-blue-600";
};

const barColor = (icon: string) => {
  if (icon === "settings") return "bg-emerald-500";
  if (icon === "alert") return "bg-amber-500";
  return "bg-blue-600";
};

export default async function CursurilePage() {
  const data = await getData();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        variant="angajat"
        activeHref="/dashboard/cursuri"
        userName={data.angajat.nume}
        userRole={data.angajat.functie}
      />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Cursurile mele</h1>
        <p className="mb-6 text-sm text-slate-500">
          Toate modulele de instruire la care ești înscris, cu progresul detaliat pe lecții.
        </p>

        <div className="flex flex-col gap-5">
          {data.cursuri.map((c) => (
            <div key={c.titlu} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cardColor(c.icon)}`}>
                    {iconFor(c.icon)}
                  </div>
                  <div>
                    <h2 className="text-base font-medium text-slate-900">{c.titlu}</h2>
                    <p className="mt-1 text-sm text-slate-500">{c.descriere}</p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/cursuri/${c.id}`}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                  {c.pct > 0 ? "Continuă" : "Începe"} <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar pct={c.pct} color={barColor(c.icon)} />
                </div>
                <span className="text-xs text-slate-500">{c.pct}% · {c.finalizate}/{c.total} lecții</span>
              </div>

              <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
                {c.lectii.map((l, i) => (
                  <li key={l} className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        i < c.finalizate ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {i < c.finalizate ? "✓" : i + 1}
                    </span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}