import {
  LayoutDashboard,
  Inbox,
  Users,
  FileText,
  CalendarDays,
  MessageSquareText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bandeja", label: "Bandeja", icon: Inbox },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/presupuestos", label: "Presupuestos", icon: FileText },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/respuestas", label: "Respuestas", icon: MessageSquareText },
  { href: "/configuracion", label: "Ajustes", icon: Settings },
];
