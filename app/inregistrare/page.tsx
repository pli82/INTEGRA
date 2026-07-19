import { Vote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RegistrationForm } from "@/components/RegistrationForm";

const FALLBACK_COMPARTIMENTE = [
  "Direcția juridică",
  "Direcția economică",
  "Serviciul IT",
  "Cabinet președinte",
  "DGRU",
  "Direcția de management al calității",
];

async function getCompartimente() {
  try {
    const structuri = await prisma.structura.findMany({ orderBy: { nume: "asc" } });
    return structuri.length ? structuri.map((s) => s.nume) : FALLBACK_COMPARTIMENTE;
  } catch {
    return FALLBACK_COMPARTIMENTE;
  }
}

export default async function InregistrarePage() {
  const compartimente = await getCompartimente();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <Vote size={28} className="text-blue-900" />
          <div className="leading-tight">
            <div className="text-sm font-medium text-slate-900">AEP</div>
            <div className="text-xs text-slate-500">SMAM Instruire</div>
          </div>
        </div>

        <h1 className="mb-1 text-xl font-medium text-slate-900">Înregistrare angajat</h1>
        <p className="mb-6 text-sm text-slate-500">
          Completează datele de mai jos pentru a avea acces la platforma de instruire anti-mită.
        </p>

        <RegistrationForm compartimente={compartimente} />
      </div>
    </div>
  );
}
