"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Waves, Sprout } from "lucide-react";
import { crearClienteAction } from "@/app/(dash)/clientes/actions";
import type { Negocio, DatosPersonales } from "@/lib/types";

const inputCls =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-fg outline-none focus:border-accent";

const NEGOCIOS: { value: Negocio; label: string; icon: typeof Waves }[] = [
  { value: "piscinas", label: "Piscinas", icon: Waves },
  { value: "vivero", label: "Vivero", icon: Sprout },
];

function Campo({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-faint">{label}</span>
      <input
        type={type}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function NuevoCliente() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, start] = useTransition();

  const [negocio, setNegocio] = useState<Negocio>("piscinas");
  const [d, setD] = useState<DatosPersonales>({});

  const set = (k: keyof DatosPersonales, v: string) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const puedeGuardar = Boolean(
    (d.nombre && d.nombre.trim()) || (d.telefono && d.telefono.trim())
  );

  const abrir = () => {
    setNegocio("piscinas");
    setD({});
    setOpen(true);
  };

  const guardar = () => {
    if (!puedeGuardar) return;
    start(async () => {
      const id = await crearClienteAction(negocio, d);
      setOpen(false);
      router.push(`/lead/${id}`);
    });
  };

  return (
    <>
      <button
        onClick={abrir}
        className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
      >
        <UserPlus className="h-4 w-4" /> Nuevo cliente
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <UserPlus className="h-4 w-4 text-accent" /> Nuevo cliente presencial
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-faint hover:bg-hover hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 flex gap-2">
              {NEGOCIOS.map((n) => {
                const Icon = n.icon;
                const active = negocio === n.value;
                return (
                  <button
                    key={n.value}
                    onClick={() => setNegocio(n.value)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                      active
                        ? "border-accent bg-accent text-accent-fg"
                        : "border-border text-muted hover:bg-hover"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {n.label}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Nombre" value={d.nombre ?? ""} onChange={(v) => set("nombre", v)} />
              <Campo label="Apellido" value={d.apellido ?? ""} onChange={(v) => set("apellido", v)} />
              <Campo label="DNI" value={d.dni ?? ""} onChange={(v) => set("dni", v)} />
              <Campo label="Teléfono" value={d.telefono ?? ""} onChange={(v) => set("telefono", v)} />
              <Campo label="Email" type="email" value={d.email ?? ""} onChange={(v) => set("email", v)} />
              <Campo label="Dirección" value={d.direccion ?? ""} onChange={(v) => set("direccion", v)} />
              <Campo label="Localidad" value={d.localidad ?? ""} onChange={(v) => set("localidad", v)} />
              <Campo label="Provincia" value={d.provincia ?? ""} onChange={(v) => set("provincia", v)} />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:bg-hover"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!puedeGuardar || saving}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-40"
              >
                {saving ? "Guardando…" : "Crear cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
