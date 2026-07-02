"use client"

import { 
  LayoutDashboard, 
  Flame, 
  Droplets, 
  Building2, 
  FileText, 
  Users, 
  Settings 
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Extintores", href: "/extintores", icon: Flame },
  { title: "Hidrantes", href: "/hidrantes", icon: Droplets },
  { title: "Unidades", href: "/unidades", icon: Building2 },
  { title: "Relatórios", href: "/relatorios", icon: FileText },
  { title: "Usuários", href: "/usuarios", icon: Users },
  { title: "Config.", href: "/configuracoes", icon: Settings }, // Abreviei para caber melhor
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] z-50 safe-area-pb">
      {/* 
        Alterado para 'overflow-x-auto' para permitir que o usuário deslize para o lado.
        A classe 'no-scrollbar' (veja a dica abaixo) esconde a barra de rolagem visualmente.
      */}
      <div className="flex items-center h-16 w-full overflow-x-auto px-2 no-scrollbar">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                // min-w-[72px] e shrink-0 garantem que os botões não sejam esmagados
                "flex flex-col items-center justify-center gap-1 min-w-[72px] px-2 py-2 transition-all duration-200 shrink-0",
                isActive ? "text-[#B11226]" : "text-slate-500"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive ? "scale-110" : "")} />
              <span className="text-[10px] font-bold tracking-wide">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}