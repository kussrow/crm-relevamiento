export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-hover p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-fg">CRM Relevamiento</h1>
          <p className="text-sm text-faint">Piscinas · Vivero Los Aromos</p>
        </div>
        <form action="/api/login" method="post" className="space-y-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Contraseña"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-muted"
          />
          {error && (
            <p className="text-sm text-red-600">Contraseña incorrecta.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
