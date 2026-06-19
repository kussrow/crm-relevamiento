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
  "rounded-md border border-border bg-card px-3 py-2 text-sm text-fg outline-none focus:border-accent";

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
  const [tab, setTab] = useState<"personales" | "facturacion">("personales");

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

  const tabBtn = (
    value: "personales" | "facturacion",
    label: string,
    Icon: typeof User
  ) => (
    <button
      onClick={() => setTab(value)}
      className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
        tab === value
          ? "border-accent text-accent"
          : "border-transparent text-muted hover:text-fg"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <section className="flex h-[28rem] flex-col rounded-lg border border-border bg-card">
      <div className="flex border-b border-border">
        {tabBtn("personales", "Datos personales", User)}
        {tabBtn("facturacion", "Datos de facturación", ReceiptText)}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {tab === "personales" ? (
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
        ) : (
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
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-border p-4">
        {tab === "personales" ? (
          <>
            <button
              onClick={guardarPer}
              disabled={savingPer}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-40"
            >
              {savingPer ? "Guardando…" : "Guardar datos personales"}
            </button>
            {okPer && <span className="text-sm text-emerald-600">✓ Guardado</span>}
          </>
        ) : (
          <>
            <button
              onClick={guardarFac}
              disabled={savingFac}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-40"
            >
              {savingFac ? "Guardando…" : "Guardar facturación"}
            </button>
            {okFac && <span className="text-sm text-emerald-600">✓ Guardado</span>}
          </>
        )}
      </div>
    </section>
  );
}
