import { query, queryOne } from "./db";

// Acceso genérico a la tabla config (key/value).
export async function getConfig(key: string): Promise<string | null> {
  const row = await queryOne<{ value: string }>(
    `SELECT value FROM config WHERE key = $1`,
    [key]
  );
  return row?.value ?? null;
}

export async function setConfig(key: string, value: string): Promise<void> {
  await query(
    `INSERT INTO config (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [key, value]
  );
}

export async function getBot(negocio: string): Promise<boolean> {
  const row = await queryOne<{ value: string }>(
    `SELECT value FROM config WHERE key = $1`,
    [`bot_${negocio}`]
  );
  return row?.value === "on";
}

export async function getAllBots(): Promise<Record<string, boolean>> {
  const rows = await query<{ key: string; value: string }>(
    `SELECT key, value FROM config WHERE key LIKE 'bot_%'`
  );
  const map: Record<string, boolean> = {};
  for (const r of rows) map[r.key.replace("bot_", "")] = r.value === "on";
  return { piscinas: map.piscinas ?? false, vivero: map.vivero ?? false };
}

export async function setBot(negocio: string, enabled: boolean): Promise<void> {
  await query(
    `INSERT INTO config (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [`bot_${negocio}`, enabled ? "on" : "off"]
  );
}
