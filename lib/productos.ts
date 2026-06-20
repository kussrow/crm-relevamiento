import { query, queryOne } from "./db";
import { getConfig } from "./config";
import type { DuxPrecio } from "./dux";

export interface ProductoDux {
  cod_item: string;
  descripcion: string | null;
  costo: number | null;
  porc_iva: number | null;
  precios: DuxPrecio[];
  stock: number | null;
  updated_at: string;
}

export async function getProductoDux(cod: string): Promise<ProductoDux | null> {
  return queryOne<ProductoDux>(
    `SELECT cod_item, descripcion, costo::float8 AS costo, porc_iva::float8 AS porc_iva,
            precios, stock::float8 AS stock, updated_at
     FROM productos_dux WHERE cod_item = $1`,
    [cod.trim()]
  );
}

export async function buscarProductos(q: string, limit = 15): Promise<ProductoDux[]> {
  return query<ProductoDux>(
    `SELECT cod_item, descripcion, costo::float8 AS costo, porc_iva::float8 AS porc_iva,
            precios, stock::float8 AS stock, updated_at
     FROM productos_dux
     WHERE cod_item ILIKE $1 OR descripcion ILIKE $1
     ORDER BY cod_item LIMIT $2`,
    [`%${q.trim()}%`, limit]
  );
}

export async function contarProductos(): Promise<number> {
  const r = await queryOne<{ count: string }>(`SELECT count(*) FROM productos_dux`);
  return Number(r?.count ?? 0);
}

// Listas de precios distintas presentes en el catálogo (para elegir la default).
export async function listasDePrecios(): Promise<string[]> {
  const rows = await query<{ nombre: string }>(
    `SELECT DISTINCT p->>'nombre' AS nombre
     FROM productos_dux, jsonb_array_elements(precios) AS p
     WHERE p->>'nombre' IS NOT NULL
     ORDER BY 1`
  );
  return rows.map((r) => r.nombre);
}

// Lista de precios configurada como default para un rubro (con fallback global).
export async function getListaPrecioDefault(negocio?: string | null): Promise<string | null> {
  if (negocio) {
    const porRubro = await getConfig(`dux_lista_${negocio}`);
    if (porRubro) return porRubro;
  }
  return getConfig("dux_lista_default");
}

// Precio de un producto según el nombre de lista (0 si no está o no existe).
export function precioPorLista(p: ProductoDux, lista: string | null): number {
  if (!lista) return 0;
  const found = p.precios.find((x) => x.nombre === lista);
  return found ? Number(found.precio) || 0 : 0;
}
