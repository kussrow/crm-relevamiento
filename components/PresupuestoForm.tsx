"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Send, Save } from "lucide-react";
import {
  guardarPresupuesto,
  eliminarPresupuesto,
  enviarPresupuesto,
} from "@/app/(dash)/presupuestos/actions";
import { formatMoneda } from "@/lib/format";
import { ESTADOS_PRESUPUESTO } from "@/lib/types";
import type { Presupuesto, PresupuestoItem, EstadoPresupuesto } from "@/lib/types";

export default function PresupuestoForm({
  presupuesto,
  prefill,
}: {
  presupuesto: Presupuesto | null;
  prefill?: { cliente?: string; telefono?: string; negocio?: string; lead_id?: number };
}) {
  const router = useRouter();
  const [id, setId] = useState<number | null>(presupuesto?.id ?? null);
  const [cliente, setCliente] = useState(presupuesto?.cliente ?? prefill?.cliente ?? "");
  const [telefono, setTelefono] = useState(presupuesto?.telefono ?? prefill?.telefono ?? "");
  const [negocio, setNegocio] = useState(presupuesto?.negocio ?? prefill?.negocio ?? "piscinas");
  const [estado, setEstado] = useState<EstadoPresupuesto>(presupuesto?.estado ?? "borrador");
  const [notas, setNotas] = useState(presupuesto?.notas ?? "");
  const [items, setItems] = useState<PresupuestoItem[]>(
    presupuesto?.items?.length ? presupuesto.items : [{ descripcion: "", cantidad: 1, precio: 0 }]
  );
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const lead_id = presupuesto?.lead_id ?? prefill?.lead_id ?? null;
  const total = items.reduce((a, b) => a + (Number(b.cantidad) || 0) * (Number(b.precio) || 0), 0);

  const updateItem = (i: number, field: keyof PresupuestoItem, val: string) =>
    setItems(
      items.map((it, idx) =>
        idx === i ? { ...it, [field]: field === "descripcion" ? val : Number(val) } : it
      )
    );
  const addItem = () => setItems([...items, { descripcion: "", cantidad: 1, precio: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const guardar = (after?: "enviar") =>
    start(async () => {
      setMsg(null);
      const data = { cliente, telefono, negocio, estado, notas, items, lead_id };
      const pid = await guardarPresupuesto(id, data);
      setId(pid);
      if (after === "enviar") {
        const r = await enviarPresupuesto(pid);
        if (r.ok) {
          setEstado("enviado");
          setMsg("Presupuesto enviado por WhatsApp ✓");
        } else {
          setMsg(`Error al enviar: ${r.error}`);
        }
      } else {
        setMsg("Guardado ✓");
        if (!presupuesto) router.replace(`/presupuestos/${pid}`);
      }
    });

  const eliminar = () => {
    if (!id) {
      router.push("/presupuestos");
      return;
    }
    if (!confirm("¿Eliminar este presupuesto?")) return;
    start(async () => {
      await eliminarPresupuesto(id);
      router.push("/presupuestos");
    });
  };

  const inputCls =
    "rounded-md border border-border bg-card px-3 py-2 text-sm text-fg outline-none focus:border-muted";

  return (
    <div className="space-y-4">
      {/* Datos del cliente */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Cliente</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={inputCls}
            placeholder="Nombre del cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Teléfono (ej. 549351...)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <select className={inputCls} value={negocio} onChange={(e) => setNegocio(e.target.value)}>
            <option value="piscinas">Piscinas</option>
            <option value="vivero">Vivero</option>
          </select>
          <select
            className={inputCls}
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPresupuesto)}
          >
            {ESTADOS_PRESUPUESTO.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Ítems */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-fg">Ítems</h2>
        <div className="space-y-2">
          <div className="hidden grid-cols-[1fr_5rem_7rem_6rem_2rem] gap-2 px-1 text-xs text-faint sm:grid">
            <span>Descripción</span>
            <span>Cant.</span>
            <span>Precio unit.</span>
            <span className="text-right">Subtotal</span>
            <span />
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_5rem_7rem_6rem_2rem]">
              <input
                className={`${inputCls} col-span-2 sm:col-span-1`}
                placeholder="Descripción"
                value={it.descripcion}
                onChange={(e) => updateItem(i, "descripcion", e.target.value)}
              />
              <input
                className={inputCls}
                type="number"
                min={0}
                value={it.cantidad}
                onChange={(e) => updateItem(i, "cantidad", e.target.value)}
              />
              <input
                className={inputCls}
                type="number"
                min={0}
                value={it.precio}
                onChange={(e) => updateItem(i, "precio", e.target.value)}
              />
              <div className="flex items-center justify-end text-sm font-medium text-fg">
                {formatMoneda((Number(it.cantidad) || 0) * (Number(it.precio) || 0))}
              </div>
              <button
                onClick={() => removeItem(i)}
                className="flex items-center justify-center rounded-md p-1.5 text-faint hover:bg-hover hover:text-red-500"
                title="Quitar ítem"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-3 flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-hover hover:text-fg"
        >
          <Plus className="h-4 w-4" /> Agregar ítem
        </button>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-3">
          <span className="text-sm text-muted">Total</span>
          <span className="text-xl font-semibold text-fg">{formatMoneda(total)}</span>
        </div>
      </section>

      {/* Notas */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-fg">Notas / condiciones</h2>
        <textarea
          className={`${inputCls} w-full`}
          rows={3}
          placeholder="Validez del presupuesto, formas de pago, plazos…"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </section>

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => guardar()}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-40"
        >
          <Save className="h-4 w-4" /> Guardar
        </button>
        <button
          onClick={() => guardar("enviar")}
          disabled={pending || !telefono}
          title={!telefono ? "Cargá un teléfono primero" : "Enviar al cliente"}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          <Send className="h-4 w-4" /> Enviar por WhatsApp
        </button>
        <button
          onClick={eliminar}
          disabled={pending}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted hover:border-red-300 hover:text-red-500 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" /> Eliminar
        </button>
      </div>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
    </div>
  );
}
