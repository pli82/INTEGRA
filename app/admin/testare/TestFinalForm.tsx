"use client";

import { useActionState } from "react";
import { Save, Power, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { salveazaTestFinal, comutaActivTestFinal, stergeTestFinal, type TestFinalState } from "@/app/admin/testare/actions";

const initialState: TestFinalState = {};

type TestFinal = {
  id: string;
  titlu: string;
  activ: boolean;
  nrIntrebari: number;
  dataLimita: Date | null;
  totalSustineri: number;
};

export function TestFinalForm({
  cursId,
  testFinal,
  totalIntrebariCurs,
}: {
  cursId: string;
  testFinal: TestFinal | null;
  totalIntrebariCurs: number;
}) {
  const [state, formAction, pending] = useActionState(salveazaTestFinal, initialState);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium text-slate-900">Test final</h2>
          <p className="text-xs text-slate-400">
            Intrebarile se extrag din testul intermediar al acestui curs ({totalIntrebariCurs} disponibile). Sustinut o singura data de fiecare angajat.
          </p>
        </div>
        {testFinal && (
          <div className="flex items-center gap-2">
            <form action={comutaActivTestFinal.bind(null, testFinal.id, testFinal.activ)}>
              <button
                type="submit"
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium ${
                  testFinal.activ
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <Power size={13} /> {testFinal.activ ? "Activ - dezactiveaza" : "Inactiv - activeaza"}
              </button>
            </form>
            <form action={stergeTestFinal.bind(null, testFinal.id)}>
              <ConfirmButton
                mesaj={`Sigur vrei sa stergi definitiv testul final "${testFinal.titlu}"? Se sterg si cele ${testFinal.totalSustineri} rezultate deja inregistrate. Actiunea nu poate fi anulata.`}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={13} />
              </ConfirmButton>
            </form>
          </div>
        )}
      </div>

      {totalIntrebariCurs === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Acest curs nu are inca intrebari in testul intermediar. Adauga intrebari mai sus inainte de a configura testul final.
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="cursId" value={cursId} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Titlu test</label>
              <input
                name="titlu"
                defaultValue={testFinal?.titlu ?? "Test final"}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Numar de intrebari</label>
              <input
                name="nrIntrebari"
                type="number"
                min={1}
                max={totalIntrebariCurs}
                defaultValue={testFinal?.nrIntrebari ?? Math.min(10, totalIntrebariCurs)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Data limita (optional)</label>
            <input
              name="dataLimita"
              type="date"
              defaultValue={testFinal?.dataLimita ? new Date(testFinal.dataLimita).toISOString().slice(0, 10) : ""}
              className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          {state?.error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
          )}
          {state?.success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Salvat cu succes.</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-1.5 self-start rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <Save size={14} /> {pending ? "Se salveaza..." : testFinal ? "Actualizeaza" : "Creeaza testul final"}
            </button>
            {testFinal && (
              <span className="text-xs text-slate-400">{testFinal.totalSustineri} angajati au sustinut testul pana acum.</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
