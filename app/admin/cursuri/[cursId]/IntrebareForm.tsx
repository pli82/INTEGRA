"use client";

import { useState, useEffect, useActionState } from "react";
import { Plus } from "lucide-react";
import { adaugaIntrebare, type IntrebareState } from "./actions";

const initialState: IntrebareState = {};

export function IntrebareForm({ cursId }: { cursId: string }) {
  const [state, formAction, pending] = useActionState(adaugaIntrebare, initialState);
  const [enunt, setEnunt] = useState("");
  const [optiuni, setOptiuni] = useState(["", "", "", ""]);
  const [corecta, setCorecta] = useState(0);

  useEffect(() => {
    if (!state?.error) {
      setEnunt("");
      setOptiuni(["", "", "", ""]);
      setCorecta(0);
    }
  }, [state]);

  return (
    <form action={formAction} className="rounded-lg border border-dashed border-slate-300 p-4">
      <input type="hidden" name="cursId" value={cursId} />
      <label className="mb-1 block text-xs text-slate-500">Intrebare noua</label>
      <input
        name="enunt"
        value={enunt}
        onChange={(e) => setEnunt(e.target.value)}
        placeholder="Enuntul intrebarii..."
        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
      />
      <div className="flex flex-col gap-2">
        {optiuni.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="corecta"
              value={i}
              checked={corecta === i}
              onChange={() => setCorecta(i)}
              className="shrink-0 accent-emerald-600"
            />
            <input
              name={`optiune_${i}`}
              value={opt}
              onChange={(e) => {
                const nou = [...optiuni];
                nou[i] = e.target.value;
                setOptiuni(nou);
              }}
              placeholder={`Varianta ${String.fromCharCode(65 + i)}`}
              className={`flex-1 rounded-lg border px-3 py-1.5 text-sm placeholder:text-slate-400 ${
                corecta === i ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-900"
              }`}
            />
          </div>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-slate-400">Selecteaza butonul radio din stanga variantei corecte.</p>
      {state?.error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 flex items-center gap-1 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
      >
        <Plus size={13} /> {pending ? "Se salveaza..." : "Adauga intrebarea"}
      </button>
    </form>
  );
}