"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { List, Columns3 } from "lucide-react";

const VISTAS = [
  { value: "lista", label: "Columna", icon: List },
  { value: "kanban", label: "Kanban", icon: Columns3 },
] as const;

export default function VistaSwitcher() {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("vista") === "kanban" ? "kanban" : "lista";

  const setVista = (value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value === "lista") params.delete("vista");
    else params.set("vista", value);
    router.push(`/bandeja?${params.toString()}`);
  };

  return (
    <div className="inline-flex rounded-md border border-border bg-card p-0.5">
      {VISTAS.map((v) => {
        const Icon = v.icon;
        const active = current === v.value;
        return (
          <button
            key={v.value}
            onClick={() => setVista(v.value)}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-accent text-accent-fg font-medium"
                : "text-muted hover:bg-hover hover:text-fg"
            }`}
          >
            <Icon className="h-4 w-4" />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
