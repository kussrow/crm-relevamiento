import { query, queryOne } from "./db";

export interface Respuesta {
  id: number;
  negocio: string | null;
  titulo: string;
  texto: string;
  adjunto_nombre: string | null;
  adjunto_mime: string | null;
  tiene_adjunto: boolean;
  created_at: string;
  updated_at: string;
}

// Metadata (sin los bytes del adjunto, que son pesados).
const SELECT_META = `SELECT id, negocio, titulo, texto, adjunto_nombre, adjunto_mime,
  (adjunto_datos IS NOT NULL) AS tiene_adjunto, created_at, updated_at
  FROM respuestas`;

export async function getRespuestas(negocio?: string | null): Promise<Respuesta[]> {
  if (negocio) {
    return query<Respuesta>(
      `${SELECT_META} WHERE negocio = $1 OR negocio IS NULL ORDER BY titulo`,
      [negocio]
    );
  }
  return query<Respuesta>(`${SELECT_META} ORDER BY negocio NULLS FIRST, titulo`);
}

export async function getRespuesta(id: number): Promise<Respuesta | null> {
  return queryOne<Respuesta>(`${SELECT_META} WHERE id = $1`, [id]);
}

export interface Adjunto {
  datos: Buffer;
  mime: string;
  nombre: string;
}

export async function getAdjunto(id: number): Promise<Adjunto | null> {
  const row = await queryOne<{
    adjunto_datos: Buffer | null;
    adjunto_mime: string | null;
    adjunto_nombre: string | null;
  }>(
    `SELECT adjunto_datos, adjunto_mime, adjunto_nombre FROM respuestas WHERE id = $1`,
    [id]
  );
  if (!row?.adjunto_datos) return null;
  return {
    datos: row.adjunto_datos,
    mime: row.adjunto_mime || "application/octet-stream",
    nombre: row.adjunto_nombre || "adjunto",
  };
}

export async function setAdjunto(
  id: number,
  datos: Buffer,
  mime: string,
  nombre: string
): Promise<void> {
  await query(
    `UPDATE respuestas SET adjunto_datos=$1, adjunto_mime=$2, adjunto_nombre=$3, updated_at=now()
     WHERE id=$4`,
    [datos, mime, nombre, id]
  );
}

export async function clearAdjunto(id: number): Promise<void> {
  await query(
    `UPDATE respuestas SET adjunto_datos=NULL, adjunto_mime=NULL, adjunto_nombre=NULL,
       updated_at=now() WHERE id=$1`,
    [id]
  );
}

export async function createRespuesta(
  negocio: string | null,
  titulo: string,
  texto: string
): Promise<number> {
  const rows = await query<{ id: number }>(
    `INSERT INTO respuestas (negocio, titulo, texto) VALUES ($1,$2,$3) RETURNING id`,
    [negocio, titulo, texto]
  );
  return rows[0].id;
}

export async function updateRespuesta(
  id: number,
  negocio: string | null,
  titulo: string,
  texto: string
): Promise<void> {
  await query(
    `UPDATE respuestas SET negocio=$1, titulo=$2, texto=$3, updated_at=now() WHERE id=$4`,
    [negocio, titulo, texto, id]
  );
}

export async function deleteRespuesta(id: number): Promise<void> {
  await query(`DELETE FROM respuestas WHERE id = $1`, [id]);
}
