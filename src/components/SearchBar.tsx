"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (value: string) => void
  onFilterClick?: () => void
  className?: string
}

export function SearchBar({ placeholder = "Buscar equipamento, código ou local...", onSearch, onFilterClick, className }: SearchBarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#B11226] transition-colors" />
        <Input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="pl-12 h-12 bg-white border-[#E5E7EB] rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-[#B11226]/20 focus-visible:border-[#B11226] transition-all font-medium shadow-sm"
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={onFilterClick}
        className="h-12 w-12 rounded-xl border-[#E5E7EB] bg-white hover:border-[#B11226] hover:text-[#B11226] hover:bg-[#B11226]/5 transition-all shadow-sm"
      >
        <Filter className="w-5 h-5" />
      </Button>
    </div>
  )
}

import { cn } from "@/lib/utils"
