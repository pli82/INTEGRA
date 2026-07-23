"use client";

import { FileText } from "lucide-react";

type CursRand = { titlu: string; progres: number; status: string };
type TestFinalRand = { scor: number; dinTotal: number; promovat: boolean } | null;

const statusLabel: Record<string, string> = {
  PROMOVAT: "Promovat",
  IN_CURS: "In curs",
  NEINCEPUT: "Neinceput",
  RESPINS: "Respins",
};

export function DescarcaRaportAngajat({
  angajat,
  cursuri,
  testFinal,
}: {
  angajat: { nume: string; functie: string; structura: string };
  cursuri: CursRand[];
  testFinal: TestFinalRand;
}) {
  const genereaza = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const marginX = 15;
    let y = 20;

    doc.setFontSize(16);
    doc.text("Raport de instruire - angajat", marginX, y);
    y += 12;

    doc.setFontSize(11);
    const randuriAntet: [string, string][] = [
      ["Nume si prenume", angajat.nume],
      ["Functie", angajat.functie],
      ["Structura", angajat.structura],
      ["Data raportului", new Date().toLocaleDateString("ro-RO")],
    ];
    for (const [label, valoare] of randuriAntet) {
      doc.text(`${label}:`, marginX, y);
      doc.text(valoare, 65, y);
      y += 8;
    }

    y += 6;
    doc.setFontSize(13);
    doc.text("Progres pe cursuri", marginX, y);
    y += 8;
    doc.setFontSize(10);
    if (cursuri.length === 0) {
      doc.text("Nu exista cursuri inregistrate.", marginX, y);
      y += 8;
    } else {
      for (const c of cursuri) {
        doc.text(c.titlu, marginX, y);
        doc.text(`${c.progres}% - ${statusLabel[c.status] ?? c.status}`, 130, y);
        y += 7;
      }
    }

    y += 6;
    doc.setFontSize(13);
    doc.text("Test general de evaluare", marginX, y);
    y += 8;
    doc.setFontSize(10);
    if (testFinal) {
      doc.text(`Scor: ${testFinal.scor} / ${testFinal.dinTotal}`, marginX, y);
      y += 7;
      doc.text(`Rezultat: ${testFinal.promovat ? "Promovat" : "Respins"}`, marginX, y);
    } else {
      doc.text("Testul general nu a fost sustinut inca.", marginX, y);
    }

    doc.save(`raport-${angajat.nume.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={genereaza}
      className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
    >
      <FileText size={12} /> PDF
    </button>
  );
}
