"use client";

import { Download } from "lucide-react";
import { inregistreazaFontRomanesc } from "@/lib/pdfFont";

type IntrebareDetaliu = { enunt: string; raspunsAles: string; raspunsCorect: string; corect: boolean };

export function DescarcaCertificatFinal({
  angajat,
  cursTitlu,
  titluTest,
  data,
  scor,
  dinTotal,
  promovat,
  semnatura,
  intrebari,
}: {
  angajat: { nume: string; prenume: string; functie: string; structura: string };
  cursTitlu: string;
  titluTest: string;
  data: string;
  scor: number;
  dinTotal: number;
  promovat: boolean;
  semnatura: string;
  intrebari: IntrebareDetaliu[];
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
    doc.text(`Certificat de finalizare - ${titluTest}`, marginX, y);
    y += 12;

    doc.setFontSize(11);
    const randuri: [string, string][] = [
      ["Nume", angajat.nume],
      ["Prenume", angajat.prenume],
      ["Functie", angajat.functie],
      ["Structura", angajat.structura],
      ["Curs", cursTitlu],
      ["Data sustinerii", data],
      ["Scor obtinut", `${scor} / ${dinTotal}`],
      ["Rezultat", promovat ? "Promovat" : "Respins"],
    ];
    for (const [label, valoare] of randuri) {
      doc.text(`${label}:`, marginX, y);
      doc.text(valoare, 70, y);
      y += 8;
    }

    y += 4;
    doc.text("Semnatura:", marginX, y);
    doc.addImage(semnatura, "PNG", marginX, y + 4, 55, 22);
    y += 34;

    if (intrebari.length > 0) {
      verificaSpatiu(10);
      doc.setFontSize(13);
      doc.text("Detaliu intrebari si raspunsuri", marginX, y);
      y += 10;

      doc.setFontSize(10);
      intrebari.forEach((intr, i) => {
        const liniiEnunt = doc.splitTextToSize(`${i + 1}. ${intr.enunt}`, maxWidth);
        verificaSpatiu(liniiEnunt.length * 5 + 16);
        doc.setFont("NotoSans", "bold");
        doc.text(liniiEnunt, marginX, y);
        y += liniiEnunt.length * 5 + 2;

        doc.setFont("NotoSans", "normal");
        const liniiRaspuns = doc.splitTextToSize(`Raspuns dat: ${intr.raspunsAles}`, maxWidth);
        verificaSpatiu(liniiRaspuns.length * 5 + 14);
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
          verificaSpatiu(liniiCorect.length * 5 + 8);
          doc.text(liniiCorect, marginX, y);
          y += liniiCorect.length * 5;
        }
        y += 6;
      });
    }

    doc.save(`certificat-test-final-${cursTitlu.replace(/\s+/g, "-")}-${angajat.nume}-${angajat.prenume}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={genereaza}
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
    >
      <Download size={13} /> Descarca certificat PDF
    </button>
  );
}