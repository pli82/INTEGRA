"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { adaugaMaterialCuUrl } from "@/app/dashboard/actions";

export function AdaugaMaterialForm({
  cursId,
  lectieId,
}: {
  cursId: string;
  lectieId?: string | null;
}) {
  const [tip, setTip] = useState<"VIDEO" | "PDF" | "PPTX">("VIDEO");
  const [titlu, setTitlu] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [seIncarca, setSeIncarca] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const fisierRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEroare(null);
    setSucces(false);

    if (!titlu.trim()) {
      setEroare("Titlul este obligatoriu.");
      return;
    }

    setSeIncarca(true);
    try {
      let url: string;

      if (tip === "VIDEO") {
        if (!videoUrl.trim()) {
          setEroare("Introdu link-ul video.");
          setSeIncarca(false);
          return;
        }
        url = videoUrl.trim();
      } else {
        const file = fisierRef.current?.files?.[0];
        if (!file) {
          setEroare("Selecteaza un fisier.");
          setSeIncarca(false);
          return;
        }
        const rezultat = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        url = rezultat.url;
      }

      const rezultatSalvare = await adaugaMaterialCuUrl({
        cursId,
        lectieId: lectieId ?? null,
        tip,
        titlu: titlu.trim(),
        url,
      });

      if (rezultatSalvare.error) {
        setEroare(rezultatSalvare.error);
      } else {
        setTitlu("");
        setVideoUrl("");
        if (fisierRef.current) fisierRef.current.value = "";
        setSucces(true);
      }
    } catch {
      setEroare("Eroare la incarcarea fisierului. Incearca din nou.");
    } finally {
      setSeIncarca(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <select
          value={tip}
          onChange={(e) => setTip(e.target.value as "VIDEO" | "PDF" | "PPTX")}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
        >
          <option value="VIDEO">Video (link)</option>
          <option value="PDF">PDF</option>
          <option value="PPTX">Prezentare</option>
        </select>
        <input
          value={titlu}
          onChange={(e) => setTitlu(e.target.value)}
          placeholder="Titlu material"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
        />
      </div>

      {tip === "VIDEO" ? (
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          type="url"
          placeholder="Link video (https://...)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
        />
      ) : (
        <input
          ref={fisierRef}
          type="file"
          accept=".pdf,.ppt,.pptx"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
        />
      )}

      {eroare && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{eroare}</p>
      )}
      {succes && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          Material adaugat cu succes.
        </p>
      )}

      <button
        type="submit"
        disabled={seIncarca}
        className="self-start rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {seIncarca ? "Se incarca..." : "Adauga materialul"}
      </button>
    </form>
  );
}