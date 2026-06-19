"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, GripVertical } from "lucide-react";
import { TemperaturaBadge, NegocioBadge } from "@/components/badges";
import { ESTADO_INFO, timeAgo } from "@/lib/scoring";
import { ESTADOS, type Estado } from "@/lib/types";
import type { ClienteLead } from "@/lib/types";
import { moverClienteAction } from "@/app/(dash)/bandeja/actions";

export default function BandejaKanban({ clientes }: { clientes: ClienteLead[] }) {
  // Estado local para mover tarjetas de forma optimista; se resincroniza
  // cuando el servidor revalida y llegan nuevos props.
  const [items, setItems] = useState<ClienteLead[]>(clientes);
  const [prev, setPrev] = useState(clientes);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Estado | null>(null);
  const [, start] = useTransition();

  // Resincroniza con los datos del servidor cuando cambian (patrón de React
  // para ajustar estado durante el render, sin useEffect).
  if (prev !== clientes) {
    setPrev(clientes);
    setItems(clientes);
  }

  const mover = (cliente: ClienteLead, estado: Estado) => {
    if (cliente.estado === estado) return;
    setItems((prev) =>
      prev.map((c) => (c.ckey === cliente.ckey ? { ...c, estado } : c))
    );
    start(() => moverClienteAction(cliente.telefono, cliente.id, estado));
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {ESTADOS.map((estado) => {
        const info = ESTADO_INFO[estado];
        const cards = items.filter((c) => c.estado === estado);
        return (
          <div
            key={estado}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(estado);
            }}
            onDragLeave={() => setOverCol((c) => (c === estado ? null : c))}
            onDrop={() => {
              const c = items.find((x) => x.ckey === dragKey);
              if (c) mover(c, estado);
              setDragKey(null);
              setOverCol(null);
            }}
            className={`flex w-72 shrink-0 flex-col rounded-lg border bg-card/50 transition-colors ${
              overCol === estado ? "border-accent bg-hover" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium text-fg">
                <span className={`h-2 w-2 rounded-full ${info.dot}`} />
                {info.label}
              </span>
              <span className="rounded-full bg-hover px-2 py-0.5 text-xs text-muted">
                {cards.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-2">
              {cards.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-faint">
                  Sin clientes
                </p>
              )}
              {cards.map((c) => (
                <article
                  key={c.ckey}
                  draggable
                  onDragStart={() => setDragKey(c.ckey)}
                  onDragEnd={() => {
                    setDragKey(null);
                    setOverCol(null);
                  }}
                  className={`group cursor-grab rounded-md border border-border bg-card p-3 shadow-sm transition-opacity active:cursor-grabbing ${
                    dragKey === c.ckey ? "opacity-40" : ""
                  }`}
                >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <Link
                      href={`/lead/${c.id}`}
                      className="font-medium text-fg hover:underline"
                    >
                      {c.nombre || "Sin nombre"}
                    </Link>
                    <GripVertical className="h-4 w-4 shrink-0 text-faint opacity-0 group-hover:opacity-100" />
                  </div>

                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <TemperaturaBadge value={c.temperatura} />
                    <NegocioBadge value={c.negocio} />
                    {c.any_humano && (
                      <AlertTriangle
                        className="h-3.5 w-3.5 text-red-500"
                        aria-label="Requiere atención"
                      />
                    )}
                  </div>

                  {(c.resumen || c.mensaje) && (
                    <p className="mb-2 line-clamp-2 text-xs text-muted">
                      {c.resumen || c.mensaje}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-faint">
                    <span>
                      {c.consultas} consulta{c.consultas === 1 ? "" : "s"}
                    </span>
                    <span>{timeAgo(c.fecha_mensaje)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
