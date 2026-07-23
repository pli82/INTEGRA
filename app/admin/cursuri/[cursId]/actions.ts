"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type IntrebareState = { error?: string };

export async function adaugaIntrebare(
  _prev: IntrebareState,
  formData: FormData
): Promise<IntrebareState> {
  const cursId = formData.get("cursId") as string;
  const enunt = (formData.get("enunt") as string || "").trim();

  if (!cursId) return { error: "Curs invalid." };
  if (!enunt) return { error: "Enuntul intrebarii este obligatoriu." };

  const optiuni = [0, 1, 2, 3]
    .map((i) => ({
      text: (formData.get(`optiune_${i}`) as string || "").trim(),
      corecta: formData.get("corecta") === String(i),
    }))
    .filter((o) => o.text);

  if (optiuni.length < 2) return { error: "Adauga cel putin 2 variante de raspuns." };
  if (!optiuni.some((o) => o.corecta)) return { error: "Selecteaza varianta corecta." };

  const ordine = await prisma.intrebare.count({ where: { cursId } });

  await prisma.intrebare.create({
    data: {
      cursId,
      enunt,
      ordine: ordine + 1,
      optiuni: { create: optiuni },
    },
  });

  revalidatePath(`/admin/cursuri/${cursId}`);
  revalidatePath(`/dashboard/cursuri/${cursId}`);
  return {};
}

export async function stergeIntrebare(intrebareId: string, cursId: string): Promise<void> {
  await prisma.optiune.deleteMany({ where: { intrebareId } });
  await prisma.intrebare.delete({ where: { id: intrebareId } });
  revalidatePath(`/admin/cursuri/${cursId}`);
  revalidatePath(`/dashboard/cursuri/${cursId}`);
}