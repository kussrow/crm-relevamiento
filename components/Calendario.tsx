"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { EVENTO_INFO } from "@/lib/scoring";
import { TIPOS_EVENTO, type TipoEvento, type Evento } from "@/lib/types";
import {
  crearEventoAction,
  eliminarEventoAction,
  toggleEventoAction,
} from "@/app/(dash)/agenda/actions";

const pad = (n: number) => String(n).padStart(2, "0");
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const inputCls =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-fg outline-none focus:border-muted";

function horaDe(iso: string) {
  return iso.slice(11, 16); // 'HH:MM'
}

export default function Calendario({
  year,
  month,
  eventos,
}: {
  year: number;
  month: number; // 0-based
  eventos: Evento[];
}) {
  const router = useRouter();
  const [, start] = useTransition();

  const [formOpen, setFormOpen] = useState(false);
  const [sel, setSel] = useState<Evento | null>(null);

  // Form
  const [tipo, setTipo] = useState<TipoEvento>("visita");
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");

  const porDia: Record<string, Evento[]> = {};
  for (const e of eventos) {
    const dia = e.fecha.slice(0, 10);
    (porDia[dia] ??= []).push(e);
  }

  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // lunes primero
  const celdas: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];

  const hoy = new Date();
  const esHoy = (d: number) =>
    hoy.getFullYear() === year && hoy.getMonth() === month && hoy.getDate() === d;

  const labelMes = new Date(year, month, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const irMes = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    router.push(`/agenda?mes=${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  };

  const abrirNuevo = (dia?: string) => {
    setTipo("visita");
    setTitulo("");
    setFecha(dia ? `${dia}T09:00` : "");
    setCliente("");
    setTelefono("");
    setNotas("");
    setFormOpen(true);
  };

  const guardar = () => {
    if (!titulo.trim() || !fecha) return;
    start(async () => {
      await crearEventoAction({ tipo, titulo, fecha, cliente, telefono, notas });
      setFormOpen(false);
      router.refresh();
    });
  };

  const eliminar = (id: number) =>
    start(async () => {
      await eliminarEventoAction(id);
      setSel(null);
      router.refresh();
    });

  const toggle = (e: Evento) =>
    start(async () => {
      await toggleEventoAction(e.id, !e.hecho);
      setSel(null);
      router.refresh();
    });

  return (
    <div>
      {/* Barra de navegación */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => irMes(-1)}
            className="rounded-md border border-border p-1.5 text-muted hover:bg-hover hover:text-fg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-44 text-center text-sm font-medium capitalize text-fg">
            {labelMes}
          </span>
          <button
            onClick={() => irMes(1)}
            className="rounded-md border border-border p-1.5 text-muted hover:bg-hover hover:text-fg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push("/agenda")}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-hover hover:text-fg"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {TIPOS_EVENTO.map((t) => (
              <span key={t} className="flex items-center gap-1 text-xs text-muted">
                <span className={`h-2 w-2 rounded-full ${EVENTO_INFO[t].dot}`} />
                {EVENTO_INFO[t].label}
              </span>
            ))}
          </div>
          <button
            onClick={() => abrirNuevo()}
            className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nuevo evento
          </button>
        </div>
      </div>

      {/* Grilla */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border bg-hover text-center text-xs font-medium uppercase tracking-wide text-muted">
          {DIAS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {celdas.map((d, i) => {
            if (d === null)
              return <div key={`b${i}`} className="min-h-28 border-b border-r border-border bg-card/40" />;
            const dia = `${year}-${pad(month + 1)}-${pad(d)}`;
            const evs = porDia[dia] ?? [];
            return (
              <div
                key={dia}
                className="group min-h-28 border-b border-r border-border p-1.5"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      esHoy(d)
                        ? "bg-accent font-semibold text-accent-fg"
                        : "text-muted"
                    }`}
                  >
                    {d}
                  </span>
                  <button
                    onClick={() => abrirNuevo(dia)}
                    title="Agregar"
                    className="rounded p-0.5 text-faint opacity-0 transition-opacity hover:bg-hover hover:text-fg group-hover:opacity-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {evs.slice(0, 3).map((e) => {
                    const info = EVENTO_INFO[e.tipo];
                    return (
                      <button
                        key={e.id}
                        onClick={() => setSel(e)}
                        className={`flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left text-xs hover:bg-hover ${
                          e.hecho ? "opacity-50" : ""
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${info.dot}`} />
                        <span className="shrink-0 text-faint">{horaDe(e.fecha)}</span>
                        <span className={`truncate ${e.hecho ? "line-through" : "text-fg"}`}>
                          {e.titulo}
                        </span>
                      </button>
                    );
                  })}
                  {evs.length > 3 && (
                    <div className="px-1.5 text-[11px] text-faint">+{evs.length - 3} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: nuevo evento */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-fg">Nuevo evento</h2>
              <button
                onClick={() => setFormOpen(false)}
                className="rounded p-1 text-faint hover:bg-hover hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <select
                className={`${inputCls} w-full`}
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoEvento)}
              >
                {TIPOS_EVENTO.map((t) => (
                  <option key={t} value={t}>
                    {EVENTO_INFO[t].label}
                  </option>
                ))}
              </select>
              <input
                className={`${inputCls} w-full`}
                placeholder="Título (ej. Visita a obra)"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                autoFocus
              />
              <input
                type="datetime-local"
                className={`${inputCls} w-full`}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={inputCls}
                  placeholder="Cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                />
                <input
                  className={inputCls}
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
              <textarea
                className={`${inputCls} w-full`}
                rows={3}
                placeholder="Notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:bg-hover"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!titulo.trim() || !fecha}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-40"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: detalle de evento */}
      {sel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSel(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${EVENTO_INFO[sel.tipo].badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${EVENTO_INFO[sel.tipo].dot}`} />
                {EVENTO_INFO[sel.tipo].label}
              </span>
              <button
                onClick={() => setSel(null)}
                className="rounded p-1 text-faint hover:bg-hover hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className={`text-base font-semibold ${sel.hecho ? "line-through text-muted" : "text-fg"}`}>
              {sel.titulo}
            </h2>
            <div className="mt-1 text-sm text-muted">
              {sel.fecha.slice(8, 10)}/{sel.fecha.slice(5, 7)}/{sel.fecha.slice(0, 4)} ·{" "}
              {horaDe(sel.fecha)} hs
            </div>
            {(sel.cliente || sel.telefono) && (
              <div className="mt-2 text-sm text-fg">
                {sel.cliente}
                {sel.telefono ? ` · ${sel.telefono}` : ""}
              </div>
            )}
            {sel.notas && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{sel.notas}</p>
            )}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => toggle(sel)}
                className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
              >
                <Check className="h-4 w-4" />
                {sel.hecho ? "Marcar pendiente" : "Marcar hecho"}
              </button>
              <button
                onClick={() => eliminar(sel.id)}
                className="ml-auto flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted hover:border-red-300 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
