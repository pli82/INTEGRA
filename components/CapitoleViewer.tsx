"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Presentation, Lock } from "lucide-react";
import { VideoMaterial } from "./VideoMaterial";
import { marcheazaCapitolVizualizat } from "@/app/dashboard/actions";

type MaterialItem = { id: string; tip: "VIDEO" | "PDF" | "PPTX"; titlu: string; url: string };
type Lectie = { id: string; titlu: string; durataMin: number; materiale: MaterialItem[] };

export function CapitoleViewer({
  cursId,
  lectii,
  finalizate,
  vizualizat,
}: {
  cursId: string;
  lectii: Lectie[];
  finalizate: number;
  vizualizat: boolean;
}) {
  const capitoleNormale = lectii.filter((l) => l.titlu !== "Test intermediar");
  const [selectedId, setSelectedId] = useState<string | null>(capitoleNormale[0]?.id ?? null);
  const selected = capitoleNormale.find((l) => l.id === selectedId) ?? null;

  const deschideMaterial = (url: string, lectieId: string) => {
    marcheazaCapitolVizualizat(cursId, lectieId).catch(() => {});
    if (!url.startsWith("data:")) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const [header, base64] = url.split(",");
      const mimeMatch = header.match(/data:([^;]+)/);
      const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
      const byteChars = atob(base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-medium text-slate-900">Capitole</h2>
        <ul className="flex flex-col gap-1">
          {lectii.map((l, i) => {
            const esteTest = l.titlu === "Test intermediar";
            const active = l.id === selectedId;
            if (esteTest) {
              return (
                <li key={l.id}>
                  {vizualizat ? (
                    <Link
                      href={`/dashboard/cursuri/${cursId}/test-intermediar`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-500">
                        {i + 1}
                      </span>
                      {l.titlu}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400">
                      <Lock size={13} className="shrink-0" />
                      {l.titlu}
                    </div>
                  )}
                </li>
              );
            }
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(l.id)}
                  className={
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors " +
                    (active ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50")
                  }
                >
                  <span
                    className={
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium " +
                      (i < finalizate ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500")
                    }
                  >
                    {i < finalizate ? "✓" : i + 1}
                  </span>
                  <span className="flex-1">{l.titlu}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="col-span-2">
        {!selected ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
            Selecteaza un capitol din stanga pentru a vedea materialul.
          </div>
        ) : selected.materiale.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-400">
              <BookOpen size={24} />
            </div>
            <h3 className="text-base font-medium text-slate-900">{selected.titlu}</h3>
            <p className="text-sm text-slate-400">Niciun material disponibil pentru acest capitol inca.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-medium text-slate-900">{selected.titlu}</h3>
            {selected.materiale.map((m) =>
              m.tip === "VIDEO" ? (
                <VideoMaterial key={m.id} url={m.url} titlu={m.titlu} cursId={cursId} lectieId={selected.id} vizualizatInitial={vizualizat} />
              ) : (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => deschideMaterial(m.url, selected.id)}
                  className={
                    "group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl text-left " +
                    (m.tip === "PDF"
                      ? "bg-gradient-to-br from-red-500 to-rose-700"
                      : "bg-gradient-to-br from-orange-500 to-amber-700")
                  }
                >
                  <svg
                    className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-white/15"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M50 4 L90 18 V46 C90 70 72 88 50 96 C28 88 10 70 10 46 V18 Z"
                      fill="currentColor"
                    />
                    <path
                      d="M32 50 L44 62 L70 34"
                      stroke="white"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                  </svg>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-105">
                    {m.tip === "PDF" ? <BookOpen size={28} className="text-red-600" /> : <Presentation size={28} className="text-orange-600" />}
                  </div>
                  <p className="absolute bottom-3 left-3 text-sm font-medium text-white">{m.titlu}</p>
                  <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                    {m.tip === "PDF" ? "Deschide PDF" : "Deschide prezentarea"}
                  </span>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}