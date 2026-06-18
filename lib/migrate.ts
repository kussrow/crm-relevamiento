import { pool } from "./db";
import { SCHEMA_SQL } from "./schema";

let done = false;

export async function runMigrations() {
  if (done) return;
  try {
    await pool.query(SCHEMA_SQL);
    done = true;
    console.log("[crm] esquema verificado/creado");
  } catch (e) {
    console.error("[crm] error en la migración:", e);
  }
}
