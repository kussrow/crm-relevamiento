"use server";

import { revalidatePath } from "next/cache";
import { updateEstado, updateEstadoByTelefono } from "@/lib/leads";
import type { Estado } from "@/lib/types";

// Mueve un cliente de columna en el kanban. Si tiene teléfono, mueve todas sus
// consultas; si no, mueve solo el lead representante.
export async function moverClienteAction(
  telefono: string | null,
  leadId: number,
  estado: Estado
) {
  if (telefono) {
    await updateEstadoByTelefono(telefono, estado);
  } else {
    await updateEstado(leadId, estado);
  }
  revalidatePath("/bandeja");
  revalidatePath("/");
}
