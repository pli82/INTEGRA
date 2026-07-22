"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Vote } from "lucide-react";
import { login, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <Vote size={28} className="text-blue-900" />
          <div>
            <div className="text-sm font-medium text-slate-900">AEP</div>
            <div className="text-xs text-slate-500">SMAM Instruire</div>
          </div>
        </div>

        <h1 className="mb-1 text-xl font-medium text-slate-900">Autentificare</h1>
        <p className="mb-6 text-sm text-slate-500">
          Intră în contul tău pentru a accesa platforma.
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-slate-600">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="prenume.nume@aep.ro"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label htmlFor="parola" className="mb-1 block text-sm text-slate-600">Parolă</label>
            <input
              id="parola"
              name="parola"
              type="password"
              placeholder="••••••"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </div>

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
            {pending ? "Se conectează…" : "Intră în cont"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Nu ai cont?{" "}
          <Link href="/inregistrare" className="text-blue-700 hover:underline">
            Înregistrează-te
          </Link>
        </p>
      </div>
    </div>
  );
}