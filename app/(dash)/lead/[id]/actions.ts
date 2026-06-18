"use server";

import { revalidatePath } from "next/cache";
import { updateEstado, updateNotas } from "@/lib/leads";
import type { Estado } from "@/lib/types";

export async function setEstadoAction(id: number, estado: Estado) {
  await updateEstado(id, estado);
  revalidatePath(`/lead/${id}`);
  revalidatePath("/bandeja");
  revalidatePath("/");
}

export async function setNotasAction(id: number, notas: string) {
  await updateNotas(id, notas);
  revalidatePath(`/lead/${id}`);
}
