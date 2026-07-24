"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/auth/actions";
import { revalidatePath } from "next/cache";
import { recalculeazaProgres } from "@/app/dashboard/actions";

const PRAG_PROMOVARE = 10;

export type IntrebareDetaliu = {
  enunt: string;
  raspunsAles: string;
  raspunsCorect: string;
  corect: boolean;
};

export type FinalizeazaTestFinalInput = {
  testFinalId: string;
  scor: number;
  dinTotal: number;
  semnatura: string;
  raspunsuriDetaliu: IntrebareDetaliu[];
};

export type FinalizeazaTestFinalResult = { error?: string; success?: boolean };

export async function finalizeazaTestFinal(
  input: FinalizeazaTestFinalInput
): Promise<FinalizeazaTestFinalResult> {
  const angajat = await getSession();
  if (!angajat) return { error: "Sesiune expirata. Te rugam sa te autentifici din nou." };
  if (!input.semnatura) return { error: "Semnatura este obligatorie." };

  const testFinal = await prisma.testFinal.findUnique({ where: { id: input.testFinalId } });
  if (!testFinal || !testFinal.activ) return { error: "Acest test final nu mai este activ." };

  const existent = await prisma.testFinalResult.findUnique({
    where: { testFinalId_angajatId: { testFinalId: input.testFinalId, angajatId: angajat.id } },
  });
  if (existent) return { error: "Ai sustinut deja acest test." };

  const promovat = input.scor >= PRAG_PROMOVARE;

  await prisma.testFinalResult.create({
    data: {
      testFinalId: input.testFinalId,
      angajatId: angajat.id,
      scor: input.scor,
      dinTotal: input.dinTotal,
      promovat,
      semnatura: input.semnatura,
      raspunsuriDetaliu: JSON.stringify(input.raspunsuriDetaliu),
    },
  });

  await recalculeazaProgres(angajat.id, testFinal.cursId);

  revalidatePath("/dashboard/testare");
  revalidatePath(`/dashboard/cursuri/${testFinal.cursId}`);
  revalidatePath(`/dashboard/cursuri/${testFinal.cursId}/test-final`);
  revalidatePath("/admin/testare");
  revalidatePath("/admin");
  return { success: true };
}