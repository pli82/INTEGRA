"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type TestIntermediarState = { error?: string; success?: boolean };

export async function salveazaTestIntermediar(
  _prev: TestIntermediarState,
  formData: FormData
): Promise<TestIntermediarState> {
  const cursId = (formData.get("cursId") as string || "").trim();
  const titlu = (formData.get("titlu") as string || "").trim();
  const nrIntrebari = parseInt(formData.get("nrIntrebari") as string || "30", 10);

  if (!cursId) return { error: "Curs invalid." };
  if (!titlu) return { error: "Titlul testului este obligatoriu." };
  if (!nrIntrebari || nrIntrebari < 1) return { error: "Numarul de intrebari trebuie sa fie cel putin 1." };

  await prisma.test.upsert({
    where: { cursId },
    create: { cursId, titlu, nrIntrebari },
    update: { titlu, nrIntrebari },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/testare");
  revalidatePath("/admin/cursuri");
  revalidatePath(`/admin/cursuri/${cursId}`);
  revalidatePath(`/dashboard/cursuri/${cursId}`);
  revalidatePath(`/dashboard/cursuri/${cursId}/test-intermediar`);
  return { success: true };
}

export type TestFinalState = { error?: string; success?: boolean };

export async function salveazaTestFinal(
  _prev: TestFinalState,
  formData: FormData
): Promise<TestFinalState> {
  const cursId = (formData.get("cursId") as string || "").trim();
  const titlu = (formData.get("titlu") as string || "").trim();
  const nrIntrebari = parseInt(formData.get("nrIntrebari") as string || "10", 10);
  const dataLimitaRaw = (formData.get("dataLimita") as string || "").trim();
  const dataLimita = dataLimitaRaw ? new Date(dataLimitaRaw) : null;

  if (!cursId) return { error: "Curs invalid." };
  if (!titlu) return { error: "Titlul testului este obligatoriu." };
  if (!nrIntrebari || nrIntrebari < 1) return { error: "Numarul de intrebari trebuie sa fie cel putin 1." };

  const totalIntrebariCurs = await prisma.intrebare.count({ where: { cursId } });
  if (totalIntrebariCurs === 0) {
    return { error: "Acest curs nu are inca intrebari in testul intermediar. Adauga intrebari acolo inainte de a configura testul final." };
  }

  await prisma.testFinal.upsert({
    where: { cursId },
    create: { cursId, titlu, nrIntrebari, dataLimita },
    update: { titlu, nrIntrebari, dataLimita },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/testare");
  revalidatePath("/admin/cursuri");
  revalidatePath(`/admin/cursuri/${cursId}`);
  revalidatePath("/dashboard/testare");
  return { success: true };
}

export async function comutaActivTestFinal(id: string, activ: boolean): Promise<void> {
  const tf = await prisma.testFinal.update({ where: { id }, data: { activ: !activ } });
  revalidatePath("/admin");
  revalidatePath("/admin/testare");
  revalidatePath("/admin/cursuri");
  revalidatePath(`/admin/cursuri/${tf.cursId}`);
  revalidatePath("/dashboard/testare");
}

export async function stergeTestFinal(id: string): Promise<void> {
  const tf = await prisma.testFinal.findUnique({ where: { id } });
  await prisma.testFinalResult.deleteMany({ where: { testFinalId: id } });
  await prisma.testFinal.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/testare");
  revalidatePath("/admin/cursuri");
  if (tf) revalidatePath(`/admin/cursuri/${tf.cursId}`);
  revalidatePath("/dashboard/testare");
}