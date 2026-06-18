// Se ejecuta una vez al arrancar el servidor (Next.js instrumentation).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runMigrations } = await import("./lib/migrate");
    await runMigrations();
  }
}
