import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getSesion } from "@/lib/auth";

export default async function DashLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sesion = await getSesion();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          usuario={sesion?.usuario ?? ""}
          rol={sesion?.rol ?? "admin"}
          negocio={sesion?.negocio ?? null}
        />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
