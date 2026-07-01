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
    <div className={cn("flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl", className)}>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-200",
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
