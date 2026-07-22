import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { CursNouForm } from "./CursNouForm";

export default function AdminCursNouPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant="admin" activeHref="/admin" />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft size={16} /> Inapoi la admin
          </Link>
        </div>
        <h1 className="mb-1 text-2xl font-medium text-slate-900">Curs nou</h1>
        <p className="mb-8 text-sm text-slate-500">
          Completeaza informatiile, lectiile si intrebarile pentru noul curs de instruire.
        </p>
        <div className="max-w-2xl">
          <CursNouForm />
        </div>
      </main>
    </div>
  );
}