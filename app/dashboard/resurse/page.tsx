import { FileText, ExternalLink } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

const FALLBACK = { angajat: { nume: "Andrei Popescu", functie: "Consilier" } };

async function getAngajat() {
  try {
    const angajat = await prisma.angajat.findFirst({ where: { role: "ANGAJAT" } });
    if (!angajat) return FALLBACK;
    return { angajat: { nume: `${angajat.prenume} ${angajat.nume}`, functie: angajat.functie } };
  } catch {
    return FALLBACK;
  }
}

const RESURSE = [
  {
    categorie: "Cadru legal",
    documente: [
      { titlu: "Legea nr. 78/2000 pentru prevenirea, descoperirea și sancționarea faptelor de corupție", tip: "PDF" },
      { titlu: "Legea nr. 176/2010 privind integritatea în exercitarea funcțiilor publice", tip: "PDF" },
      { titlu: "Convenția OCDE privind combaterea mituirii funcționarilor publici străini", tip: "PDF" },
    ],
  },
  {
    categorie: "Standarde SMAM",
    documente: [
      { titlu: "ISO 37001:2025 — Sisteme de management anti-mită", tip: "PDF" },
      { titlu: "Politica anti-mită a AEP", tip: "DOCX" },
      { titlu: "Procedura de raportare a incidentelor de integritate", tip: "PDF" },
    ],
  },
  {
    categorie: "Ghiduri practice",
    documente: [
      { titlu: "Ghid privind acceptarea cadourilor și a invitațiilor", tip: "PDF" },
      { titlu: "Studii de caz din administrația publică românească", tip: "PDF" },
    ],
  },
];

export default async function ResursePage() {
  const data = await getAngajat();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        variant="angajat"
        activeHref="/dashboard/resurse"
        userName={data.angajat.nume}
        userRole={data.angajat.functie}
      />
      <main className="flex-1 p-8">
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Resurse</h1>
        <p className="mb-6 text-sm text-slate-500">
          Documente de referință pentru cursurile de instruire anti-mită.
        </p>

        <div className="flex flex-col gap-6">
          {RESURSE.map((grup) => (
            <div key={grup.categorie} className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-base font-medium text-slate-900">{grup.categorie}</h2>
              <ul className="flex flex-col gap-2">
                {grup.documente.map((d) => (
                  <li
                    key={d.titlu}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{d.titlu}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      {d.tip} <ExternalLink size={12} />
                    </span>
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