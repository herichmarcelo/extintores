"use client"

import { cn } from "@/lib/utils"

type FilterType = "todos" | "pendentes" | "vencidos" | "vencendo" | "em-dia" | "inspecionados"

interface FilterTabsProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  className?: string
}

const filters: { value: FilterType; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendentes", label: "Pendentes" },
  { value: "vencidos", label: "Vencidos" },
  { value: "vencendo", label: "Vencendo" },
  { value: "em-dia", label: "Em dia" },
  { value: "inspecionados", label: "Inspecionados" }
]

export function FilterTabs({ activeFilter, onFilterChange, className }: FilterTabsProps) {
  return (
    // 1. Adicionado 'overflow-x-auto' para permitir a rolagem e 'no-scrollbar' para esconder a barra
    <div className={cn("flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar", className)}>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            // 2. Adicionado 'whitespace-nowrap' (texto não quebra) e 'shrink-0' (botão não amassa)
            "px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0",
            activeFilter === filter.value
              ? "bg-white text-[#B11226] shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}