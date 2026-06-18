"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Sun, Moon, User, Settings, LogOut } from "lucide-react";

type Notif = { id: number; nombre: string | null; negocio: string; categoria: string | null };

export default function Topbar() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState<null | "bell" | "user">(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    fetch("/api/notificaciones")
      .then((r) => r.json())
      .then((d) => setNotifs(d.leads || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggleTheme = () => {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    localStorage.theme = next ? "dark" : "light";
    setDark(next);
  };

  return (
    <header
      ref={ref}
      className="flex h-14 items-center justify-end gap-1 border-b border-border bg-card px-4"
    >
      <button
        onClick={toggleTheme}
        className="rounded-md p-2 text-muted transition-colors hover:bg-hover hover:text-fg"
        title="Cambiar tema"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notificaciones */}
      <div className="relative">
        <button
          onClick={() => setOpen(open === "bell" ? null : "bell")}
          className="relative rounded-md p-2 text-muted transition-colors hover:bg-hover hover:text-fg"
          title="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          {notifs.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>
        {open === "bell" && (
          <div className="absolute right-0 z-20 mt-1 w-72 rounded-lg border border-border bg-card p-2 shadow-lg">
            <div className="px-2 py-1 text-xs font-medium text-faint">
              Requieren atención
            </div>
            {notifs.length === 0 ? (
              <p className="px-2 py-3 text-sm text-faint">Nada pendiente.</p>
            ) : (
              notifs.map((n) => (
                <Link
                  key={n.id}
                  href={`/lead/${n.id}`}
                  onClick={() => setOpen(null)}
                  className="block rounded-md px-2 py-2 text-sm hover:bg-hover"
                >
                  <span className="font-medium text-fg">{n.nombre || "Sin nombre"}</span>
                  <span className="text-faint"> · {n.categoria}</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* Usuario */}
      <div className="relative ml-1">
        <button
          onClick={() => setOpen(open === "user" ? null : "user")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-fg"
          title="Cuenta"
        >
          <User className="h-4 w-4" />
        </button>
        {open === "user" && (
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-border bg-card p-1 shadow-lg">
            <Link
              href="/configuracion"
              onClick={() => setOpen(null)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-hover hover:text-fg"
            >
              <Settings className="h-4 w-4" /> Configuración
            </Link>
            <form action="/api/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-hover hover:text-fg"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
