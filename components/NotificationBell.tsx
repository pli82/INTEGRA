"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ShieldCheck, ClipboardCheck, AlertTriangle } from "lucide-react";

export type Notificare = {
  mesaj: string;
  detaliu?: string;
  tip: "curs" | "test" | "atentie";
};

export function NotificationBell({ notificari }: { notificari: Notificare[] }) {
  const [deschis, setDeschis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDeschis(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const iconFor = (tip: Notificare["tip"]) => {
    if (tip === "test") return <ClipboardCheck size={16} className="text-blue-600" />;
    if (tip === "atentie") return <AlertTriangle size={16} className="text-amber-600" />;
    return <ShieldCheck size={16} className="text-emerald-600" />;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setDeschis((d) => !d)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
        title="Notificări"
      >
        <Bell size={20} className="text-slate-500" />
        {notificari.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
            {notificari.length}
          </span>
        )}
      </button>

      {deschis && (
        <div className="absolute right-0 top-10 z-20 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-medium text-slate-900">Notificări</h3>
          </div>
          {notificari.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              Nu ai notificări noi.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notificari.map((n, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50"
                >
                  <span className="mt-0.5 shrink-0">{iconFor(n.tip)}</span>
                  <div>
                    <p className="text-sm text-slate-700">{n.mesaj}</p>
                    {n.detaliu && <p className="mt-0.5 text-xs text-slate-400">{n.detaliu}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}