import { notFound } from "next/navigation";
import Link from "next/link";
import { Video, FileText, Presentation, Trash2, ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import { adaugaMaterial, stergeMaterial } from "@/app/dashboard/actions";

async function getData(cursId: string) {
  try {
    const curs = await prisma.curs.findUnique({ where: { id: cursId }, include: { lectii: { orderBy: { ordine: "asc" } }, materiale: { orderBy: { createdAt: "desc" } }, intrebari: { orderBy: { ordine: "asc" }, include: { optiuni: true } } } });
    if (!curs) return null;
    const totalInscrisi = await prisma.enrollment.count({ where: { cursId } });
    const totalPromovati = await prisma.enrollment.count({ where: { cursId, status: "PROMOVAT" } });
    return { curs, totalInscrisi, totalPromovati };
  } catch (e) {
    console.error("Eroare getData admin curs:", e);
    return null;
  }
}

const iconForTip = (tip: string) => {
  if (tip === "PDF") return <FileText size={16} className="text-red-500" />;
  if (tip === "PPTX") return <Presentation size={16} className="text-orange-500" />;
  return <Video size={16} className="text-blue-500" />;
};

export default async function AdminCursPage({ params }: { params: Promise<{ cursId: string }> }) {
  const { cursId } = await params;
  const data = await getData(cursId);
  if (!data) return notFound();
  const { curs, totalInscrisi, totalPromovati } = data;
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant="admin" activeHref="/admin" />
      <main className="flex-1 p-8">
        <div className="mb-6"><Link href="/admin" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft size={16} /> Inapoi la admin</Link></div>
        <h1 className="mb-1 text-2xl font-medium text-slate-900">{curs.titlu}</h1>
        <p className="mb-6 text-sm text-slate-500">{curs.descriere}</p>
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center"><div className="text-2xl font-medium text-slate-900">{curs.lectii.length}</div><div className="text-xs text-slate-500">Lectii</div></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center"><div className="text-2xl font-medium text-slate-900">{totalInscrisi}</div><div className="text-xs text-slate-500">Inscrisi</div></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center"><div className="text-2xl font-medium text-emerald-600">{totalPromovati}</div><div className="text-xs text-slate-500">Promovati</div></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-base font-medium text-slate-900">Materiale existente</h2>
              {curs.materiale.length === 0 ? <p className="text-sm text-slate-400">Niciun material adaugat inca.</p> : (
                <ul className="flex flex-col gap-2">{curs.materiale.map((m) => (<li key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"><div className="flex items-center gap-3">{iconForTip(m.tip)}<span className="text-sm text-slate-700">{m.titlu}</span></div><form action={stergeMaterial.bind(null, m.id, curs.id)}><button type="submit" className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button></form></li>))}</ul>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-base font-medium text-slate-900">Adauga material nou</h2>
              <form action={adaugaMaterial} className="flex flex-col gap-4">
                <input type="hidden" name="cursId" value={curs.id} />
                <div><label className="mb-1 block text-sm text-slate-600">Tip material</label><select name="tip" defaultValue="VIDEO" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"><option value="VIDEO">Video (link)</option><option value="PDF">PDF</option><option value="PPTX">Prezentare</option></select></div>
                <div><label className="mb-1 block text-sm text-slate-600">Titlu</label><input name="titlu" placeholder="Titlu material" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Link video</label><input name="videoUrl" type="url" placeholder="https://..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700" /></div>
                <div><label className="mb-1 block text-sm text-slate-600">Fisier (PDF/PPTX, max 8MB)</label><input name="fisier" type="file" accept=".pdf,.ppt,.pptx" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700" /></div>
                <button type="submit" className="self-start rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white">Adauga materialul</button>
              </form>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-base font-medium text-slate-900">Intrebari test intermediar <span className="text-sm font-normal text-slate-400">({curs.intrebari.length})</span></h2>
            {curs.intrebari.length === 0 ? <p className="text-sm text-slate-400">Nu exista intrebari.</p> : (
              <ul className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: "600px" }}>{curs.intrebari.map((q, i) => (<li key={q.id} className="rounded-lg border border-slate-100 p-4"><p className="mb-2 text-sm font-medium text-slate-800">{i + 1}. {q.enunt}</p><ul className="flex flex-col gap-1">{q.optiuni.map((o) => (<li key={o.id} className={o.corecta ? "flex items-center gap-2 rounded px-2 py-1 text-xs bg-emerald-50 text-emerald-700" : "flex items-center gap-2 rounded px-2 py-1 text-xs text-slate-500"}>{o.corecta ? "✓" : "·"} {o.text}</li>))}</ul></li>))}</ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}