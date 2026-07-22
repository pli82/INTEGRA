import Link from "next/link";
import { ShieldCheck, Settings, AlertTriangle, Play, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { AvatarUpload } from "@/components/AvatarUpload";
import { NotificationBell, type Notificare } from "@/components/NotificationBell";
import { ProgressBar } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/auth/actions";

const FALLBACK = {
  angajat: { nume: "Andrei Popescu", functie: "Consilier", structura: "Direcția de management al calității", fotoUrl: null as string | null },
  progresGeneral: 68,
  moduleActive: 3,
  termenUrmator: "31 iulie",
  cursuri: [
    { titlu: "Integritate și prevenirea mitei", icon: "shield", pct: 80, finalizate: 4, total: 5 },
    { titlu: "Sistemul de management anti-mită", icon: "settings", pct: 55, finalizate: 3, total: 6 },
    { titlu: "Raportarea incidentelor", icon: "alert", pct: 0, finalizate: 0, total: 4 },
  ],
  urmatoareaTestare: { titlu: "Test final SMAM", data: "24 IUL", durataMin: 15, nrIntrebari: 20 },
  notificari: [
    { mesaj: "Testul Test final SMAM are loc pe 24 IUL", detaliu: "15 min · 20 întrebări", tip: "test" as const },
    { mesaj: "Mai ai 1 lecție până termini Integritate și prevenirea mitei", tip: "curs" as const },
    { mesaj: "Nu ai început încă Raportarea incidentelor", tip: "atentie" as const },
  ],
  activitate: [
    { mesaj: "Ai finalizat lecția Principiile integrității", cand: "ieri, 14:32" },
    { mesaj: "Ai finalizat testul Evaluare intermediară", cand: "20 iul., 11:08" },
  ],
};

async function getData() {
  try {
    const angajat = await getSession();
    if (!angajat) return FALLBACK;

    const angajatCuDate = await prisma.angajat.findUnique({
      where: { id: angajat.id },
      include: {
        structura: true,
        enrollments: { include: { curs: { include: { lectii: true } } } },
      },
    });
    if (!angajatCuDate) return FALLBACK;

    const cursuri = angajatCuDate.enrollments.map((e) => ({
      titlu: e.curs.titlu,
      icon: e.curs.icon,
      pct: e.progresPct,
      finalizate: e.lectiiFinal,
      total: e.curs.lectii.length,
    }));

    const activitate = await prisma.activitateLog.findMany({
      where: { angajatId: angajatCuDate.id },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    const progresGeneral =
      cursuri.length > 0
        ? Math.round(cursuri.reduce((s, c) => s + c.pct, 0) / cursuri.length)
        : 0;

    const notificari: Notificare[] = [];
    notificari.push({
      mesaj: "Testul " + FALLBACK.urmatoareaTestare.titlu + " are loc pe " + FALLBACK.urmatoareaTestare.data,
      detaliu: FALLBACK.urmatoareaTestare.durataMin + " min · " + FALLBACK.urmatoareaTestare.nrIntrebari + " întrebări",
      tip: "test",
    });
    for (const c of cursuri) {
      const ramase = c.total - c.finalizate;
      if (c.pct === 0) {
        notificari.push({ mesaj: "Nu ai început încă " + c.titlu, tip: "atentie" });
      } else if (c.pct < 100 && ramase > 0) {
        notificari.push({ mesaj: "Mai ai " + ramase + (ramase === 1 ? " lecție" : " lecții") + " până termini " + c.titlu, tip: "curs" });
      }
    }

    return {
      angajat: { nume: angajatCuDate.prenume + " " + angajatCuDate.nume, functie: angajatCuDate.functie, structura: angajatCuDate.structura.nume, fotoUrl: angajatCuDate.fotoUrl },
      progresGeneral,
      moduleActive: cursuri.filter((c) => c.pct > 0 && c.pct < 100).length || FALLBACK.moduleActive,
      termenUrmator: FALLBACK.termenUrmator,
      cursuri: cursuri.length ? cursuri : FALLBACK.cursuri,
      urmatoareaTestare: FALLBACK.urmatoareaTestare,
      notificari: notificari.length ? notificari : FALLBACK.notificari,
      activitate: activitate.length
        ? activitate.map((a) => ({ mesaj: a.mesaj, cand: new Date(a.createdAt).toLocaleDateString("ro-RO") }))
        : FALLBACK.activitate,
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

export default async function DashboardPage() {
  const data = await getData();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        variant="angajat"
        activeHref="/dashboard"
        userName={data.angajat.nume}
        userRole={data.angajat.functie}
        fotoUrl={data.angajat.fotoUrl}
      />

      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-slate-900">Bună, {data.angajat.nume}</h1>
            <div className="mt-2 flex gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                {data.angajat.functie}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                {data.angajat.structura}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell notificari={data.notificari} />
            <AvatarUpload nume={data.angajat.nume} fotoUrl={data.angajat.fotoUrl} />
            <Link href="/dashboard/cursuri" className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              <Play size={15} /> Continuă cursul
            </Link>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-br from-[#101c58] to-[#1b2e8f] p-8 text-white">
          <div>
            <h2 className="text-xl font-medium">Parcursul tău de instruire</h2>
            <p className="mt-1 text-sm text-white/70">
              {data.moduleActive} module active · termen următor: {data.termenUrmator}
            </p>
            <Link href="/dashboard/progres" className="mt-5 flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900">
              Vezi progresul <ChevronRight size={15} />
            </Link>
          </div>
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-white/20">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(#7DD3FC " + (data.progresGeneral * 3.6) + "deg, transparent 0deg)",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))",
              }}
            />
            <div className="text-center">
              <div className="text-2xl font-medium">{data.progresGeneral}%</div>
              <div className="text-[10px] text-white/70">progres general</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-medium text-slate-900">Cursurile mele</h3>
              <Link href="/dashboard/cursuri" className="text-sm text-blue-700">Vezi toate ›</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {data.cursuri.map((c) => (
                <div key={c.titlu} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
                  <div className={"mb-4 flex h-11 w-11 items-center justify-center rounded-lg " + cardColor(c.icon)}>
                    {iconFor(c.icon)}
                  </div>
                  <div className="mb-4 text-sm font-medium leading-snug text-slate-900">{c.titlu}</div>
                  <div className="mb-1">
                    <ProgressBar pct={c.pct} color={barColor(c.icon)} />
                  </div>
                  <div className="mb-4 mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{c.pct}%</span>
                    <span>{c.finalizate} / {c.total} lecții</span>
                  </div>
                  {c.pct > 0 ? (
                    <Link href="/dashboard/cursuri" className="mt-auto flex items-center justify-center gap-1 rounded-lg bg-blue-700 py-2 text-sm font-medium text-white">
                      Continuă <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <Link href="/dashboard/cursuri" className="mt-auto rounded-lg border border-slate-200 py-2 text-center text-sm font-medium text-slate-700">
                      Începe acum
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-base font-medium text-slate-900">Următoarea testare</h3>
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <div className="rounded-md bg-white px-2 py-1 text-center text-xs font-medium text-slate-700 shadow-sm">
                  {data.urmatoareaTestare.data.split(" ")[0]}
                  <div className="text-[10px] text-slate-400">{data.urmatoareaTestare.data.split(" ")[1]}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{data.urmatoareaTestare.titlu}</div>
                  <div className="text-xs text-slate-500">
                    {data.urmatoareaTestare.durataMin} min · {data.urmatoareaTestare.nrIntrebari} întrebări
                  </div>
                </div>
              </div>
              <Link href="/dashboard/testare" className="mt-3 block w-full rounded-lg border border-slate-200 py-2 text-center text-sm font-medium text-slate-700">
                Începe testul ›
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-base font-medium text-slate-900">Activitate recentă</h3>
              <ul className="flex flex-col gap-3">
                {data.activitate.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
                    <div>
                      <div className="text-slate-700">{a.mesaj}</div>
                      <div className="text-xs text-slate-400">{a.cand}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/progres" className="mt-3 inline-block text-sm text-blue-700">
                Vezi toată activitatea ›
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}