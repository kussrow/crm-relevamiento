import { query, queryOne } from "./db";
import type {
  Lead,
  ClienteLead,
  Estado,
  Negocio,
  DatosPersonales,
  DatosFacturacion,
} from "./types";

export interface LeadFilters {
  negocio?: string;
  estado?: string;
  temperatura?: string;
  categoria?: string;
  q?: string;
  sort?: "score" | "fecha";
}

function buildWhere(filters: LeadFilters): { whereSql: string; params: unknown[] } {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters.negocio) {
    params.push(filters.negocio);
    where.push(`negocio = $${params.length}`);
  }
  if (filters.estado) {
    params.push(filters.estado);
    where.push(`estado = $${params.length}`);
  }
  if (filters.temperatura) {
    params.push(filters.temperatura);
    where.push(`temperatura = $${params.length}`);
  }
  if (filters.categoria) {
    params.push(filters.categoria);
    where.push(`categoria = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q}%`);
    where.push(
      `(nombre ILIKE $${params.length} OR mensaje ILIKE $${params.length} OR telefono ILIKE $${params.length})`
    );
  }

  return { whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

export async function getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  const { whereSql, params } = buildWhere(filters);
  const orderSql =
    filters.sort === "fecha"
      ? "ORDER BY fecha_mensaje DESC NULLS LAST"
      : "ORDER BY score DESC, fecha_mensaje DESC NULLS LAST";

  return query<Lead>(
    `SELECT * FROM leads ${whereSql} ${orderSql} LIMIT 500`,
    params
  );
}

// Una fila por cliente: agrupa los leads por teléfono (o por id cuando no hay
// teléfono) y devuelve el lead más reciente como representante, junto con el
// total de consultas y el mejor score del cliente.
export async function getClientes(filters: LeadFilters = {}): Promise<ClienteLead[]> {
  const { whereSql, params } = buildWhere(filters);
  const orderSql =
    filters.sort === "fecha"
      ? "ORDER BY r.fecha_mensaje DESC NULLS LAST"
      : "ORDER BY a.max_score DESC, r.fecha_mensaje DESC NULLS LAST";

  return query<ClienteLead>(
    `WITH base AS (SELECT * FROM leads ${whereSql}),
     keyed AS (
       SELECT *, COALESCE(NULLIF(telefono, ''), 'lead-' || id::text) AS ckey FROM base
     ),
     agg AS (
       SELECT ckey,
              count(*)::int        AS consultas,
              bool_or(requiere_humano) AS any_humano,
              max(score)           AS max_score
       FROM keyed GROUP BY ckey
     ),
     ranked AS (
       SELECT k.*,
              row_number() OVER (
                PARTITION BY ckey
                ORDER BY fecha_mensaje DESC NULLS LAST, id DESC
              ) AS rn
       FROM keyed k
     )
     SELECT r.*, a.consultas, a.any_humano, a.max_score
     FROM ranked r JOIN agg a USING (ckey)
     WHERE r.rn = 1
     ${orderSql}
     LIMIT 500`,
    params
  );
}

export async function getLead(id: number): Promise<Lead | null> {
  return queryOne<Lead>(`SELECT * FROM leads WHERE id = $1`, [id]);
}

export interface LeadOpcion {
  id: number;
  nombre: string | null;
  telefono: string | null;
  negocio: Negocio;
  datos_personales: DatosPersonales | null;
  datos_facturacion: DatosFacturacion | null;
}

// Leads con datos cargados a mano (personales o de facturación), para elegir
// al armar un presupuesto.
export async function getLeadsCompletos(): Promise<LeadOpcion[]> {
  return query<LeadOpcion>(
    `SELECT id, nombre, telefono, negocio, datos_personales, datos_facturacion
     FROM leads
     WHERE datos_personales IS NOT NULL OR datos_facturacion IS NOT NULL
     ORDER BY updated_at DESC
     LIMIT 200`
  );
}

