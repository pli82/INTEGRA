"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type CursNouState = { error?: string };

export async function creeazaCurs(
  _prev: CursNouState,
  formData: FormData
): Promise<CursNouState> {
  const titlu = (formData.get("titlu") as string || "").trim();
  const descriere = (formData.get("descriere") as string || "").trim();
  const icon = (formData.get("icon") as string || "shield");

  if (!titlu) return { error: "Titlul cursului este obligatoriu." };

  const lectiiRaw: string[] = [];
  let i = 0;
  while (formData.get(`lectie_${i}`) !== null) {
    const l = (formData.get(`lectie_${i}`) as string || "").trim();
    if (l) lectiiRaw.push(l);
    i++;
  }
  if (lectiiRaw.length === 0) return { error: "Adaugă cel puțin o lecție." };

  const intrebari: { enunt: string; optiuni: { text: string; corecta: boolean }[] }[] = [];
  let q = 0;
  while (formData.get(`intrebare_${q}`) !== null) {
    const enunt = (formData.get(`intrebare_${q}`) as string || "").trim();
    if (!enunt) { q++; continue; }
    const optiuni = [0, 1, 2, 3].map((j) => ({
      text: (formData.get(`optiune_${q}_${j}`) as string || "").trim(),
      corecta: formData.get(`corecta_${q}`) === String(j),
    })).filter((o) => o.text);
    if (optiuni.length >= 2) intrebari.push({ enunt, optiuni });
    q++;
  }

  const maxOrdine = await prisma.curs.count();

  const curs = await prisma.curs.create({
    data: {
      titlu,
      descriere: descriere || null,
      icon,
      ordine: maxOrdine + 1,
      lectii: {
        create: [
          ...lectiiRaw.map((titluLectie, idx) => ({
            titlu: titluLectie,
            ordine: idx + 1,
            durataMin: 10,
          })),
          { titlu: "Test intermediar", ordine: lectiiRaw.length + 1, durataMin: 10 },
        ],
      },
    },
  });

  for (let qi = 0; qi < intrebari.length; qi++) {
    await prisma.intrebare.create({
      data: {
        cursId: curs.id,
        enunt: intrebari[qi].enunt,
        ordine: qi + 1,
        optiuni: { create: intrebari[qi].optiuni },
      },
    });
  }

  const angajati = await prisma.angajat.findMany({ where: { role: "ANGAJAT" } });
  for (const angajat of angajati) {
    await prisma.enrollment.create({
      data: { angajatId: angajat.id, cursId: curs.id },
    });
  }

  redirect(`/admin/cursuri/${curs.id}`);
}