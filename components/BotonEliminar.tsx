"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteLeadAction } from "@/app/(dash)/lead/[id]/actions";

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
        className="rounded-md p-1.5 text-faint transition-colors hover:bg-hover hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
