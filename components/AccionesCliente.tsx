"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteLeadAction } from "@/app/(dash)/lead/[id]/actions";

export default function AccionesCliente({
  id,
  nombre,
}: {
  id: number;
  nombre: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const eliminar = () => {
    if (!confirm(`¿Eliminar a "${nombre}"? Se borra el lead completo. No se puede deshacer.`))
      return;
    start(async () => {
      await deleteLeadAction(id);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        onClick={() => router.push(`/lead/${id}`)}
        title="Editar"
        className="rounded-md p-1.5 text-faint transition-colors hover:bg-hover hover:text-accent"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={eliminar}
        disabled={pending}
        title="Eliminar"
        className="rounded-md p-1.5 text-faint transition-colors hover:bg-hover hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
