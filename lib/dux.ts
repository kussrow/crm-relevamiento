import { query } from "./db";
import { getConfig, setConfig } from "./config";

const BASE = process.env.DUX_API_URL || "";
const TOKEN = process.env.DUX_API_TOKEN || "";

// Dux limita a 1 request cada 5 segundos.
const RATE_MS = 5200;
const PAGE = 50;

export interface DuxPrecio {
  id: number;
  nombre: string;
  precio: string;
}

interface DuxItem {
  cod_item: string;
  item: string;
  costo: string | null;
  porc_iva: string | null;
  precios?: DuxPrecio[];
  stock?: { stock_disponible?: string }[];
}

interface DuxPage {
  paging: { total: number; offset: number; limit: number };
  results: DuxItem[];
}

export function duxConfigurado(): boolean {
  return Boolean(BASE && TOKEN);
}

export async function fetchItemsPage(offset: number, limit = PAGE): Promise<DuxPage> {
  const res = await fetch(`${BASE}/items?offset=${offset}&limit=${limit}`, {
    headers: { accept: "application/json", authorization: TOKEN },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Dux items ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

function stockTotal(item: DuxItem): number {
  return (item.stock || []).reduce((a, s) => a + (Number(s.stock_disponible) || 0), 0);
}

export async function upsertItems(items: DuxItem[]): Promise<void> {
  for (const it of items) await upsertItem(it);
}

async function upsertItem(it: DuxItem): Promise<void> {
  await query(
    `INSERT INTO productos_dux (cod_item, descripcion, costo, porc_iva, precios, stock, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6, now())
     ON CONFLICT (cod_item) DO UPDATE SET
       descripcion = $2, costo = $3, porc_iva = $4, precios = $5, stock = $6, updated_at = now()`,
    [
      it.cod_item,
      it.item ?? null,
      it.costo ? Number(it.costo) : null,
      it.porc_iva ? Number(it.porc_iva) : null,
      JSON.stringify(it.precios ?? []),
      stockTotal(it),
    ]
  );
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface SyncEstado {
  estado: "idle" | "corriendo" | "ok" | "error";
  hechos: number;
  total: number;
  ultimo: string | null;
  error?: string;
}

export async function getSyncEstado(): Promise<SyncEstado> {
  const [estado, prog, ultimo, error] = await Promise.all([
    getConfig("dux_sync_estado"),
    getConfig("dux_sync_progreso"),
    getConfig("dux_sync_ultimo"),
    getConfig("dux_sync_error"),
  ]);
  const p = prog ? (JSON.parse(prog) as { hechos: number; total: number }) : { hechos: 0, total: 0 };
  return {
    estado: (estado as SyncEstado["estado"]) || "idle",
    hechos: p.hechos,
    total: p.total,
    ultimo,
    error: estado === "error" ? error ?? undefined : undefined,
  };
}

// Sincroniza todo el catálogo de Dux a productos_dux. Pensado para correr en
// segundo plano (no se await-ea desde la request). Respeta el rate limit.
export async function sincronizarCatalogo(): Promise<void> {
  if (!duxConfigurado()) throw new Error("Dux no configurado");
  const actual = await getConfig("dux_sync_estado");
  if (actual === "corriendo") return; // evita syncs concurrentes

  await setConfig("dux_sync_estado", "corriendo");
  await setConfig("dux_sync_error", "");
  await setConfig("dux_sync_progreso", JSON.stringify({ hechos: 0, total: 0 }));

  try {
    let offset = 0;
    let total = Infinity;
    let hechos = 0;
    while (offset < total) {
      const page = await fetchItemsPage(offset);
      total = page.paging.total;
      if (!page.results.length) break;
      for (const it of page.results) {
        await upsertItem(it);
        hechos++;
      }
      await setConfig("dux_sync_progreso", JSON.stringify({ hechos, total }));
      offset += PAGE;
      if (offset < total) await delay(RATE_MS);
    }
    await setConfig("dux_sync_estado", "ok");
    await setConfig("dux_sync_ultimo", new Date().toISOString());
  } catch (e) {
    await setConfig("dux_sync_estado", "error");
    await setConfig("dux_sync_error", String(e));
  }
}
