"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Tablero", icon: "📊" },
  { href: "/bandeja", label: "Bandeja", icon: "📥" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
        <span className="text-xl">💬</span>
        <div>
          <div className="text-sm font-semibold leading-tight">CRM Relevamiento</div>
          <div className="text-xs text-slate-400">Piscinas · Vivero</div>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {links.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3">
        <form action="/api/logout" method="post">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ↩ Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
