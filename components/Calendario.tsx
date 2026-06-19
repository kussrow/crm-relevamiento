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
  Pencil,
  User,
  Clock,
  Filter,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { EVENTO_INFO } from "@/lib/scoring";
import { TIPOS_EVENTO, type TipoEvento, type Evento } from "@/lib/types";
import {
  crearEventoAction,
  actualizarEventoAction,
  eliminarEventoAction,
  toggleEventoAction,
} from "@/app/(dash)/agenda/actions";

const pad = (n: number) => String(n).padStart(2, "0");
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const inputCls =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-fg outline-none focus:border-accent";

const horaDe = (iso: string) => iso.slice(11, 16);

function fechaLarga(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface ClienteOpcion {
  id: number;
  nombre: string;
  telefono: string;
}

export default function Calendario({
  year,
  month,
  eventos,
  clientes = [],
}: {
  year: number;
  month: number; // 0-based
  eventos: Evento[];
  clientes?: ClienteOpcion[];
}) {
  const router = useRouter();
  const [, start] = useTransition();

  const [vista, setVista] = useState<"mes" | "agenda">("mes");
  const [activos, setActivos] = useState<Set<TipoEvento>>(new Set(TIPOS_EVENTO));

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form
  const [tipo, setTipo] = useState<TipoEvento>("visita");
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [leadId, setLeadId] = useState<number | null>(null);
  const [notas, setNotas] = useState("");
  const [hecho, setHecho] = useState(false);

  // Al elegir/escribir un cliente: si coincide con uno guardado, autocompletamos
  // su teléfono y lo vinculamos (lead_id).
  const onClienteChange = (nombre: string) => {
    setCliente(nombre);
    const match = clientes.find(
      (c) => c.nombre.toLowerCase() === nombre.trim().toLowerCase()
    );
    if (match) {
      setLeadId(match.id);
      if (match.telefono) setTelefono(match.telefono);
    } else {
      setLeadId(null);
    }
  };

  const todosActivos = activos.size === TIPOS_EVENTO.length;
  const toggleFiltro = (t: TipoEvento) =>
    setActivos((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next.size === 0 ? new Set(TIPOS_EVENTO) : next;
    });

  const visibles = eventos.filter((e) => activos.has(e.tipo));

  const porDia: Record<string, Evento[]> = {};
  for (const e of visibles) {
    const dia = e.fecha.slice(0, 10);
    (porDia[dia] ??= []).push(e);
  }

  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
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
    setEditId(null);
    setTipo("visita");
    setTitulo("");
    setFecha(dia ? `${dia}T09:00` : "");
    setCliente("");
    setTelefono("");
    setLeadId(null);
    setNotas("");
    setHecho(false);
    setModalOpen(true);
  };

  const abrirEditar = (e: Evento) => {
    setEditId(e.id);
    setTipo(e.tipo);
    setTitulo(e.titulo);
    setFecha(e.fecha);
    setCliente(e.cliente ?? "");
    setTelefono(e.telefono ?? "");
    setLeadId(e.lead_id ?? null);
    setNotas(e.notas ?? "");
    setHecho(e.hecho);
    setModalOpen(true);
  };

  const guardar = () => {
    if (!titulo.trim() || !fecha) return;
    const data = { tipo, titulo, fecha, cliente, telefono, notas, lead_id: leadId };
    start(async () => {
      if (editId) await actualizarEventoAction(editId, data);
      else await crearEventoAction(data);
      setModalOpen(false);
      router.refresh();
    });
  };

  const eliminar = () =>
    editId &&
    start(async () => {
      await eliminarEventoAction(editId);
      setModalOpen(false);
      router.refresh();
    });

  const marcarHecho = () =>
    editId &&
    start(async () => {
      await toggleEventoAction(editId, !hecho);
      setModalOpen(false);
      router.refresh();
    });

  const toggleDesdeLista = (e: Evento) =>
    start(async () => {
      await toggleEventoAction(e.id, !e.hecho);
      router.refresh();
    });

  const btnVista = (v: "mes" | "agenda", label: string, Icon: typeof CalendarDays) => (
    <button
      onClick={() => setVista(v)}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
        vista === v
          ? "bg-accent text-accent-fg font-medium"
          : "text-muted hover:bg-hover hover:text-fg"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Columna izquierda: acción + filtros */}
      <aside className="lg:w-60 lg:shrink-0">
        <button
          onClick={() => abrirNuevo()}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-fg shadow-sm transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" /> Nuevo evento
        </button>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Filter className="h-3.5 w-3.5" /> Filtro de actividad
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => setActivos(new Set(TIPOS_EVENTO))}
              className={`flex w-full items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                todosActivos
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border text-muted hover:bg-hover"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-80" />
              Todos
            </button>
            {TIPOS_EVENTO.map((t) => {
              const info = EVENTO_INFO[t];
              const active = activos.has(t) && !todosActivos;
              return (
                <button
                  key={t}
                  onClick={() => toggleFiltro(t)}
                  className={`flex w-full items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    activos.has(t)
                      ? `border-transparent ${info.badge}`
                      : "border-border text-faint hover:bg-hover"
                  } ${active ? "ring-1 ring-inset ring-current/20" : ""}`}
                >
                  <span className={`h-2 w-2 rounded-full ${info.dot}`} />
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Columna principal */}
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/agenda")}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-hover hover:text-fg"
            >
              Hoy
            </button>
            <button
              onClick={() => irMes(-1)}
              className="rounded-md border border-border p-1.5 text-muted hover:bg-hover hover:text-fg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => irMes(1)}
              className="rounded-md border border-border p-1.5 text-muted hover:bg-hover hover:text-fg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <h2 className="ml-1 text-base font-semibold capitalize text-fg">{labelMes}</h2>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
            {btnVista("mes", "Mes", CalendarDays)}
            {btnVista("agenda", "Agenda", CalendarRange)}
          </div>
        </div>

        {vista === "mes" ? (
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
                  return (
                    <div
                      key={`b${i}`}
                      className="min-h-28 border-b border-r border-border bg-hover/30"
                    />
                  );
                const dia = `${year}-${pad(month + 1)}-${pad(d)}`;
                const evs = porDia[dia] ?? [];
                return (
                  <div key={dia} className="group min-h-28 border-b border-r border-border p-1.5">
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
                        className="rounded p-0.5 text-faint opacity-0 transition-opacity hover:bg-hover hover:text-accent group-hover:opacity-100"
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
                            onClick={() => abrirEditar(e)}
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
        ) : (
          <AgendaLista
            porDia={porDia}
            onEditar={abrirEditar}
            onToggle={toggleDesdeLista}
          />
        )}
      </div>

      {/* Modal alta / edición */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-fg">
                {editId ? "Editar evento" : "Nuevo evento"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-faint hover:bg-hover hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-1.5 text-xs uppercase tracking-wide text-faint">
                  Tipo de evento
                </div>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_EVENTO.map((t) => {
                    const info = EVENTO_INFO[t];
                    const Icon = info.icon;
                    const active = tipo === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipo(t)}
                        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                          active
                            ? `border-transparent ${info.solid}`
                            : `border-border ${info.text} hover:bg-hover`
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>
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
                  list="clientes-guardados"
                  value={cliente}
                  onChange={(e) => onClienteChange(e.target.value)}
                />
                <datalist id="clientes-guardados">
                  {clientes.map((c) => (
                    <option key={c.id} value={c.nombre}>
                      {c.telefono}
                    </option>
                  ))}
                </datalist>
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
            <div className="mt-4 flex items-center gap-2">
              {editId && (
                <>
                  <button
                    onClick={marcarHecho}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted hover:bg-hover hover:text-fg"
                  >
                    <Check className="h-4 w-4" />
                    {hecho ? "Pendiente" : "Hecho"}
                  </button>
                  <button
                    onClick={eliminar}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted hover:border-red-300 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setModalOpen(false)}
                className="ml-auto rounded-md border border-border px-4 py-2 text-sm text-muted hover:bg-hover"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!titulo.trim() || !fecha}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-40"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgendaLista({
  porDia,
  onEditar,
  onToggle,
}: {
  porDia: Record<string, Evento[]>;
  onEditar: (e: Evento) => void;
  onToggle: (e: Evento) => void;
}) {
  const dias = Object.keys(porDia).sort();

  if (dias.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-faint">
        No hay eventos para mostrar este mes.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {dias.map((dia) => (
        <div key={dia}>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h3 className="text-sm font-semibold capitalize text-fg">{fechaLarga(dia)}</h3>
          </div>
          <div className="space-y-2">
            {porDia[dia]
              .slice()
              .sort((a, b) => a.fecha.localeCompare(b.fecha))
              .map((e) => {
                const info = EVENTO_INFO[e.tipo];
                return (
                  <div
                    key={e.id}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-accent/40"
                  >
                    <button
                      onClick={() => onToggle(e)}
                      title={e.hecho ? "Marcar pendiente" : "Marcar hecho"}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        e.hecho
                          ? "border-accent bg-accent text-accent-fg"
                          : "border-border text-transparent hover:border-accent"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </button>

                    <div className={`min-w-0 flex-1 ${e.hecho ? "opacity-60" : ""}`}>
                      <div className="flex items-center gap-2 text-xs text-faint">
                        <Clock className="h-3.5 w-3.5" />
                        {horaDe(e.fecha)} hs
                        <span
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ${info.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
                          {info.label}
                        </span>
                      </div>
                      <div className={`mt-0.5 truncate font-medium ${e.hecho ? "line-through text-muted" : "text-fg"}`}>
                        {e.titulo}
                      </div>
                      {(e.cliente || e.telefono) && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                          <User className="h-3 w-3" />
                          {e.cliente}
                          {e.telefono ? ` · ${e.telefono}` : ""}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => onEditar(e)}
                        title="Editar"
                        className="rounded-md p-1.5 text-faint hover:bg-hover hover:text-accent"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
