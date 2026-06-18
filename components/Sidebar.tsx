"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Tablero" },
  { href: "/bandeja", label: "Bandeja" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="px-5 py-5">
        <div className="text-sm font-semibold tracking-tight text-zinc-900">CRM</div>
        <div className="text-xs text-zinc-400">Relevamiento</div>
      </div>
      <nav className="flex flex-col gap-0.5 px-3">
        {links.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-zinc-100 font-medium text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3">
        <form action="/api/logout" method="post">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
          >
            Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
