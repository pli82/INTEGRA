"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Check, X, Download } from "lucide-react";
import clsx from "clsx";
import { finalizeazaTestFinal } from "@/app/dashboard/testare/finalActions";
import { inregistreazaFontRomanesc } from "@/lib/pdfFont";

type Optiune = { id: string; text: string; corecta: boolean };
type Intrebare = { id: string; enunt: string; optiuni: Optiune[] };
type Angajat = { nume: string; prenume: string; functie: string; structura: string };

const PRAG_PROMOVARE = 10;

export function TestFinalQuiz({
  testFinalId,
  titluTest,
  cursTitlu,
  intrebari,
  angajat,
}: {
  testFinalId: string;
  titluTest: string;
  cursTitlu: string;
  intrebari: Intrebare[];
  angajat: Angajat;
}) {
  const [index, setIndex] = useState(0);
  const [selectat, setSelectat] = useState<string | null>(null);
  const [scor, setScor] = useState(0);
  const [faza, setFaza] = useState<"quiz" | "semnatura" | "gata">("quiz");
  const [eroare, setEroare] = useState<string | null>(null);
  const [seSalveaza, setSeSalveaza] = useState(false);
  const [semnaturaGoala, setSemnaturaGoala] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deseneazaRef = useRef(false);
  const rezultatFinalRef = useRef<{ scor: number; dinTotal: number } | null>(null);
  const raspunsuriRef = useRef<Record<string, string>>({});

  const intrebare = intrebari[index];
  const ultima = index === intrebari.length - 1;

  const alegeOptiune = (optiune: Optiune) => {
    if (selectat) return;
    setSelectat(optiune.id);
    raspunsuriRef.current[intrebare.id] = optiune.id;
    if (optiune.corecta) setScor((s) => s + 1);
  };

  const urmatoarea = () => {
    if (ultima) {
      setFaza("semnatura");
      return;
    }
    setIndex((i) => i + 1);
    setSelectat(null);
  };

  const pozitieDinEveniment = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDesen = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    deseneazaRef.current = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = pozitieDinEveniment(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const continuaDesen = (e: React.MouseEvent | React.TouchEvent) => {
    if (!deseneazaRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = pozitieDinEveniment(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(x, y);
    ctx.stroke();
    setSemnaturaGoala(false);
  };

  const opresteDesen = () => {
    deseneazaRef.current = false;
  };

  const stergeSemnatura = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSemnaturaGoala(true);
  };

  const genereazaPdf = async (semnatura: string) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    inregistreazaFontRomanesc(doc);
    const promovat = scor >= PRAG_PROMOVARE;
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
      ["Data sustinerii", new Date().toLocaleDateString("ro-RO")],
      ["Scor obtinut", `${scor} / ${intrebari.length}`],
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

    verificaSpatiu(10);
    doc.setFontSize(13);
    doc.text("Detaliu intrebari si raspunsuri", marginX, y);
    y += 10;

    doc.setFontSize(10);
    intrebari.forEach((intr, i) => {
      const raspunsAlesId = raspunsuriRef.current[intr.id];
      const optiuneAleasa = intr.optiuni.find((o) => o.id === raspunsAlesId);
      const optiuneCorecta = intr.optiuni.find((o) => o.corecta);
      const corect = !!optiuneAleasa?.corecta;

      const liniiEnunt = doc.splitTextToSize(`${i + 1}. ${intr.enunt}`, maxWidth);
      verificaSpatiu(liniiEnunt.length * 5 + 16);
      doc.setFont("NotoSans", "bold");
      doc.text(liniiEnunt, marginX, y);
      y += liniiEnunt.length * 5 + 2;

      doc.setFont("NotoSans", "normal");
      const liniiRaspuns = doc.splitTextToSize(`Raspuns dat: ${optiuneAleasa?.text ?? "(fara raspuns)"}`, maxWidth);
      verificaSpatiu(liniiRaspuns.length * 5 + 14);
      doc.text(liniiRaspuns, marginX, y);
      y += liniiRaspuns.length * 5;

      if (corect) {
        doc.setTextColor(22, 163, 74);
        doc.text("CORECT", marginX, y);
      } else {
        doc.setTextColor(220, 38, 38);
        doc.text("GRESIT", marginX, y);
      }
      doc.setTextColor(0, 0, 0);
      y += 5;

      if (optiuneCorecta) {
        const liniiCorect = doc.splitTextToSize(`Raspuns corect: ${optiuneCorecta.text}`, maxWidth);
        verificaSpatiu(liniiCorect.length * 5 + 8);
        doc.text(liniiCorect, marginX, y);
        y += liniiCorect.length * 5;
      }
      y += 6;
    });

    doc.save(`certificat-test-final-${cursTitlu.replace(/\s+/g, "-")}-${angajat.nume}-${angajat.prenume}.pdf`);
  };

  const construiesteDetaliu = () => {
    return intrebari.map((intr) => {
      const raspunsAlesId = raspunsuriRef.current[intr.id];
      const optiuneAleasa = intr.optiuni.find((o) => o.id === raspunsAlesId);
      const optiuneCorecta = intr.optiuni.find((o) => o.corecta);
      return {
        enunt: intr.enunt,
        raspunsAles: optiuneAleasa?.text ?? "(fara raspuns)",
        raspunsCorect: optiuneCorecta?.text ?? "",
        corect: !!optiuneAleasa?.corecta,
      };
    });
  };

  const trimiteTestul = async () => {
    const canvas = canvasRef.current;
    if (!canvas || semnaturaGoala) {
      setEroare("Semneaza in caseta de mai sus inainte de a trimite testul.");
      return;
    }
    setEroare(null);
    setSeSalveaza(true);
    const semnatura = canvas.toDataURL("image/png");

    const rezultat = await finalizeazaTestFinal({
      testFinalId,
      scor,
      dinTotal: intrebari.length,
      semnatura,
      raspunsuriDetaliu: construiesteDetaliu(),
    });

    if (rezultat.error) {
      setEroare(rezultat.error);
      setSeSalveaza(false);
      return;
    }

    rezultatFinalRef.current = { scor, dinTotal: intrebari.length };
    await genereazaPdf(semnatura);
    setSeSalveaza(false);
    setFaza("gata");
  };

  if (intrebari.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Nu exista inca intrebari disponibile pentru acest test final.
      </div>
    );
  }

  if (faza === "gata") {
    const r = rezultatFinalRef.current;
    const promovat = r ? r.scor >= PRAG_PROMOVARE : false;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="mb-2 text-xl font-medium text-slate-900">Test finalizat</h2>
        <p className="mb-2 text-sm text-slate-500">
          Ai raspuns corect la {r?.scor} din {r?.dinTotal} intrebari.
        </p>
        <p className={clsx("mb-6 text-sm font-medium", promovat ? "text-emerald-600" : "text-red-600")}>
          {promovat ? "Promovat" : "Respins"}
        </p>
        <p className="mb-6 text-xs text-slate-400">
          Certificatul PDF (cu toate intrebarile si raspunsurile) a fost descarcat automat. Daca nu s-a descarcat, verifica setarile browserului pentru descarcari.
        </p>
        <Link href="/dashboard/testare" className="inline-block rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800">
          Inapoi la testare
        </Link>
      </div>
    );
  }

  if (faza === "semnatura") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 text-lg font-medium text-slate-900">Semnatura de finalizare</h2>
        <p className="mb-4 text-sm text-slate-500">
          Ai raspuns corect la {scor} din {intrebari.length} intrebari. Semneaza mai jos pentru a confirma sustinerea testului.
        </p>
        <canvas
          ref={canvasRef}
          width={500}
          height={180}
          className="mb-3 w-full touch-none rounded-lg border border-dashed border-slate-300 bg-slate-50"
          onMouseDown={startDesen}
          onMouseMove={continuaDesen}
          onMouseUp={opresteDesen}
          onMouseLeave={opresteDesen}
          onTouchStart={startDesen}
          onTouchMove={continuaDesen}
          onTouchEnd={opresteDesen}
        />
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={stergeSemnatura} className="text-xs text-slate-500 hover:text-slate-700">
            Sterge semnatura
          </button>
          <span className="text-xs text-slate-400">
            {angajat.prenume} {angajat.nume} - {angajat.functie} - {angajat.structura}
          </span>
        </div>
        {eroare && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{eroare}</p>
        )}
        <button
          type="button"
          onClick={trimiteTestul}
          disabled={seSalveaza}
          className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
        >
          <Download size={14} /> {seSalveaza ? "Se salveaza..." : "Trimite testul si descarca certificatul"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
        <span>Intrebarea {index + 1} din {intrebari.length}</span>
        <span>Scor curent: {scor}</span>
      </div>

      <h2 className="mb-5 text-base font-medium text-slate-900">{intrebare.enunt}</h2>

      <div className="flex flex-col gap-2.5">
        {intrebare.optiuni.map((o) => {
          const esteSelectata = selectat === o.id;
          const esteCorecta = o.corecta;
          const araraCaCorecta = selectat !== null && esteCorecta;
          const araraCaGresita = selectat !== null && esteSelectata && !esteCorecta;

          return (
            <button
              key={o.id}
              type="button"
              onClick={() => alegeOptiune(o)}
              disabled={selectat !== null}
              className={clsx(
                "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                !selectat && "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50",
                araraCaCorecta && "border-emerald-300 bg-emerald-50 text-emerald-700",
                araraCaGresita && "border-red-300 bg-red-50 text-red-700",
                selectat && !araraCaCorecta && !araraCaGresita && "border-slate-100 text-slate-400"
              )}
            >
              <span>{o.text}</span>
              {araraCaCorecta && <Check size={18} className="shrink-0 text-emerald-600" />}
              {araraCaGresita && <X size={18} className="shrink-0 text-red-600" />}
            </button>
          );
        })}
      </div>

      {selectat && (
        <button
          type="button"
          onClick={urmatoarea}
          className="mt-6 rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          {ultima ? "Continua la semnatura" : "Urmatoarea intrebare"}
        </button>
      )}
    </div>
  );
}