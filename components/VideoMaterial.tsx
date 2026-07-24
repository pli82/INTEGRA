"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, CheckCircle2 } from "lucide-react";
import { marcheazaVizualizat } from "@/app/dashboard/actions";

const PRAG_SECUNDE = 20;

function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m ? m[1] : null;
}

export function VideoMaterial({
  url,
  titlu,
  cursId,
  lectieId,
  vizualizatInitial,
}: {
  url: string;
  titlu: string;
  cursId: string;
  lectieId?: string;
  vizualizatInitial: boolean;
}) {
  const [pornit, setPornit] = useState(false);
  const [secunde, setSecunde] = useState(0);
  const [deblocat, setDeblocat] = useState(vizualizatInitial);
  const [salvat, setSalvat] = useState(vizualizatInitial);
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pornit && !deblocat) {
      intervalRef.current = setInterval(() => {
        setSecunde((s) => {
          if (s + 1 >= PRAG_SECUNDE) {
            clearInterval(intervalRef.current!);
            setDeblocat(true);
            marcheazaVizualizat(cursId, lectieId).then(() => {
              setSalvat(true);
              router.refresh();
            });
            return PRAG_SECUNDE;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pornit, deblocat, cursId, lectieId]);

  const ytId = isYouTube(url) ? getYouTubeId(url) : null;

  return (
    <div className="flex flex-col gap-3">
      {!pornit ? (
        <div className="relative flex aspect-video cursor-pointer items-center justify-center rounded-xl bg-slate-900" onClick={() => setPornit(true)}>
          {ytId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={"https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg"} alt={titlu} className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-60" />
          )}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play size={28} className="ml-1 text-blue-700" />
          </div>
          <p className="absolute bottom-3 left-3 text-sm font-medium text-white">{titlu}</p>
        </div>
      ) : ytId ? (
        <iframe
          className="aspect-video w-full rounded-xl"
          src={"https://www.youtube.com/embed/" + ytId + "?autoplay=1"}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : (
        <video className="aspect-video w-full rounded-xl bg-slate-900" src={url} controls autoPlay />
      )}

      {!salvat && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          {!pornit ? (
            <p className="text-sm text-slate-500">Apasa Play pentru a vizualiza materialul si a debloca testul.</p>
          ) : deblocat ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 size={16} /> Ai vizualizat materialul — testul este acum deblocat!
            </div>
          ) : (
            <>
              <div className="relative h-8 w-8 shrink-0">
                <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle cx="16" cy="16" r="14" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={(secunde / PRAG_SECUNDE * 88) + " 88"} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-blue-700">
                  {PRAG_SECUNDE - secunde}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Testul se deblocheaza in <strong>{PRAG_SECUNDE - secunde}s</strong> de vizionare.
              </p>
            </>
          )}
        </div>
      )}

      {salvat && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={16} /> Material vizualizat — testul intermediar este deblocat.
        </div>
      )}
    </div>
  );
}