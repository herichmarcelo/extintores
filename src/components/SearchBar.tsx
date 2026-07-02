"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { InputContainer } from "./InputContainer"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (value: string) => void
  className?: string
  focusColor?: "red" | "blue"
}

export function SearchBar({ placeholder = "Buscar equipamento, código ou local...", onSearch, className, focusColor = "red" }: SearchBarProps) {
  return (
    <InputContainer icon={<Search className="w-5 h-5" />} className={className} focusColor={focusColor}>
      <Input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="h-full w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 shadow-none text-inherit font-inherit"
      />
    </InputContainer>
  )
}
