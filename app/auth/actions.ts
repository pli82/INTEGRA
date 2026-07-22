"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "smam_session";

export type AuthState = { error?: string };

export async function inregistreaza(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const prenume = (formData.get("prenume") as string || "").trim();
  const nume = (formData.get("nume") as string || "").trim();
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const parola = (formData.get("parola") as string || "");
  const functie = (formData.get("functie") as string || "").trim();
  const compartiment = (formData.get("compartiment") as string || "").trim();
  const consimtamant = formData.get("consimtamant") === "on";

  if (!prenume || !nume || !email || !parola || !functie || !compartiment) {
    return { error: "Toate câmpurile sunt obligatorii." };
  }
  if (!email.includes("@")) {
    return { error: "Adresa de email nu este validă." };
  }
  if (parola.length < 6) {
    return { error: "Parola trebuie să aibă cel puțin 6 caractere." };
  }
  if (!consimtamant) {
    return { error: "Este necesar acordul privind prelucrarea datelor." };
  }

  const existent = await prisma.angajat.findUnique({ where: { email } });
  if (existent) {
    return { error: "Există deja un cont cu această adresă de email." };
  }

  const structura = await prisma.structura.upsert({
    where: { nume: compartiment },
    create: { nume: compartiment },
    update: {},
  });

  const hash = await bcrypt.hash(parola, 10);

  const angajat = await prisma.angajat.create({
    data: {
      prenume,
      nume,
      email,
      parola: hash,
      functie,
      structuraId: structura.id,
      consimtamantGDPR: true,
      consimtamantData: new Date(),
    },
  });

  const cursuri = await prisma.curs.findMany();
  for (const curs of cursuri) {
    await prisma.enrollment.create({
      data: { angajatId: angajat.id, cursId: curs.id },
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, angajat.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/dashboard");
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const parola = (formData.get("parola") as string || "");

  if (!email || !parola) {
    return { error: "Completează emailul și parola." };
  }

  const angajat = await prisma.angajat.findUnique({ where: { email } });
  if (!angajat || !angajat.parola) {
    return { error: "Email sau parolă incorectă." };
  }

  const valid = await bcrypt.compare(parola, angajat.parola);
  if (!valid) {
    return { error: "Email sau parolă incorectă." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, angajat.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  if (angajat.role === "ADMINISTRATOR") {
    redirect("/admin");
  }
  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const id = cookieStore.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  try {
    return await prisma.angajat.findUnique({
      where: { id },
      include: { structura: true },
    });
  } catch {
    return null;
  }
}
