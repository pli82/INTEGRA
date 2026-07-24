"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adaugaCapitol(formData: FormData): Promise<void> {
  const cursId = (formData.get("cursId") as string || "").trim();
  const titlu = (formData.get("titlu") as string || "").trim();
  const durataMin = parseInt(formData.get("durataMin") as string || "10", 10);
  if (!cursId || !titlu) return;

  const total = await prisma.lectie.count({ where: { cursId } });
  await prisma.lectie.create({
    data: { cursId, titlu, durataMin: durataMin || 10, ordine: total + 1 },
  });

  revalidatePath(`/admin/cursuri/${cursId}`);
  revalidatePath(`/dashboard/cursuri/${cursId}`);
}

export async function stergeCapitol(lectieId: string, cursId: string): Promise<void> {
  await prisma.material.deleteMany({ where: { lectieId } });
  await prisma.lectie.delete({ where: { id: lectieId } });

  revalidatePath(`/admin/cursuri/${cursId}`);
  revalidatePath(`/dashboard/cursuri/${cursId}`);
}