import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
