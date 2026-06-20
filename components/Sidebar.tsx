"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Users,
  FileText,
  CalendarDays,
  MessageSquareText,
  Settings,
  PanelLeft,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bandeja", label: "Bandeja", icon: Inbox },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/presupuestos", label: "Presupuestos", icon: FileText },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/respuestas", label: "Respuestas", icon: MessageSquareText },
  { href: "/configuracion", label: "Ajustes", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
  }, []);

  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem("sidebar-collapsed", c ? "0" : "1");
      return !c;
    });

  return (
    <aside
      className={`flex ${
        collapsed ? "w-16" : "w-52"
      } shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200`}
    >
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } px-3 py-4`}
      >
        {!collapsed && (
          <span className="px-2 text-sm font-semibold tracking-tight text-fg">CRM</span>
        )}
        <button
          onClick={toggle}
          className="rounded-md p-2 text-muted transition-colors hover:bg-hover hover:text-fg"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {links.map((l) => {
          const Icon = l.icon;
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              title={l.label}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-hover font-medium text-fg"
                  : "text-muted hover:bg-hover hover:text-fg"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