// Clientes = leads cuyos datos ya cargamos a mano (personales o de facturación).
export async function getClientesConDatos(q?: string): Promise<Lead[]> {
  const params: unknown[] = [];
  let extra = "";
  if (q) {
    params.push(`%${q}%`);
    extra = ` AND (nombre ILIKE $1 OR telefono ILIKE $1
      OR datos_personales->>'nombre' ILIKE $1
      OR datos_personales->>'apellido' ILIKE $1
      OR datos_facturacion->>'razon_social' ILIKE $1
      OR datos_facturacion->>'cuit' ILIKE $1)`;
  }
  return query<Lead>(
    `SELECT * FROM leads
     WHERE (datos_personales IS NOT NULL OR datos_facturacion IS NOT NULL)${extra}
     ORDER BY updated_at DESC
     LIMIT 500`,
    params
  );
}

export interface LeadInput {
  negocio?: string;
  fecha_mensaje?: string;
  nombre?: string;
  telefono?: string;
  tipo_mensaje?: string;
  mensaje?: string;
  categoria?: string;
  subcategoria?: string;
  producto?: string;
  detalle?: string;
  ciudad?: string;
  provincia?: string;
  intencion?: string;
  urgencia?: string;
  requiere_humano?: boolean | string;
  resumen?: string;
  pregunta?: string;
  forma_pago?: string;
  precio?: string;
  cantidad?: string;
  problema?: string;
  respuesta_sugerida?: string;
  etiquetas?: string;
  raw?: unknown;
}

export async function insertLead(d: LeadInput): Promise<number> {
  const rh = d.requiere_humano === true || d.requiere_humano === "true";
  const rows = await query<{ id: number }>(
    `INSERT INTO leads (
       negocio, fecha_mensaje, nombre, telefono, tipo_mensaje, mensaje,
       categoria, subcategoria, producto, detalle, ciudad, provincia,
       intencion, urgencia, requiere_humano, resumen, pregunta,
       forma_pago, precio, cantidad, problema, respuesta_sugerida, etiquetas, raw
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
     ) RETURNING id`,
    [
      d.negocio || "otro",
      d.fecha_mensaje || null,
      d.nombre || null,
      d.telefono || null,
      d.tipo_mensaje || null,
      d.mensaje || null,
      d.categoria || null,
      d.subcategoria || null,
      d.producto || null,
      d.detalle || null,
      d.ciudad || null,
      d.provincia || null,
      d.intencion || null,
      d.urgencia || null,
      rh,
      d.resumen || null,
      d.pregunta || null,
      d.forma_pago || null,
      d.precio || null,
      d.cantidad || null,
      d.problema || null,
      d.respuesta_sugerida || null,
      d.etiquetas || null,
      d.raw ? JSON.stringify(d.raw) : null,
    ]
  );
  return rows[0]?.id;
}

// Leads prioritarios para atender desde el dashboard:
// calientes o que requieren humano, todavía sin cerrar.
export async function getPrioritarios(): Promise<Lead[]> {
  return query<Lead>(
    `SELECT * FROM leads
     WHERE estado IN ('nuevo', 'contactado')
       AND (temperatura = 'caliente' OR requiere_humano = true)
     ORDER BY score DESC, fecha_mensaje DESC NULLS LAST
     LIMIT 6`
  );
}

export async function updateEstado(id: number, estado: Estado): Promise<void> {
  await query(
    `UPDATE leads SET estado = $1, updated_at = now() WHERE id = $2`,
    [estado, id]
  );
}

// Mueve a un estado todas las consultas de un mismo cliente (teléfono).
export async function updateEstadoByTelefono(
  telefono: string,
  estado: Estado
): Promise<void> {
  await query(
    `UPDATE leads SET estado = $1, updated_at = now() WHERE telefono = $2`,
    [estado, telefono]
  );
}

export async function deleteLead(id: number): Promise<void> {
  await query(`DELETE FROM leads WHERE id = $1`, [id]);
}

