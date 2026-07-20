"use client";

import { useRef, useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { incarcaFotoProfil } from "@/app/dashboard/actions";

export function AvatarUpload({
  nume,
  fotoUrl,
  size = "sm",
}: {
  nume: string;
  fotoUrl?: string | null;
  size?: "sm" | "lg";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(fotoUrl ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dims = size === "lg" ? "h-16 w-16 text-lg" : "h-8 w-8 text-xs";

  const initials = nume
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const handleFile = (file: File | null) => {
    if (!file) return;
    setError(null);

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const formData = new FormData();
    formData.set("foto", file);

    startTransition(async () => {
      const res = await incarcaFotoProfil(formData);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Schimbă poza de profil"
        className={`group relative flex ${dims} items-center justify-center overflow-hidden rounded-full bg-white/10 font-medium text-white`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={nume} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera size={size === "lg" ? 20 : 14} className="text-white" />
        </span>
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] text-white">
            ...
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {error && <p className="absolute top-full mt-1 w-32 text-[10px] text-red-300">{error}</p>}
    </div>
  );
}