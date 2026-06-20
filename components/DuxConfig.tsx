"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { setListaPrecioAction } from "@/app/(dash)/configuracion/actions";

type Estado = {
  estado: "idle" | "corriendo" | "ok" | "error";
  hechos: number;
  total: number;
  ultimo: string | null;
  error?: string;
};

type Scope = "default" | "piscinas" | "vivero";

const inputCls =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-fg outline-none focus:border-accent";

function fmtFecha(iso: string | null): string {
  if (!iso) return "nunca";
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DuxConfig({
  configurado,
  productos,
  listas,
  estadoInicial,
  listaActual,
  scopes,
}: {
  configurado: boolean;
  productos: number;
  listas: string[];
  estadoInicial: Estado;
  listaActual: Record<Scope, string>;
  scopes: { scope: Scope; label: string }[];
}) {
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  const [guardado, setGuardado] = useState<Scope | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = async () => {
    const r = await fetch("/api/dux/sync").then((x) => x.json());
    setEstado(r);
    if (r.estado !== "corriendo" && timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => {
    if (estadoInicial.estado === "corriendo" && !timer.current) {
      timer.current = setInterval(poll, 3000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sincronizar = async () => {
    setEstado((e) => ({ ...e, estado: "corriendo", hechos: 0 }));
    await fetch("/api/dux/sync", { method: "POST" });
    if (!timer.current) timer.current = setInterval(poll, 3000);
  };

  const guardarLista = async (scope: Scope, lista: string) => {
    await setListaPrecioAction(scope, lista);
    setGuardado(scope);
    setTimeout(() => setGuardado(null), 1500);
  };

  const corriendo = estado.estado === "corriendo";
  const pct = estado.total ? Math.round((estado.hechos / estado.total) * 100) : 0;

  return (
    <section className="mb-4 rounded-lg border border-border bg-card p-5">
      <h2 className="mb-2 text-sm font-semibold text-fg">Productos (Dux Software)</h2>

      {!configurado ? (
        <p className="text-sm text-muted">
          Falta configurar las variables <code className="rounded bg-hover px-1 text-xs">DUX_API_URL</code>{" "}
          y <code className="rounded bg-hover px-1 text-xs">DUX_API_TOKEN</code> en el servidor.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={sincronizar}
              disabled={corriendo}
              className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${corriendo ? "animate-spin" : ""}`} />
              {corriendo ? "Sincronizando…" : "Sincronizar catálogo"}
            </button>
            <div className="text-sm text-muted">
              {productos} producto{productos === 1 ? "" : "s"} · última: {fmtFecha(estado.ultimo)}
            </div>
          </div>

          {corriendo && (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-hover">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1 text-xs text-faint">
                {estado.hechos} / {estado.total} ({pct}%) · puede tardar varios minutos
              </div>
            </div>
          )}
          {estado.estado === "error" && (
            <p className="mt-2 text-xs text-red-500">Error en la sincronización: {estado.error}</p>
          )}

          {/* Lista de precios por defecto */}
          <div className="mt-4 border-t border-border pt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
              Lista de precios para presupuestos
            </div>
            {listas.length === 0 ? (
              <p className="text-sm text-faint">
                Sincronizá el catálogo para poder elegir la lista de precios.
              </p>
            ) : (
              <div className="space-y-3">
                {scopes.map(({ scope, label }) => (
                  <label key={scope} className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-sm text-muted">
                      {label}
                      {guardado === scope && (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </span>
                    <select
                      className={`${inputCls} w-full min-w-0`}
                      defaultValue={listaActual[scope] ?? ""}
                      onChange={(e) => guardarLista(scope, e.target.value)}
                    >
                      <option value="">— sin definir —</option>
                      {listas.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-faint">
              El precio por rubro tiene prioridad sobre el general.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
