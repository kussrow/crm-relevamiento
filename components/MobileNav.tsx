"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/components/navLinks";

// Navegación para pantallas chicas: botón hamburguesa + drawer deslizable.
// Solo visible en mobile (la Sidebar normal está oculta con md:flex).
// El drawer se cierra al tocar un link o el fondo.
export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        title="Menú"
        className="rounded-md p-2 text-muted transition-colors hover:bg-hover hover:text-fg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative flex w-64 max-w-[80%] flex-col border-r border-border bg-card">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm font-semibold tracking-tight text-fg">CRM</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-muted hover:bg-hover hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 px-2">
              {NAV_LINKS.map((l) => {
                const Icon = l.icon;
                const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-hover font-medium text-fg"
                        : "text-muted hover:bg-hover hover:text-fg"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
