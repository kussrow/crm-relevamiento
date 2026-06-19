// Helpers puros (sin dependencias de base de datos) — seguros para el cliente.
export function formatMoneda(n: number): string {
  return "$ " + (Number(n) || 0).toLocaleString("es-AR");
}
