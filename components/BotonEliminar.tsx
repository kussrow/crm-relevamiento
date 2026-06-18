"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLeadAction } from "@/app/(dash)/lead/[id]/actions";

// variant "full" → botón con texto (ficha); "compact" → ícono (fila de bandeja)
export default function BotonEliminar({
  id,
  variant = "full",
  redirectTo,
}: {
  id: number;
  variant?: "full" | "compact";
  redirectTo?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const handle = () => {
    if (!confirm("¿Eliminar este lead? No se puede deshacer.")) return;
    start(async () => {
      await deleteLeadAction(id);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handle}
        disabled={pending}
        title="Eliminar lead"
        className="rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
      >
        {pending ? "…" : "🗑"}
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Eliminando…" : "🗑 Eliminar"}
    </button>
  );
}
