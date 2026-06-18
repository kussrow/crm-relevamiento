export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-3xl">💬</div>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">CRM Relevamiento</h1>
          <p className="text-sm text-slate-400">Piscinas · Vivero Los Aromos</p>
        </div>
        <form action="/api/login" method="post" className="space-y-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Contraseña"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          {error && (
            <p className="text-sm text-red-600">Contraseña incorrecta.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
