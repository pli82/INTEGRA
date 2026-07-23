"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type TestFinalState = { error?: string; success?: boolean };

export async function salveazaTestFinal(
  _prev: TestFinalState,
  formData: FormData
): Promise<TestFinalState> {
  const id = (formData.get("id") as string || "").trim();
  const titlu = (formData.get("titlu") as string || "").trim();
  const nrIntrebari = parseInt(formData.get("nrIntrebari") as string || "20", 10);
  const dataLimitaRaw = (formData.get("dataLimita") as string || "").trim();
  const dataLimita = dataLimitaRaw ? new Date(dataLimitaRaw) : null;

  if (!titlu) return { error: "Titlul testului este obligatoriu." };
  if (!nrIntrebari || nrIntrebari < 1) return { error: "Numarul de intrebari trebuie sa fie cel putin 1." };

  if (id) {
    await prisma.testFinal.update({ where: { id }, data: { titlu, nrIntrebari, dataLimita } });
  } else {
    await prisma.testFinal.create({ data: { titlu, nrIntrebari, dataLimita } });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/testare");
  revalidatePath("/dashboard/testare");
  return { success: true };
}

export async function comutaActivTestFinal(id: string, activ: boolean): Promise<void> {
  await prisma.testFinal.update({ where: { id }, data: { activ: !activ } });
  revalidatePath("/admin");
  revalidatePath("/admin/testare");
  revalidatePath("/dashboard/testare");
}