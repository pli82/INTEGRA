"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { salveazaTestIntermediar, type TestIntermediarState } from "@/app/admin/testare/actions";

const initialState: TestIntermediarState = {};

type TestIntermediar = {
  titlu: string;
  nrIntrebari: number;
  totalRezultate: number;
} | null;

export function TestIntermediarForm({
  cursId,
  testIntermediar,
  totalIntrebariCurs,
}: {
  cursId: string;
  testIntermediar: TestIntermediar;
  totalIntrebariCurs: number;
}) {
  const [state, formAction, pending] = useActionState(salveazaTestIntermediar, initialState);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h2 className="text-base font-medium text-slate-900">Test intermediar</h2>
        <p className="text-xs text-slate-400">
          Se deblocheaza dupa vizionarea materialului video. Banca de intrebari a acestui curs are {totalIntrebariCurs} intrebari.
        </p>
      </div>

      {totalIntrebariCurs === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Adauga intrebari mai sus inainte de a configura testul intermediar.
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="cursId" value={cursId} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Titlu test</label>
              <input
                name="titlu"
                defaultValue={testIntermediar?.titlu ?? "Test intermediar"}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Numar de intrebari afisate</label>
              <input
                name="nrIntrebari"
                type="number"
                min={1}
                max={totalIntrebariCurs}
                defaultValue={testIntermediar?.nrIntrebari ?? Math.min(30, totalIntrebariCurs)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>
          {state?.error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
          )}
          {state?.success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Salvat cu succes.</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-1.5 self-start rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            <Save size={14} /> {pending ? "Se salveaza..." : "Salveaza"}
          </button>
        </form>
      )}
    </div>
  );
}