"use server";

import { revalidatePath } from "next/cache";
import {
  updateEstado,
  updateNotas,
  deleteLead,
  updateDatosPersonales,
  updateDatosFacturacion,
} from "@/lib/leads";
import type { Estado, DatosPersonales, DatosFacturacion } from "@/lib/types";

export async function deleteLeadAction(id: number) {
  await deleteLead(id);
  revalidatePath("/bandeja");
  revalidatePath("/clientes");
  revalidatePath("/");
}

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

export async function setDatosPersonalesAction(id: number, datos: DatosPersonales) {
  await updateDatosPersonales(id, datos);
  revalidatePath(`/lead/${id}`);
}

export async function setDatosFacturacionAction(id: number, datos: DatosFacturacion) {
  await updateDatosFacturacion(id, datos);
  revalidatePath(`/lead/${id}`);
}
