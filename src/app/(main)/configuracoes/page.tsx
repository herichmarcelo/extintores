"use client"

import { BottomNavigation } from "@/components/BottomNavigation"

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-4 lg:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configurações</h1>
          <p className="text-sm text-slate-500 mt-2">Gerencie as configurações do sistema</p>
        </div>

        <div className="grid gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Em Breve</h2>
            <p className="text-slate-500">Página de configurações em desenvolvimento.</p>
          </div>
        </div>
      </div>

      <div className="lg:hidden mt-auto">
        <BottomNavigation />
      </div>
    </div>
  )
}
