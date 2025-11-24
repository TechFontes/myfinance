import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-6 bg-muted/40 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