export async function updateNotas(id: number, notas: string): Promise<void> {
  await query(`UPDATE leads SET notas = $1, updated_at = now() WHERE id = $2`, [
    notas,
    id,
  ]);
}

export async function updateDatosPersonales(
  id: number,
  datos: DatosPersonales
): Promise<void> {
  await query(
    `UPDATE leads SET datos_personales = $1, updated_at = now() WHERE id = $2`,
    [JSON.stringify(datos), id]
  );
}

export async function updateDatosFacturacion(
  id: number,
  datos: DatosFacturacion
): Promise<void> {
  await query(
    `UPDATE leads SET datos_facturacion = $1, updated_at = now() WHERE id = $2`,
    [JSON.stringify(datos), id]
  );
}

export async function getCategorias(negocio?: string): Promise<string[]> {
  const params: unknown[] = [];
  let whereSql = "WHERE categoria IS NOT NULL AND categoria <> ''";
  if (negocio) {
    params.push(negocio);
    whereSql += ` AND negocio = $${params.length}`;
  }
  const rows = await query<{ categoria: string }>(
    `SELECT DISTINCT categoria FROM leads ${whereSql} ORDER BY categoria`,
    params
  );
  return rows.map((r) => r.categoria);
}

export interface Metrics {
  total: number;
  porNegocio: { negocio: Negocio; total: number }[];
  porTemperatura: { temperatura: string; total: number }[];
  porEstado: { estado: string; total: number }[];
  porCategoria: { categoria: string; total: number }[];
  porDia: { dia: string; total: number }[];
  requiereHumano: number;
}

export async function getMetrics(negocio?: string): Promise<Metrics> {
  const params: unknown[] = [];
  let whereSql = "";
  if (negocio) {
    params.push(negocio);
    whereSql = `WHERE negocio = $1`;
  }

  const [total] = await query<{ count: string }>(
    `SELECT count(*) FROM leads ${whereSql}`,
    params
  );
  const porNegocio = await query<{ negocio: Negocio; total: string }>(
    `SELECT negocio, count(*) AS total FROM leads ${whereSql} GROUP BY negocio ORDER BY negocio`,
    params
  );
  const porTemperatura = await query<{ temperatura: string; total: string }>(
    `SELECT temperatura, count(*) AS total FROM leads ${whereSql} GROUP BY temperatura`,
    params
  );
  const porEstado = await query<{ estado: string; total: string }>(
    `SELECT estado, count(*) AS total FROM leads ${whereSql} GROUP BY estado`,
    params
  );
  const porCategoria = await query<{ categoria: string; total: string }>(
    `SELECT categoria, count(*) AS total FROM leads ${whereSql} GROUP BY categoria ORDER BY total DESC LIMIT 10`,
    params
  );
  const porDia = await query<{ dia: string; total: string }>(
    `SELECT to_char(date_trunc('day', fecha_mensaje), 'YYYY-MM-DD') AS dia, count(*) AS total
     FROM leads ${whereSql ? whereSql + " AND" : "WHERE"} fecha_mensaje IS NOT NULL
     GROUP BY 1 ORDER BY 1 DESC LIMIT 14`,
    params
  );
  const [rh] = await query<{ count: string }>(
    `SELECT count(*) FROM leads ${whereSql ? whereSql + " AND" : "WHERE"} requiere_humano = true`,
    params
  );

  const num = (s: string) => parseInt(s, 10) || 0;
  return {
    total: num(total.count),
    porNegocio: porNegocio.map((r) => ({ negocio: r.negocio, total: num(r.total) })),
    porTemperatura: porTemperatura.map((r) => ({
      temperatura: r.temperatura,
      total: num(r.total),
    })),
    porEstado: porEstado.map((r) => ({ estado: r.estado, total: num(r.total) })),
    porCategoria: porCategoria.map((r) => ({
      categoria: r.categoria,
      total: num(r.total),
    })),
    porDia: porDia.map((r) => ({ dia: r.dia, total: num(r.total) })).reverse(),
    requiereHumano: num(rh.count),
  };
}
