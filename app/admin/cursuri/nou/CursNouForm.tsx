"use client";

import { useState, useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { creeazaCurs, type CursNouState } from "./actions";

const initialState: CursNouState = {};

const ICOANE = [
  { value: "shield", label: "Scut (Integritate)" },
  { value: "settings", label: "Roata (Management)" },
  { value: "alert", label: "Avertisment (Raportare)" },
  { value: "book", label: "Carte (General)" },
];

export function CursNouForm() {
  const [state, formAction, pending] = useActionState(creeazaCurs, initialState);
  const [lectii, setLectii] = useState<string[]>(["", "", ""]);
  const [intrebari, setIntrebari] = useState([
    { enunt: "", optiuni: ["", "", "", ""], corecta: 0 },
  ]);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-medium text-slate-900">Informatii generale</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Titlu curs *</label>
            <input name="titlu" required placeholder="ex. Etica in functia publica" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Descriere</label>
            <textarea name="descriere" rows={3} placeholder="Descriere scurta a cursului..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Iconita</label>
            <select name="icon" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              {ICOANE.map((ic) => (<option key={ic.value} value={ic.value}>{ic.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-slate-900">Lectii</h2>
            <p className="text-xs text-slate-400">Lectia &quot;Test intermediar&quot; se adauga automat la final.</p>
          </div>
          <button type="button" onClick={() => setLectii([...lectii, ""])} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
            <Plus size={13} /> Adauga lectie
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {lectii.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-center text-xs text-slate-400">{i + 1}</span>
              <input
                name={`lectie_${i}`}
                value={l}
                onChange={(e) => { const nou = [...lectii]; nou[i] = e.target.value; setLectii(nou); }}
                placeholder={`Titlu lectie ${i + 1}`}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              />
              {lectii.length > 1 && (
                <button type="button" onClick={() => setLectii(lectii.filter((_, j) => j !== i))} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-6 text-center text-xs text-slate-400">{lectii.length + 1}</span>
            <div className="flex-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-400">Test intermediar (automat)</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-slate-900">Intrebari test intermediar</h2>
            <p className="text-xs text-slate-400">Recomandat: 10 intrebari, cate 4 variante fiecare.</p>
          </div>
          <button type="button" onClick={() => setIntrebari([...intrebari, { enunt: "", optiuni: ["", "", "", ""], corecta: 0 }])} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
            <Plus size={13} /> Adauga intrebare
          </button>
        </div>
        <div className="flex flex-col gap-6">
          {intrebari.map((q, qi) => (
            <div key={qi} className="rounded-lg border border-slate-100 p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-500">Intrebarea {qi + 1}</label>
                  <input
                    name={`intrebare_${qi}`}
                    value={q.enunt}
                    onChange={(e) => { const nou = [...intrebari]; nou[qi].enunt = e.target.value; setIntrebari(nou); }}
                    placeholder="Enuntul intrebarii..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                {intrebari.length > 1 && (
                  <button type="button" onClick={() => setIntrebari(intrebari.filter((_, j) => j !== qi))} className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {q.optiuni.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`corecta_${qi}`}
                      value={oi}
                      checked={q.corecta === oi}
                      onChange={() => { const nou = [...intrebari]; nou[qi].corecta = oi; setIntrebari(nou); }}
                      className="shrink-0 accent-emerald-600"
                    />
                    <input
                      name={`optiune_${qi}_${oi}`}
                      value={opt}
                      onChange={(e) => { const nou = [...intrebari]; nou[qi].optiuni[oi] = e.target.value; setIntrebari(nou); }}
                      placeholder={`Varianta ${String.fromCharCode(65 + oi)}`}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-sm placeholder:text-slate-400 ${q.corecta === oi ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-900"}`}
                    />
                  </div>
                ))}
                <p className="text-[10px] text-slate-400">Selecteaza butonul radio din stanga variantei corecte.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60">
          {pending ? "Se salveaza..." : "Creeaza cursul"}
        </button>
        <a href="/admin" className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Anuleaza</a>
      </div>
    </form>
  );
}