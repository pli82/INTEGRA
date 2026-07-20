"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import clsx from "clsx";

type Optiune = { id: string; text: string; corecta: boolean };
type Intrebare = { id: string; enunt: string; optiuni: Optiune[] };

export function QuizIntermediar({ cursId, intrebari }: { cursId: string; intrebari: Intrebare[] }) {
  const [index, setIndex] = useState(0);
  const [selectat, setSelectat] = useState<string | null>(null);
  const [scor, setScor] = useState(0);
  const [terminat, setTerminat] = useState(false);

  const intrebare = intrebari[index];
  const ultima = index === intrebari.length - 1;

  const alegeOptiune = (optiune: Optiune) => {
    if (selectat) return;
    setSelectat(optiune.id);
    if (optiune.corecta) setScor((s) => s + 1);
  };

  const urmatoarea = () => {
    if (ultima) {
      setTerminat(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelectat(null);
  };

  if (intrebari.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Nu există încă întrebări pentru acest test.
      </div>
    );
  }

  if (terminat) {
    const procent = Math.round((scor / intrebari.length) * 100);
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="mb-2 text-xl font-medium text-slate-900">Test finalizat</h2>
        <p className="mb-6 text-sm text-slate-500">Ai răspuns corect la {scor} din {intrebari.length} întrebări.</p>
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-8 border-blue-100 text-2xl font-medium text-blue-700">
          {procent}%
        </div>
        <Link
          href={`/dashboard/cursuri/${cursId}`}
          className="inline-block rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Înapoi la curs
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
        <span>Întrebarea {index + 1} din {intrebari.length}</span>
        <span>Scor curent: {scor}</span>
      </div>

      <h2 className="mb-5 text-base font-medium text-slate-900">{intrebare.enunt}</h2>

      <div className="flex flex-col gap-2.5">
        {intrebare.optiuni.map((o) => {
          const esteSelectata = selectat === o.id;
          const esteCorecta = o.corecta;
          const araraCaCorecta = selectat !== null && esteCorecta;
          const araraCaGresita = selectat !== null && esteSelectata && !esteCorecta;

          return (
            <button
              key={o.id}
              type="button"
              onClick={() => alegeOptiune(o)}
              disabled={selectat !== null}
              className={clsx(
                "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                !selectat && "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50",
                araraCaCorecta && "border-emerald-300 bg-emerald-50 text-emerald-700",
                araraCaGresita && "border-red-300 bg-red-50 text-red-700",
                selectat && !araraCaCorecta && !araraCaGresita && "border-slate-100 text-slate-400"
              )}
            >
              <span>{o.text}</span>
              {araraCaCorecta && <Check size={18} className="shrink-0 text-emerald-600" />}
              {araraCaGresita && <X size={18} className="shrink-0 text-red-600" />}
            </button>
          );
        })}
      </div>

      {selectat && (
        <button
          type="button"
          onClick={urmatoarea}
          className="mt-6 rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          {ultima ? "Vezi rezultatul final" : "Următoarea întrebare"}
        </button>
      )}
    </div>
  );
}