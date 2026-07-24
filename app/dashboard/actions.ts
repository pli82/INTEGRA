"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/auth/actions";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_MATERIAL_BYTES = 3 * 1024 * 1024;

export async function incarcaFotoProfil(formData: FormData) {
  const file = formData.get("foto") as File | null;
  if (!file || file.size === 0) return { error: "Nu ai selectat nicio imagine." };
  if (file.size > MAX_BYTES) return { error: "Imaginea e prea mare (maxim 2MB)." };
  if (!file.type.startsWith("image/")) return { error: "Fisierul trebuie sa fie o imagine." };
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;
  const angajat = await prisma.angajat.findFirst({ where: { role: "ANGAJAT" } });
  if (!angajat) return { error: "Nu am gasit angajatul." };
  await prisma.angajat.update({ where: { id: angajat.id }, data: { fotoUrl: dataUrl } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cursuri");
  revalidatePath("/dashboard/progres");
  revalidatePath("/dashboard/testare");
  revalidatePath("/dashboard/resurse");
  return { success: true };
}

export async function adaugaMaterial(formData: FormData): Promise<void> {
  const cursId = formData.get("cursId") as string;
  const lectieIdRaw = (formData.get("lectieId") as string || "").trim();
  const lectieId = lectieIdRaw || null;
  const tip = formData.get("tip") as "VIDEO" | "PDF" | "PPTX";
  const titlu = (formData.get("titlu") as string || "").trim();
  const videoUrl = (formData.get("videoUrl") as string || "").trim();
  const file = formData.get("fisier") as File | null;
  if (!cursId || !tip || !titlu) return;
  let url: string;
  if (tip === "VIDEO") {
    if (!videoUrl) return;
    url = videoUrl;
  } else {
    if (!file || file.size === 0) return;
    if (file.size > MAX_MATERIAL_BYTES) return;
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    url = `data:${file.type};base64,${base64}`;
  }
  await prisma.material.create({ data: { cursId, lectieId, tip, titlu, url } });
  revalidatePath(`/dashboard/cursuri/${cursId}`);
  revalidatePath(`/admin/cursuri/${cursId}`);
}

export async function adaugaMaterialCuUrl(input: {
  cursId: string;
  lectieId: string | null;
  tip: "VIDEO" | "PDF" | "PPTX";
  titlu: string;
  url: string;
}): Promise<{ error?: string; success?: boolean }> {
  if (!input.cursId || !input.tip || !input.titlu || !input.url) {
    return { error: "Toate campurile sunt obligatorii." };
  }
  await prisma.material.create({
    data: { cursId: input.cursId, lectieId: input.lectieId, tip: input.tip, titlu: input.titlu, url: input.url },
  });
  revalidatePath(`/dashboard/cursuri/${input.cursId}`);
  revalidatePath(`/admin/cursuri/${input.cursId}`);
  return { success: true };
}

export async function stergeMaterial(materialId: string, cursId: string): Promise<void> {
  await prisma.material.delete({ where: { id: materialId } });
  revalidatePath(`/dashboard/cursuri/${cursId}`);
  revalidatePath(`/admin/cursuri/${cursId}`);
}

export async function recalculeazaProgres(angajatId: string, cursId: string): Promise<void> {
  const curs = await prisma.curs.findUnique({ where: { id: cursId }, include: { lectii: true } });
  if (!curs) return;
  const testFinal = await prisma.testFinal.findUnique({ where: { cursId } });

  const capitoleReale = curs.lectii.filter((l) => l.titlu !== "Test intermediar");
  const totalCapitole = capitoleReale.length;

  const progrese = totalCapitole > 0
    ? await prisma.lectieProgres.count({
        where: { angajatId, lectieId: { in: capitoleReale.map((l) => l.id) }, vizualizat: true },
      })
    : 0;

  const progresPct = totalCapitole > 0 ? Math.round((progrese / totalCapitole) * 100) : 0;

  let status: "NEINCEPUT" | "IN_CURS" | "PROMOVAT" | "RESPINS" = "NEINCEPUT";
  if (progrese > 0) status = "IN_CURS";
  if (totalCapitole > 0 && progrese === totalCapitole) {
    if (testFinal && testFinal.activ) {
      const rezultatFinal = await prisma.testFinalResult.findUnique({
        where: { testFinalId_angajatId: { testFinalId: testFinal.id, angajatId } },
      });
      status = rezultatFinal ? (rezultatFinal.promovat ? "PROMOVAT" : "RESPINS") : "IN_CURS";
    } else {
      status = "PROMOVAT";
    }
  }

  await prisma.enrollment.upsert({
    where: { angajatId_cursId: { angajatId, cursId } },
    create: { angajatId, cursId, progresPct, lectiiFinal: progrese, status, vizualizat: progrese > 0 },
    update: { progresPct, lectiiFinal: progrese, status },
  });

  revalidatePath(`/dashboard/cursuri/${cursId}`);
  revalidatePath("/dashboard/cursuri");
  revalidatePath("/dashboard/progres");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/testare");
  revalidatePath("/admin");
  revalidatePath("/admin/progres");
}

export async function marcheazaVizualizat(cursId: string, lectieId?: string): Promise<void> {
  const angajat = await getSession();
  if (!angajat) return;
  await prisma.enrollment.upsert({
    where: { angajatId_cursId: { angajatId: angajat.id, cursId } },
    create: { angajatId: angajat.id, cursId, vizualizat: true },
    update: { vizualizat: true },
  });
  if (lectieId) {
    await prisma.lectieProgres.upsert({
      where: { angajatId_lectieId: { angajatId: angajat.id, lectieId } },
      create: { angajatId: angajat.id, lectieId, vizualizat: true, vizualizatLa: new Date() },
      update: { vizualizat: true, vizualizatLa: new Date() },
    });
    await recalculeazaProgres(angajat.id, cursId);
  }
  revalidatePath(`/dashboard/cursuri/${cursId}`);
  revalidatePath("/dashboard/testare");
}

export async function marcheazaCapitolVizualizat(cursId: string, lectieId: string): Promise<void> {
  const angajat = await getSession();
  if (!angajat) return;
  await prisma.lectieProgres.upsert({
    where: { angajatId_lectieId: { angajatId: angajat.id, lectieId } },
    create: { angajatId: angajat.id, lectieId, vizualizat: true, vizualizatLa: new Date() },
    update: { vizualizat: true, vizualizatLa: new Date() },
  });
  await recalculeazaProgres(angajat.id, cursId);
}