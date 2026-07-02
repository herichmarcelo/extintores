"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InputContainer } from "./InputContainer"

interface SelectWithIconProps {
  icon?: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  displayValue?: string
  children?: React.ReactNode
  className?: string
  focusColor?: "red" | "blue"
}

export function SelectWithIcon({
  icon,
  value,
  onValueChange,
  placeholder,
  displayValue,
  children,
  className,
  focusColor = "red",
}: SelectWithIconProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger 
        className={cn(
          // 1. Mudança principal: "flex items-center" garante o alinhamento vertical perfeito com os outros campos
          "flex items-center w-full border-none bg-transparent p-0 shadow-none",
          
          // 2. Matadores de foco (sem alterações, mantém a borda fantasma longe)
          "outline-none ring-0 focus:outline-none focus:ring-0",
          "focus-visible:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0",
          
          // 3. Oculta a seta nativa e garante a largura 100%
          "[&>*:not(:first-child)]:hidden", 
          "[&>*:first-child]:w-full", 
          
          className
        )}
      >
        {/* Passamos h-full aqui para caso você decida forçar uma altura lá no ExtintoresPage */}
        <InputContainer icon={icon} className="w-full h-full" focusColor={focusColor}>
          <div className="flex-1 flex items-center justify-between w-full pr-4">
            <SelectValue placeholder={placeholder}>
              {(args) => (displayValue ? displayValue : args.children)}
            </SelectValue>
            <ChevronDown className="h-4 w-4 text-slate-400 opacity-50" />
          </div>
        </InputContainer>
      </SelectTrigger>
      
      <SelectContent className="w-[var(--radix-select-trigger-width)] rounded-xl border-[#E5E7EB]">
        {children}
      </SelectContent>
    </Select>
  )
}