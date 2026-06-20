"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Copy, Check, X, Paperclip } from "lucide-react";
import {
  crearRespuestaAction,
  editarRespuestaAction,
  eliminarRespuestaAction,
} from "@/app/(dash)/respuestas/actions";
import { NEGOCIO_INFO } from "@/lib/scoring";
import type { Respuesta } from "@/lib/respuestas";
import type { Negocio } from "@/lib/types";

const inputCls =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-fg outline-none focus:border-accent";

export default function RespuestasManager({
  respuestas,
  negocioFijo,
}: {
  respuestas: Respuesta[];
  negocioFijo: Negocio | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editId, setEditId] = useState<number | "nuevo" | null>(null);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [negocio, setNegocio] = useState<string>(negocioFijo ?? "");
  const [copiado, setCopiado] = useState<number | null>(null);
  // Adjunto: archivo nuevo a subir, si ya tiene uno, y si se pidió quitarlo.
  const [archivo, setArchivo] = useState<File | null>(null);
  const [adjuntoActual, setAdjuntoActual] = useState<string | null>(null);
  const [quitarAdjunto, setQuitarAdjunto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const limpiarArchivo = () => {
    setArchivo(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const abrirNuevo = () => {
    setEditId("nuevo");
    setTitulo("");
    setTexto("");
    setNegocio(negocioFijo ?? "");
    setAdjuntoActual(null);
    setQuitarAdjunto(false);
    limpiarArchivo();
  };
  const abrirEditar = (r: Respuesta) => {
    setEditId(r.id);
    setTitulo(r.titulo);
    setTexto(r.texto);
    setNegocio(r.negocio ?? "");
    setAdjuntoActual(r.tiene_adjunto ? r.adjunto_nombre || "adjunto" : null);
    setQuitarAdjunto(false);
    limpiarArchivo();
  };
  const cerrar = () => setEditId(null);

  const guardar = () => {
    if (!titulo.trim() || !texto.trim()) return;
    const neg = negocio || null;
    start(async () => {
      let id: number | null = typeof editId === "number" ? editId : null;
      if (editId === "nuevo") {
        const r = await crearRespuestaAction(neg, titulo, texto);
        id = r.id ?? null;
      } else if (id) {
        await editarRespuestaAction(id, neg, titulo, texto);
      }
      if (id) {
        if (archivo) {
          const fd = new FormData();
          fd.append("id", String(id));
          fd.append("file", archivo);
          await fetch("/api/respuestas/adjunto", { method: "POST", body: fd });
        } else if (quitarAdjunto) {
          await fetch(`/api/respuestas/adjunto?id=${id}`, { method: "DELETE" });
        }
      }
      cerrar();
      router.refresh();
    });
  };

  const eliminar = (id: number) => {
    if (!confirm("¿Eliminar esta respuesta?")) return;
    start(async () => {
      await eliminarRespuestaAction(id);
      router.refresh();
    });
  };

  const copiar = (r: Respuesta) => {
    navigator.clipboard?.writeText(r.texto).then(() => {
      setCopiado(r.id);
      setTimeout(() => setCopiado(null), 1500);
    });
  };

  const formAbierto = editId !== null;

  return (
    <div className="space-y-4">
      {!formAbierto && (
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" /> Nueva respuesta
        </button>
      )}

      {formAbierto && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg">
              {editId === "nuevo" ? "Nueva respuesta" : "Editar respuesta"}
            </h2>
            <button onClick={cerrar} className="rounded p-1 text-faint hover:bg-hover hover:text-fg">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              className={`${inputCls} w-full`}
              placeholder="Título (ej. Horario de atención)"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              autoFocus
            />
            <textarea
              className={`${inputCls} w-full`}
              rows={4}
              placeholder="Texto del mensaje…"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            {!negocioFijo && (
              <select
                className={`${inputCls} w-full`}
                value={negocio}
                onChange={(e) => setNegocio(e.target.value)}
              >
                <option value="">Todos los rubros</option>
                <option value="piscinas">Piscinas</option>
                <option value="vivero">Vivero</option>
              </select>
            )}

            {/* Adjunto */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                setArchivo(e.target.files?.[0] ?? null);
                setQuitarAdjunto(false);
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-hover hover:text-fg"
              >
                <Paperclip className="h-4 w-4" /> Adjuntar archivo
              </button>
              {archivo ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-hover px-2 py-1 text-xs text-fg">
                  {archivo.name}
                  <button onClick={limpiarArchivo} className="text-faint hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : adjuntoActual && !quitarAdjunto ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-hover px-2 py-1 text-xs text-fg">
                  <Paperclip className="h-3 w-3 text-faint" /> {adjuntoActual}
                  <button
                    onClick={() => setQuitarAdjunto(true)}
                    title="Quitar adjunto"
                    className="text-faint hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : quitarAdjunto ? (
                <span className="text-xs text-faint">Se quitará el adjunto al guardar</span>
              ) : null}
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={cerrar}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:bg-hover"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={pending || !titulo.trim() || !texto.trim()}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-40"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {respuestas.length === 0 && !formAbierto ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-faint">
          Todavía no hay respuestas. Creá la primera.
        </div>
      ) : (
        <div className="space-y-2">
          {respuestas.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-fg">{r.titulo}</span>
                  {r.negocio ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-faint">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          NEGOCIO_INFO[r.negocio as Negocio]?.dot ?? "bg-faint"
                        }`}
                      />
                      {NEGOCIO_INFO[r.negocio as Negocio]?.label ?? r.negocio}
                    </span>
                  ) : (
                    <span className="text-xs text-faint">Todos</span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => copiar(r)}
                    title="Copiar texto"
                    className="rounded-md p-1.5 text-faint hover:bg-hover hover:text-accent"
                  >
                    {copiado === r.id ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => abrirEditar(r)}
                    title="Editar"
                    className="rounded-md p-1.5 text-faint hover:bg-hover hover:text-accent"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => eliminar(r.id)}
                    title="Eliminar"
                    className="rounded-md p-1.5 text-faint hover:bg-hover hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted">{r.texto}</p>
              {r.tiene_adjunto && (
                <a
                  href={`/api/respuestas/adjunto?id=${r.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-hover hover:text-accent"
                >
                  <Paperclip className="h-3 w-3" /> {r.adjunto_nombre || "Ver adjunto"}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
