// Helpers puros (sin dependencias de base de datos) — seguros para el cliente.
import type { Moneda } from "./types";

export function simboloMoneda(moneda: Moneda = "ARS"): string {
  return moneda === "USD" ? "US$" : "$";
}

export function formatMoneda(n: number, moneda: Moneda = "ARS"): string {
  return `${simboloMoneda(moneda)} ` + (Number(n) || 0).toLocaleString("es-AR");
}

// Convierte un monto a la otra moneda usando la cotización (pesos por 1 USD).
// Devuelve null si no hay cotización válida.
export function equivalente(
  monto: number,
  moneda: Moneda,
  cotizacion: number | null | undefined
): { monto: number; moneda: Moneda } | null {
  const c = Number(cotizacion);
  if (!c || c <= 0) return null;
  if (moneda === "USD") return { monto: monto * c, moneda: "ARS" };
  return { monto: monto / c, moneda: "USD" };
}
