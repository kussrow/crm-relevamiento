export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-fg">{value}</span>
    </div>
  );
}

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-5 text-xl font-semibold text-fg">Configuración</h1>

      <section className="mb-4 rounded-lg border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-fg">Cuenta</h2>
        <Row label="Usuario" value="admin" />
        <Row label="Negocios" value="Piscinas · Vivero" />
      </section>

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
          La contraseña de acceso se configura en el servidor (variable{" "}
          <code className="rounded bg-hover px-1 py-0.5 text-xs">CRM_PASSWORD</code>).
          Para cambiarla, editá el archivo <code className="rounded bg-hover px-1 py-0.5 text-xs">.env</code>{" "}
          del CRM y reiniciá el contenedor.
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
