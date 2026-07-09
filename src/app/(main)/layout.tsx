"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserCircle } from "lucide-react";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#B11226] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="min-h-screen bg-[#F8F9FA]">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
          <div>
            <h1 className="text-xl font-black text-[#B11226] uppercase leading-none tracking-tight">
              Extintores
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Matriz e Unidades
            </p>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-10 items-center gap-6 border-b border-slate-100 bg-white px-8 h-20">
          <SidebarTrigger className="h-10 w-10" />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900">Extintores</h1>
            <p className="text-sm text-slate-500 font-medium">Matriz e Unidades</p>
          </div>
          <div className="flex items-center gap-6 ml-auto">
            <div className="text-right">
              {/* NOME E CARGO DINÂMICOS */}
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate max-w-[250px]">
                {session?.user?.name || "Usuário Logado"}
              </p>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                {session?.user?.perfil || "Usuário"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
              <UserCircle className="h-8 w-8 text-slate-400" />
            </div>
          </div>
        </header>

        <main className="p-0 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}