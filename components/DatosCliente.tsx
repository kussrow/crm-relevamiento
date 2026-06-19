"use client";

import { useState, useTransition } from "react";
import { User, ReceiptText } from "lucide-react";
import {
  setDatosPersonalesAction,
  setDatosFacturacionAction,
} from "@/app/(dash)/lead/[id]/actions";
import { CONDICIONES_IVA } from "@/lib/types";
import type { DatosPersonales, DatosFacturacion } from "@/lib/types";

const inputCls =
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-fg outline-none focus:border-muted";

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-faint">{label}</span>
      <input
        type={type}
        className={inputCls}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function DatosCliente({
  id,
  personales,
  facturacion,
  fallback,
}: {
  id: number;
  personales: DatosPersonales | null;
  facturacion: DatosFacturacion | null;
  fallback: {
    nombre?: string | null;
    telefono?: string | null;
    localidad?: string | null;
    provincia?: string | null;
  };
}) {
  // Si todavía no hay datos personales, precargamos lo que vino del mensaje.
  const [per, setPer] = useState<DatosPersonales>(
    personales ?? {
      nombre: fallback.nombre ?? "",
      telefono: fallback.telefono ?? "",
      localidad: fallback.localidad ?? "",
      provincia: fallback.provincia ?? "",
    }
  );
  const [fac, setFac] = useState<DatosFacturacion>(facturacion ?? {});

  const [savingPer, startPer] = useTransition();
  const [savingFac, startFac] = useTransition();
  const [okPer, setOkPer] = useState(false);
  const [okFac, setOkFac] = useState(false);

  const setP = (k: keyof DatosPersonales, v: string) => {
    setPer((p) => ({ ...p, [k]: v }));
    setOkPer(false);
  };
  const setF = (k: keyof DatosFacturacion, v: string) => {
    setFac((f) => ({ ...f, [k]: v }));
    setOkFac(false);
  };

  const guardarPer = () =>
    startPer(async () => {
      await setDatosPersonalesAction(id, per);
      setOkPer(true);
    });
  const guardarFac = () =>
    startFac(async () => {
      await setDatosFacturacionAction(id, fac);
      setOkFac(true);
    });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Datos personales */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-fg">
          <User className="h-4 w-4 text-muted" /> Datos personales
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Nombre" value={per.nombre ?? ""} onChange={(v) => setP("nombre", v)} />
          <Campo label="Apellido" value={per.apellido ?? ""} onChange={(v) => setP("apellido", v)} />
          <Campo label="DNI" value={per.dni ?? ""} onChange={(v) => setP("dni", v)} />
          <Campo label="Teléfono" value={per.telefono ?? ""} onChange={(v) => setP("telefono", v)} />
          <Campo
            label="Email"
            type="email"
            value={per.email ?? ""}
            onChange={(v) => setP("email", v)}
          />
          <Campo label="Dirección" value={per.direccion ?? ""} onChange={(v) => setP("direccion", v)} />
          <Campo label="Localidad" value={per.localidad ?? ""} onChange={(v) => setP("localidad", v)} />
          <Campo label="Provincia" value={per.provincia ?? ""} onChange={(v) => setP("provincia", v)} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={guardarPer}
            disabled={savingPer}
            className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg disabled:opacity-40"
          >
            {savingPer ? "Guardando…" : "Guardar datos personales"}
          </button>
          {okPer && <span className="text-sm text-emerald-600">✓ Guardado</span>}
        </div>
      </section>

      {/* Datos de facturación */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-fg">
          <ReceiptText className="h-4 w-4 text-muted" /> Datos de facturación
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo
            label="Razón social"
            value={fac.razon_social ?? ""}
            onChange={(v) => setF("razon_social", v)}
          />
          <Campo label="CUIT / CUIL" value={fac.cuit ?? ""} onChange={(v) => setF("cuit", v)} />
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-faint">
              Condición frente al IVA
            </span>
            <select
              className={inputCls}
              value={fac.condicion_iva ?? ""}
              onChange={(e) => setF("condicion_iva", e.target.value)}
            >
              <option value="">—</option>
              {CONDICIONES_IVA.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <Campo
            label="Email de facturación"
            type="email"
            value={fac.email_facturacion ?? ""}
            onChange={(v) => setF("email_facturacion", v)}
          />
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs uppercase tracking-wide text-faint">
              Domicilio fiscal
            </span>
            <input
              className={inputCls}
              value={fac.domicilio_fiscal ?? ""}
              onChange={(e) => setF("domicilio_fiscal", e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={guardarFac}
            disabled={savingFac}
            className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg disabled:opacity-40"
          >
            {savingFac ? "Guardando…" : "Guardar facturación"}
          </button>
          {okFac && <span className="text-sm text-emerald-600">✓ Guardado</span>}
        </div>
      </section>
    </div>
  );
}
