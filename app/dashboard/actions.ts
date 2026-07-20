"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

export async function incarcaFotoProfil(formData: FormData) {
  const file = formData.get("foto") as File | null;
  if (!file || file.size === 0) {
    return { error: "Nu ai selectat nicio imagine." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Imaginea e prea mare (maxim 2MB)." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Fișierul trebuie să fie o imagine." };
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  const angajat = await prisma.angajat.findFirst({ where: { role: "ANGAJAT" } });
  if (!angajat) return { error: "Nu am găsit angajatul." };

  await prisma.angajat.update({
    where: { id: angajat.id },
    data: { fotoUrl: dataUrl },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cursuri");
  revalidatePath("/dashboard/progres");
  revalidatePath("/dashboard/testare");
  revalidatePath("/dashboard/resurse");

  return { success: true };
}

const MAX_MATERIAL_BYTES = 8 * 1024 * 1024; // 8MB

export async function adaugaMaterial(formData: FormData) {
  const cursId = formData.get("cursId") as string;
  const tip = formData.get("tip") as "VIDEO" | "PDF" | "PPTX";
  const titlu = (formData.get("titlu") as string || "").trim();
  const videoUrl = (formData.get("videoUrl") as string || "").trim();
  const file = formData.get("fisier") as File | null;

  if (!cursId || !tip || !titlu) {
    return { error: "Completează titlul și tipul materialului." };
  }

  let url: string;

  if (tip === "VIDEO") {
    if (!videoUrl) return { error: "Introdu un link video." };
    url = videoUrl;
  } else {
    if (!file || file.size === 0) return { error: "Selectează un fișier." };
    if (file.size > MAX_MATERIAL_BYTES) return { error: "Fișierul e prea mare (maxim 8MB)." };
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    url = `data:${file.type};base64,${base64}`;
  }

  await prisma.material.create({ data: { cursId, tip, titlu, url } });

  revalidatePath(`/dashboard/cursuri/${cursId}`);
  return { success: true };
}

export async function stergeMaterial(materialId: string, cursId: string) {
  await prisma.material.delete({ where: { id: materialId } });
  revalidatePath(`/dashboard/cursuri/${cursId}`);
}

export async function marcheazaVizualizat(cursId: string) {
  const angajat = await prisma.angajat.findFirst({ where: { role: "ANGAJAT" } });
  if (!angajat) return { error: "Nu am găsit angajatul." };

  await prisma.enrollment.updateMany({
    where: { angajatId: angajat.id, cursId },
    data: { vizualizat: true },
  });

  revalidatePath(`/dashboard/cursuri/${cursId}`);
  revalidatePath("/dashboard/testare");
  return { success: true };
}