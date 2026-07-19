"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type RegistrationState = {
  error?: string;
};

export async function inregistreazaAngajat(
  _prevState: RegistrationState,
  formData: FormData
): Promise<RegistrationState> {
  const nume = String(formData.get("nume") || "").trim();
  const prenume = String(formData.get("prenume") || "").trim();
  const functie = String(formData.get("functie") || "").trim();
  const compartiment = String(formData.get("compartiment") || "").trim();
  const consimtamant = formData.get("consimtamant") === "on";

  if (!nume || !prenume || !functie || !compartiment) {
    return { error: "Toate câmpurile sunt obligatorii." };
  }

  if (!consimtamant) {
    return {
      error: "Este necesar acordul privind prelucrarea datelor cu caracter personal pentru a continua înregistrarea.",
    };
  }

  const structura = await prisma.structura.upsert({
    where: { nume: compartiment },
    create: { nume: compartiment },
    update: {},
  });

  const angajat = await prisma.angajat.create({
    data: {
      nume,
      prenume,
      functie,
      structuraId: structura.id,
      consimtamantGDPR: true,
      consimtamantData: new Date(),
    },
  });

  await prisma.activitateLog.create({
    data: {
      angajatId: angajat.id,
      mesaj: "Te-ai înregistrat în platforma de instruire.",
    },
  });

  redirect("/dashboard");
}
