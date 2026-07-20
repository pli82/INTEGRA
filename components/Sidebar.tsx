import Link from "next/link";
import {
  ShieldCheck,
  Home,
  BookOpen,
  LineChart,
  ClipboardCheck,
  Folder,
  Settings,
  Vote,
} from "lucide-react";
import clsx from "clsx";
import { AvatarUpload } from "./AvatarUpload";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function Sidebar({
  variant,
  activeHref,
  userName,
  userRole,
  fotoUrl,
}: {
  variant: "angajat" | "admin";
  activeHref: string;
  userName?: string;
  userRole?: string;
  fotoUrl?: string | null;
}) {
  const angajatNav: NavItem[] = [
    { href: "/dashboard", label: "Acasă", icon: <Home size={18} /> },
    { href: "/dashboard/cursuri", label: "Cursurile mele", icon: <BookOpen size={18} /> },
    { href: "/dashboard/progres", label: "Progres", icon: <LineChart size={18} /> },
    { href: "/dashboard/testare", label: "Testare", icon: <ClipboardCheck size={18} /> },
    { href: "/dashboard/resurse", label: "Resurse", icon: <Folder size={18} /> },
  ];

  const adminNav: NavItem[] = [
    { href: "/admin", label: "Panou principal", icon: <Home size={18} /> },
    { href: "/admin/cursuri", label: "Cursuri", icon: <BookOpen size={18} /> },
    { href: "/admin/progres", label: "Progres", icon: <LineChart size={18} /> },
    { href: "/admin/testare", label: "Testare", icon: <ClipboardCheck size={18} /> },
    { href: "/admin", label: "Administrare", icon: <Settings size={18} /> },
  ];

  const nav = variant === "admin" ? adminNav : angajatNav;

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col justify-between bg-[#0B1541] px-4 py-6 text-white">
      <div>
        <div className="mb-8 flex items-center gap-3 px-2">
          {variant === "admin" ? (
            <ShieldCheck size={30} className="shrink-0" />
          ) : (
            <Vote size={30} className="shrink-0" />
          )}
          <div className="leading-tight">
            <div className="text-sm font-medium text-white">
              {variant === "admin" ? "SMAM Instruire" : "AEP"}
            </div>
            {variant !== "admin" && (
              <div className="text-xs text-white/60">SMAM Instruire</div>
            )}
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {userName && (
        <div className="flex items-center gap-2 border-t border-white/10 px-2 pt-4 text-sm">
          {variant === "angajat" ? (
            <AvatarUpload nume={userName} fotoUrl={fotoUrl} />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
              {userName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
          <div className="leading-tight">
            <div className="font-medium text-white">{userName}</div>
            <div className="text-xs text-white/60">{userRole}</div>
          </div>
        </div>
      )}
    </aside>
  );
}