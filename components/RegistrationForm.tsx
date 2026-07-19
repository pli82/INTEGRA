"use client";

import { useActionState } from "react";
import { inregistreazaAngajat, type RegistrationState } from "@/app/inregistrare/actions";

const initialState: RegistrationState = {};

export function RegistrationForm({ compartimente }: { compartimente: string[] }) {
  const [state, formAction, pending] = useActionState(inregistreazaAngajat, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nume" name="nume" placeholder="ex. Popescu" />
        <Field label="Prenume" name="prenume" placeholder="ex. Andrei" />
      </div>

      <Field label="Funcție" name="functie" placeholder="ex. Consilier" />

      <div>
        <label htmlFor="compartiment" className="mb-1 block text-sm text-slate-600">
          Compartiment
        </label>
        <input
          id="compartiment"
          name="compartiment"
          list="compartimente-lista"
          placeholder="ex. Direcția juridică"
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
        />
        <datalist id="compartimente-lista">
          {compartimente.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <input type="checkbox" name="consimtamant" required className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Sunt de acord cu prelucrarea datelor mele cu caracter personal (nume, prenume, funcție,
          compartiment) de către AEP, în scopul înregistrării și administrării activității de
          instruire anti-mită, conform Regulamentului (UE) 2016/679 (GDPR).
        </span>
      </label>

      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-700 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {pending ? "Se înregistrează…" : "Înregistrează-te"}
      </button>
    </form>
  );
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm text-slate-600">
        {label}
      </label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}
