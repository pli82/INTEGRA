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