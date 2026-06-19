"use server";

import { revalidatePath } from "next/cache";
import {
  createEvento,
  deleteEvento,
  toggleEventoHecho,
  type EventoInput,
} from "@/lib/eventos";

export async function crearEventoAction(data: EventoInput): Promise<number> {
  const id = await createEvento(data);
  revalidatePath("/agenda");
  return id;
}

export async function eliminarEventoAction(id: number) {
  await deleteEvento(id);
  revalidatePath("/agenda");
}

export async function toggleEventoAction(id: number, hecho: boolean) {
  await toggleEventoHecho(id, hecho);
  revalidatePath("/agenda");
}
