"use client"

import { Flame, ClipboardCheck, FileText, Building2, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { title: "Extintores", href: "/extintores", icon: Flame },
  { title: "Inspecões", href: "#", icon: ClipboardCheck },
  { title: "Relatórios", href: "/relatorios", icon: FileText },
  { title: "Unidades", href: "/unidades", icon: Building2 },
  { title: "Mais", href: "#", icon: MoreHorizontal }
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-200",
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
