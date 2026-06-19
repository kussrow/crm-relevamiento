"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronRight, FileDown, Pencil } from "lucide-react";
import { formatMoneda } from "@/lib/format";
import { NegocioBadge } from "@/components/badges";
import { formatFecha, PRESU_ESTADO_INFO } from "@/lib/scoring";
import BotonEliminarPresupuesto from "@/components/BotonEliminarPresupuesto";
import type { Presupuesto, Negocio } from "@/lib/types";

function fmtVence(v: string | null): string {
  return v ? v.split("-").reverse().join("/") : "—";
}

export default function PresupuestosTabla({
  presupuestos,
}: {
  presupuestos: Presupuesto[];
}) {
  const [abierto, setAbierto] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setAbierto((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-hover text-left text-xs uppercase tracking-wide text-muted">
            <th className="w-8 px-2 py-3"></th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Negocio</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 text-right font-medium">Fecha</th>
            <th className="px-2 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {presupuestos.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-faint">
                Todavía no hay presupuestos. Creá el primero con “Nuevo presupuesto”.
              </td>
            </tr>
          )}
          {presupuestos.map((p) => {
            const est = PRESU_ESTADO_INFO[p.estado] ?? PRESU_ESTADO_INFO.borrador;
            const open = abierto.has(p.id);
            const items = (p.items || []).filter((i) => i.descripcion);
            return (
              <Fragment key={p.id}>
                <tr className="border-b border-border last:border-0 hover:bg-hover">
                  <td className="px-2 py-3">
                    <button
                      onClick={() => toggle(p.id)}
                      title={open ? "Contraer" : "Ver detalle"}
                      className="rounded-md p-1 text-faint transition-colors hover:bg-hover hover:text-fg"
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/presupuestos/${p.id}`} className="font-medium text-fg">
                      {p.cliente || "Sin cliente"}
                    </Link>
                    <div className="text-xs text-faint">{p.telefono}</div>
                  </td>
                  <td className="px-4 py-3">
                    {p.negocio && <NegocioBadge value={p.negocio as Negocio} />}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${est.badge}`}
                    >
                      {est.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-fg">
                    {formatMoneda(p.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-faint">
                    {formatFecha(p.created_at)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      <Link
                        href={`/presupuestos/${p.id}`}
                        title="Editar"
                        className="rounded-md p-1.5 text-faint transition-colors hover:bg-hover hover:text-accent"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <a
                        href={`/pdf/presupuesto/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Descargar PDF"
                        className="rounded-md p-1.5 text-faint transition-colors hover:bg-hover hover:text-accent"
                      >
                        <FileDown className="h-4 w-4" />
                      </a>
                      <BotonEliminarPresupuesto id={p.id} />
                    </div>
                  </td>
                </tr>

                {open && (
                  <tr className="border-b border-border bg-hover/40">
                    <td />
                    <td colSpan={6} className="px-4 py-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint">
                            Ítems
                          </div>
                          {items.length === 0 ? (
                            <p className="text-sm text-faint">Sin ítems cargados.</p>
                          ) : (
                            <table className="w-full text-sm">
                              <tbody>
                                {items.map((it, i) => (
                                  <tr key={i} className="border-b border-border/60 last:border-0">
                                    <td className="py-1.5 pr-2 text-fg">{it.descripcion}</td>
                                    <td className="py-1.5 text-right text-muted">
                                      {it.cantidad} × {formatMoneda(it.precio)}
                                    </td>
                                    <td className="py-1.5 pl-2 text-right font-medium text-fg">
                                      {formatMoneda(
                                        (Number(it.cantidad) || 0) * (Number(it.precio) || 0)
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          {p.notas && (
                            <p className="mt-3 whitespace-pre-wrap text-xs text-muted">
                              {p.notas}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-faint">Total</span>
                            <span className="font-semibold text-fg">{formatMoneda(p.total)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-faint">Vence</span>
                            <span className="text-fg">{fmtVence(p.vence_el)}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Link
                              href={`/presupuestos/${p.id}`}
                              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:bg-hover hover:text-fg"
                            >
                              Editar
                            </Link>
                            <a
                              href={`/pdf/presupuesto/${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:bg-hover hover:text-fg"
                            >
                              <FileDown className="h-3.5 w-3.5" /> PDF
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
