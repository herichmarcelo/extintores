"use client" // <-- Adicionado para permitir o uso de estados (useState/useEffect)

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Search, Bell, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

// Se estiver usando Supabase, descomente a linha abaixo:
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Estados dinâmicos para o usuário
  const [userName, setUserName] = useState("CARREGANDO...");
  const [userRole, setUserRole] = useState("...");

  // 2. Efeito para buscar os dados quando o layout carrega
  useEffect(() => {
    async function loadUserData() {
      try {
        // --- INÍCIO DA LÓGICA DE BANCO (Exemplo Supabase) ---
        /*
        const supabase = createClientComponentClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const emailLogado = session.user.email;
          
          // Busca o nome e cargo na sua tabela (ajuste 'usuarios' para o nome correto da sua tabela)
          const { data: usuario } = await supabase
            .from('usuarios')
            .select('nome, cargo')
            .eq('email', emailLogado)
            .single();

          if (usuario) {
            setUserName(usuario.nome);
            setUserRole(usuario.cargo);
            return;
          }
        }
        */
        // --- FIM DA LÓGICA DE BANCO ---

        // Dados simulados para você testar agora (Apague isso quando plugar o banco real acima):
        setUserName("CLEISON RAIMUNDO DO NASCIMENTO");
        setUserRole("BRIGADISTA");

      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        setUserName("Usuário Logado");
        setUserRole("Cargo Indefinido");
      }
    }

    loadUserData();
  }, []);

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
              {/* 3. Aqui injetamos os dados dinâmicos do estado */}
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate max-w-[250px]">
                {userName}
              </p>
              {/* Mudei a cor do cargo para verde (emerald-500) para combinar com a badge de "Brigadista" */}
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                {userRole}
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