import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Search, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col min-h-screen bg-[#fdfcf9]">
        <header className="sticky top-0 z-10 flex h-20 items-center gap-6 border-b border-slate-100 bg-white px-8">
          <SidebarTrigger className="h-10 w-10" />
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Buscar equipamentos..."
                className="pl-12 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#9d1d36]/20 transition-all font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Inspetor Bello</p>
              <p className="text-[10px] font-black text-[#c25848] uppercase tracking-[0.2em]">SESMT Alimentos</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
              <UserCircle className="h-8 w-8 text-slate-400" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
