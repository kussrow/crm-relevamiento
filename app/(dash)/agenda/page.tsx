import { getEventos } from "@/lib/eventos";
import Calendario from "@/components/Calendario";

export const dynamic = "force-dynamic";

const pad = (n: number) => String(n).padStart(2, "0");

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const hoy = new Date();
  const match = sp.mes?.match(/^(\d{4})-(\d{2})$/);
  const year = match ? Number(match[1]) : hoy.getFullYear();
  const month = match ? Number(match[2]) - 1 : hoy.getMonth(); // 0-based

  const desde = `${year}-${pad(month + 1)}-01`;
  const hasta =
    month === 11 ? `${year + 1}-01-01` : `${year}-${pad(month + 2)}-01`;

  const eventos = await getEventos(desde, hasta);

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-fg">Agenda</h1>
        <p className="text-sm text-muted">
          Visitas, reuniones, llamadas y seguimientos
        </p>
      </div>
      <Calendario year={year} month={month} eventos={eventos} />
    </div>
  );
}
