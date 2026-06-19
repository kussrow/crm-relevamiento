import { query, queryOne } from "./db";
import { formatMoneda } from "./format";
import type { Presupuesto, PresupuestoItem, EstadoPresupuesto } from "./types";

export { formatMoneda };
// Re-export para compatibilidad; la fuente vive en scoring.ts (client-safe).
export { PRESU_ESTADO_INFO } from "./scoring";

const SELECT = `SELECT id, negocio, cliente, telefono, lead_id, estado, items, notas,
  total::float8 AS total, to_char(vence_el, 'YYYY-MM-DD') AS vence_el,
  created_at, updated_at FROM presupuestos`;

export async function getPresupuestos(): Promise<Presupuesto[]> {
  return query<Presupuesto>(`${SELECT} ORDER BY created_at DESC LIMIT 500`);
}

export async function getPresupuesto(id: number): Promise<Presupuesto | null> {
  return queryOne<Presupuesto>(`${SELECT} WHERE id = $1`, [id]);
}

export interface PresupuestoInput {
  negocio?: string | null;
  cliente?: string | null;
  telefono?: string | null;
  lead_id?: number | null;
  estado?: EstadoPresupuesto;
  items?: PresupuestoItem[];
  notas?: string | null;
  vence_el?: string | null;
}

function calcTotal(items: PresupuestoItem[] = []): number {
  return items.reduce(
    (a, b) => a + (Number(b.cantidad) || 0) * (Number(b.precio) || 0),
    0
  );
}

export async function createPresupuesto(d: PresupuestoInput): Promise<number> {
  const items = d.items ?? [];
  const rows = await query<{ id: number }>(
    `INSERT INTO presupuestos (negocio, cliente, telefono, lead_id, estado, items, notas, total, vence_el)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [
      d.negocio ?? null,
      d.cliente ?? null,
      d.telefono ?? null,
      d.lead_id ?? null,
      d.estado ?? "borrador",
      JSON.stringify(items),
      d.notas ?? null,
      calcTotal(items),
      d.vence_el || null,
    ]
  );
  return rows[0].id;
}

export async function updatePresupuesto(id: number, d: PresupuestoInput): Promise<void> {
  const items = d.items ?? [];
  await query(
    `UPDATE presupuestos SET negocio=$1, cliente=$2, telefono=$3, estado=$4,
       items=$5, notas=$6, total=$7, vence_el=$8, updated_at=now() WHERE id=$9`,
    [
      d.negocio ?? null,
      d.cliente ?? null,
      d.telefono ?? null,
      d.estado ?? "borrador",
      JSON.stringify(items),
      d.notas ?? null,
      calcTotal(items),
      d.vence_el || null,
      id,
    ]
  );
}

export async function setEstadoPresupuesto(id: number, estado: EstadoPresupuesto): Promise<void> {
  await query(`UPDATE presupuestos SET estado=$1, updated_at=now() WHERE id=$2`, [estado, id]);
}

export async function deletePresupuesto(id: number): Promise<void> {
  await query(`DELETE FROM presupuestos WHERE id = $1`, [id]);
}

export function presupuestoToTexto(p: Presupuesto): string {
  const lineas = (p.items || [])
    .filter((i) => i.descripcion)
    .map(
      (i) =>
        `• ${i.descripcion}  ${i.cantidad} x ${formatMoneda(i.precio)} = ${formatMoneda(
          (Number(i.cantidad) || 0) * (Number(i.precio) || 0)
        )}`
    )
    .join("\n");
  return (
    `*Presupuesto*\n` +
    (p.cliente ? `Cliente: ${p.cliente}\n` : "") +
    `\n${lineas}\n\n` +
    `*TOTAL: ${formatMoneda(p.total)}*` +
    (p.vence_el ? `\nVálido hasta: ${p.vence_el.split("-").reverse().join("/")}` : "") +
    (p.notas ? `\n\n${p.notas}` : "")
  );
}

