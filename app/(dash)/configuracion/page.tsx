import { Settings } from "lucide-react";
import { getSesion } from "@/lib/auth";
import { duxConfigurado, getSyncEstado } from "@/lib/dux";
import { contarProductos, listasDePrecios } from "@/lib/productos";
import { getConfig } from "@/lib/config";
import DuxConfig from "@/components/DuxConfig";

export const dynamic = "force-dynamic";

type Scope = "default" | "piscinas" | "vivero";

const ROL_LABEL: Record<string, string> = {
  admin: "Administrador (todos los rubros)",
  piscinas: "Piscinas",
  vivero: "Vivero",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-fg">{value}</span>
    </div>
  );
}

export default async function ConfiguracionPage() {
  const sesion = await getSesion();

  const [productos, listas, estadoSync, lDefault, lPiscinas, lVivero] = await Promise.all([
    contarProductos(),
    listasDePrecios(),
    getSyncEstado(),
    getConfig("dux_lista_default"),
    getConfig("dux_lista_piscinas"),
    getConfig("dux_lista_vivero"),
  ]);

  const listaActual: Record<Scope, string> = {
    default: lDefault ?? "",
    piscinas: lPiscinas ?? "",
    vivero: lVivero ?? "",
  };

  // El admin configura las tres; el usuario restringido solo la de su rubro.
  const scopes: { scope: Scope; label: string }[] = sesion?.negocio
    ? [{ scope: sesion.negocio as Scope, label: sesion.negocio === "piscinas" ? "Piscinas" : "Vivero" }]
    : [
        { scope: "default", label: "General" },
        { scope: "piscinas", label: "Piscinas" },
        { scope: "vivero", label: "Vivero" },
      ];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-5 flex items-center gap-2 text-xl font-semibold text-fg">
        <Settings className="h-5 w-5 text-accent" /> Configuración
      </h1>

      <section className="mb-4 rounded-lg border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-fg">Cuenta</h2>
        <Row label="Usuario" value={sesion?.usuario ?? "—"} />
        <Row label="Rol" value={ROL_LABEL[sesion?.rol ?? "admin"] ?? sesion?.rol} />
        <Row
          label="Acceso"
          value={sesion?.negocio ? ROL_LABEL[sesion.negocio] : "Piscinas · Vivero"}
        />
      </section>

      <DuxConfig
        configurado={duxConfigurado()}
        productos={productos}
        listas={listas}
        estadoInicial={estadoSync}
        listaActual={listaActual}
        scopes={scopes}
      />

      <section className="mb-4 rounded-lg border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-fg">Apariencia</h2>
        <p className="text-sm text-muted">
          Cambiá entre modo claro y oscuro con el botón de sol/luna en la barra
          superior. La preferencia se guarda en este dispositivo.
        </p>
      </section>

      <section className="mb-4 rounded-lg border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-fg">Seguridad</h2>
        <p className="text-sm text-muted">
          Los usuarios y contraseñas se configuran en el servidor (variables{" "}
          <code className="rounded bg-hover px-1 py-0.5 text-xs">CRM_PASS_ADMIN</code>,{" "}
          <code className="rounded bg-hover px-1 py-0.5 text-xs">CRM_PASS_PISCINAS</code> y{" "}
          <code className="rounded bg-hover px-1 py-0.5 text-xs">CRM_PASS_VIVERO</code>).
          Para cambiarlos, editá el archivo{" "}
          <code className="rounded bg-hover px-1 py-0.5 text-xs">.env</code> del CRM y reiniciá el
          contenedor.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-fg">Sistema</h2>
        <Row label="App" value="CRM Relevamiento" />
        <Row label="Datos" value="WhatsApp → n8n → CRM" />
      </section>
    </div>
  );
}
