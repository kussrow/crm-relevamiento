"use client";

import { useTransition } from "react";
import { ESTADOS, type Estado } from "@/lib/types";
import { ESTADO_INFO } from "@/lib/scoring";
import { setEstadoAction } from "@/app/(dash)/lead/[id]/actions";

export default function EstadoSelector({
  id,
  current,
}: {
  id: number;
  current: Estado;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ESTADOS.map((e) => {
        const info = ESTADO_INFO[e];
        const active = e === current;
        return (
          <button
            key={e}
            disabled={pending}
            onClick={() => startTransition(() => setEstadoAction(id, e))}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors disabled:opacity-50 ${
              active
                ? `${info.badge} font-medium`
                : "border border-border text-faint hover:text-fg"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
            {info.label}
          </button>
        );
      })}
    </div>
  );
}
