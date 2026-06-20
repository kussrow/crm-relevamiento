import { query } from "./db";
import type { Evento, TipoEvento } from "./types";

const SELECT = `SELECT id, tipo, titulo,
  to_char(fecha, 'YYYY-MM-DD"T"HH24:MI') AS fecha,
  lead_id, cliente, telefono, negocio, notas, hecho, created_at, updated_at
  FROM eventos`;

// Eventos en el rango [desde, hasta) — fechas 'YYYY-MM-DD'.
export async function getEventos(
  desde: string,
  hasta: string,
  negocio?: string | null
): Promise<Evento[]> {
  const params: unknown[] = [desde, hasta];
  let extra = "";
  if (negocio) {
    params.push(negocio);
    extra = ` AND negocio = $${params.length}`;
  }
  return query<Evento>(
    `${SELECT} WHERE fecha >= $1 AND fecha < $2${extra} ORDER BY fecha`,
    params
  );
}

// Próximos eventos pendientes (para el dashboard).
export async function getProximosEventos(limit = 5): Promise<Evento[]> {
  return query<Evento>(
    `${SELECT} WHERE fecha >= now() AND hecho = false ORDER BY fecha LIMIT $1`,
    [limit]
  );
}

export interface EventoInput {
  tipo: TipoEvento;
  titulo: string;
  fecha: string; // 'YYYY-MM-DDTHH:MM'
  cliente?: string | null;
  telefono?: string | null;
  lead_id?: number | null;
  negocio?: string | null;
  notas?: string | null;
}

export async function createEvento(d: EventoInput): Promise<number> {
  const rows = await query<{ id: number }>(
    `INSERT INTO eventos (tipo, titulo, fecha, lead_id, cliente, telefono, negocio, notas)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [
      d.tipo,
      d.titulo,
      d.fecha,
      d.lead_id ?? null,
      d.cliente ?? null,
      d.telefono ?? null,
      d.negocio ?? null,
      d.notas ?? null,
    ]
  );
  return rows[0].id;
}

export async function updateEvento(id: number, d: EventoInput): Promise<void> {
  await query(
    `UPDATE eventos SET tipo=$1, titulo=$2, fecha=$3, cliente=$4, telefono=$5,
       notas=$6, lead_id=$7, negocio=$8, updated_at=now() WHERE id=$9`,
    [
      d.tipo,
      d.titulo,
      d.fecha,
      d.cliente ?? null,
      d.telefono ?? null,
      d.notas ?? null,
      d.lead_id ?? null,
      d.negocio ?? null,
      id,
    ]
  );
}

export async function deleteEvento(id: number): Promise<void> {
  await query(`DELETE FROM eventos WHERE id = $1`, [id]);
}

export async function toggleEventoHecho(id: number, hecho: boolean): Promise<void> {
  await query(`UPDATE eventos SET hecho = $1, updated_at = now() WHERE id = $2`, [
    hecho,
    id,
  ]);
}
