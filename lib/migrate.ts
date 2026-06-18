import { pool } from "./db";
import { SCHEMA_SQL } from "./schema";

let done = false;

// Reintenta hasta que Postgres esté listo (evita la condición de carrera al arrancar).
export async function runMigrations() {
  if (done) return;
  for (let i = 1; i <= 12; i++) {
    try {
      await pool.query(SCHEMA_SQL);
      done = true;
      console.log("[crm] esquema verificado/creado");
      return;
    } catch (e) {
      console.warn(
        `[crm] base no lista, reintento ${i}/12: ${(e as Error).message}`
      );
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.error("[crm] no se pudo crear el esquema tras 12 intentos");
}
