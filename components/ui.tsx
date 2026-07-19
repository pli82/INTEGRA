import clsx from "clsx";

export function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-2xl font-medium text-slate-900">{value}</div>
        {hint && <div className="text-xs text-emerald-600">{hint}</div>}
      </div>
    </div>
  );
}

export function ProgressBar({ pct, color = "bg-blue-600" }: { pct: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={clsx("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatusBadge({ status }: { status: "PROMOVAT" | "IN_CURS" | "NEINCEPUT" | "RESPINS" }) {
  const map: Record<string, string> = {
    PROMOVAT: "bg-emerald-50 text-emerald-700 border-emerald-200",
    IN_CURS: "bg-slate-50 text-slate-600 border-slate-200",
    NEINCEPUT: "bg-slate-50 text-slate-400 border-slate-200",
    RESPINS: "bg-red-50 text-red-700 border-red-200",
  };
  const label: Record<string, string> = {
    PROMOVAT: "Promovat",
    IN_CURS: "În curs",
    NEINCEPUT: "Neînceput",
    RESPINS: "Respins",
  };
  return (
    <span className={clsx("rounded-full border px-2.5 py-1 text-xs font-medium", map[status])}>
      {label[status]}
    </span>
  );
}
