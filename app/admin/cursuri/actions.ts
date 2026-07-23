"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function stergeCurs(cursId: string): Promise<void> {
  await prisma.optiune.deleteMany({ where: { intrebare: { cursId } } });
  await prisma.intrebare.deleteMany({ where: { cursId } });
  await prisma.testResult.deleteMany({ where: { test: { cursId } } });
  await prisma.test.deleteMany({ where: { cursId } });
  await prisma.material.deleteMany({ where: { cursId } });
  await prisma.enrollment.deleteMany({ where: { cursId } });
  await prisma.lectie.deleteMany({ where: { cursId } });
  await prisma.curs.delete({ where: { id: cursId } });

  revalidatePath("/admin");
  revalidatePath("/admin/cursuri");
  revalidatePath("/dashboard/cursuri");
  redirect("/admin/cursuri");
}