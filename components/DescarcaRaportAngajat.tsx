"use client";

import { FileText } from "lucide-react";
import { inregistreazaFontRomanesc } from "@/lib/pdfFont";

type CursRand = { titlu: string; progres: number; status: string };
type IntrebareDetaliu = { enunt: string; raspunsAles: string; raspunsCorect: string; corect: boolean };
type TestFinalRand = {
  cursTitlu: string;
  scor: number;
  dinTotal: number;
  promovat: boolean;
  semnatura: string | null;
  intrebari: IntrebareDetaliu[];
};

const statusLabel: Record<string, string> = {
  PROMOVAT: "Promovat",
  IN_CURS: "In curs",
  NEINCEPUT: "Neinceput",
  RESPINS: "Respins",
};

export function DescarcaRaportAngajat({
  angajat,
  cursuri,
  testeFinale,
}: {
  angajat: { nume: string; functie: string; structura: string };
  cursuri: CursRand[];
  testeFinale: TestFinalRand[];
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
    doc.text("Teste finale", marginX, y);
    y += 9;
    doc.setFontSize(10);

    if (testeFinale.length === 0) {
      doc.text("Niciun test final sustinut inca.", marginX, y);
      y += 8;
    } else {
      testeFinale.forEach((tf) => {
        verificaSpatiu(20);
        doc.setFont("NotoSans", "bold");
        doc.text(tf.cursTitlu, marginX, y);
        doc.setFont("NotoSans", "normal");
        y += 6;
        doc.text(`Scor: ${tf.scor} / ${tf.dinTotal}`, marginX, y);
        y += 6;
        doc.text(`Rezultat: ${tf.promovat ? "Promovat" : "Respins"}`, marginX, y);
        y += 7;

        if (tf.semnatura) {
          verificaSpatiu(30);
          doc.text("Semnatura:", marginX, y);
          doc.addImage(tf.semnatura, "PNG", marginX, y + 4, 55, 22);
          y += 30;
        }

        if (tf.intrebari.length > 0) {
          verificaSpatiu(10);
          doc.setFontSize(11);
          doc.text("Detaliu intrebari si raspunsuri", marginX, y);
          y += 8;

          doc.setFontSize(9.5);
          tf.intrebari.forEach((intr, i) => {
            const liniiEnunt = doc.splitTextToSize(`${i + 1}. ${intr.enunt}`, maxWidth);
            verificaSpatiu(liniiEnunt.length * 5 + 14);
            doc.setFont("NotoSans", "bold");
            doc.text(liniiEnunt, marginX, y);
            y += liniiEnunt.length * 5 + 2;

            doc.setFont("NotoSans", "normal");
            const liniiRaspuns = doc.splitTextToSize(`Raspuns dat: ${intr.raspunsAles}`, maxWidth);
            verificaSpatiu(liniiRaspuns.length * 5 + 12);
            doc.text(liniiRaspuns, marginX, y);
            y += liniiRaspuns.length * 5;

            if (intr.corect) {
              doc.setTextColor(22, 163, 74);
              doc.text("CORECT", marginX, y);
            } else {
              doc.setTextColor(220, 38, 38);
              doc.text("GRESIT", marginX, y);
            }
            doc.setTextColor(0, 0, 0);
            y += 5;

            if (intr.raspunsCorect) {
              const liniiCorect = doc.splitTextToSize(`Raspuns corect: ${intr.raspunsCorect}`, maxWidth);
              verificaSpatiu(liniiCorect.length * 5 + 6);
              doc.text(liniiCorect, marginX, y);
              y += liniiCorect.length * 5;
            }
            y += 5;
          });
          doc.setFontSize(10);
        }
        y += 8;
      });
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