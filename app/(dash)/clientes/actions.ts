"use server";

import { revalidatePath } from "next/cache";
import { crearClientePresencial } from "@/lib/leads";
import type { Negocio, DatosPersonales, DatosFacturacion } from "@/lib/types";

export async function crearClienteAction(
  negocio: Negocio,
  personales: DatosPersonales,
  facturacion?: DatosFacturacion
): Promise<number> {
  const id = await crearClientePresencial(negocio, personales, facturacion);
  revalidatePath("/clientes");
  revalidatePath("/bandeja");
  revalidatePath("/");
  return id;
}
