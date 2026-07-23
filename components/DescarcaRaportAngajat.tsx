"use client";

import { FileText } from "lucide-react";
import { inregistreazaFontRomanesc } from "@/lib/pdfFont";

type CursRand = { titlu: string; progres: number; status: string };
type IntrebareDetaliu = { enunt: string; raspunsAles: string; raspunsCorect: string; corect: boolean };
type TestFinalRand = { scor: number; dinTotal: number; promovat: boolean; intrebari: IntrebareDetaliu[]; semnatura: string | null } | null;

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
    inregistreazaFontRomanesc(doc);
    const marginX = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - marginX * 2;
    let y = 20;

    const verificaSpatiu = (necesar: number) => {
      if (y + necesar > pageHeight - 15) {
        doc.addPage();
        y = 20;
      }
    };

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
    verificaSpatiu(14);
    doc.setFontSize(13);
    doc.text("Progres pe cursuri", marginX, y);
    y += 8;
    doc.setFontSize(10);
    if (cursuri.length === 0) {
      doc.text("Nu exista cursuri inregistrate.", marginX, y);
      y += 8;
    } else {
      for (const c of cursuri) {
        verificaSpatiu(7);
        doc.text(c.titlu, marginX, y);
        doc.text(`${c.progres}% - ${statusLabel[c.status] ?? c.status}`, 130, y);
        y += 7;
      }
    }

    y += 6;
    verificaSpatiu(14);
    doc.setFontSize(13);
    doc.text("Test general de evaluare", marginX, y);
    y += 8;
    doc.setFontSize(10);
    if (testFinal) {
      doc.text(`Scor: ${testFinal.scor} / ${testFinal.dinTotal}`, marginX, y);
      y += 7;
      doc.text(`Rezultat: ${testFinal.promovat ? "Promovat" : "Respins"}`, marginX, y);
      y += 8;

      if (testFinal.semnatura) {
        verificaSpatiu(30);
        doc.text("Semnatura:", marginX, y);
        doc.addImage(testFinal.semnatura, "PNG", marginX, y + 4, 55, 22);
        y += 30;
      } else {
        y += 2;
      }

      if (testFinal.intrebari.length > 0) {
        verificaSpatiu(10);
        doc.setFontSize(12);
        doc.text("Detaliu intrebari si raspunsuri", marginX, y);
        y += 9;

        doc.setFontSize(9.5);
        testFinal.intrebari.forEach((intr, i) => {
          const liniiEnunt = doc.splitTextToSize(`${i + 1}. ${intr.enunt}`, maxWidth);
          verificaSpatiu(liniiEnunt.length * 5 + 14);
          doc.setFont("NotoSans", "bold");
          doc.text(liniiEnunt, marginX, y);
          y += liniiEnunt.length * 5 + 2;

          doc.setFont("NotoSans", "normal");
          const raspunsText = `Raspuns dat: ${intr.raspunsAles}`;
          const liniiRaspuns = doc.splitTextToSize(raspunsText, maxWidth);
          verificaSpatiu(liniiRaspuns.length * 5 + 8);
          if (intr.corect) {
            doc.setTextColor(22, 163, 74);
          } else {
            doc.setTextColor(220, 38, 38);
          }
          doc.text(liniiRaspuns, marginX, y);
          y += liniiRaspuns.length * 5;
          doc.setTextColor(0, 0, 0);

          if (intr.raspunsCorect) {
            const liniiCorect = doc.splitTextToSize(`Raspuns corect: ${intr.raspunsCorect}`, maxWidth);
            verificaSpatiu(liniiCorect.length * 5 + 6);
            doc.setTextColor(22, 163, 74);
            doc.text(liniiCorect, marginX, y);
            y += liniiCorect.length * 5;
            doc.setTextColor(0, 0, 0);
          }
          y += 5;
        });
      }
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
