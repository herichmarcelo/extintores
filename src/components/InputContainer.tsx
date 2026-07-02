"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface InputContainerProps {
  children: ReactNode
  className?: string
  icon?: ReactNode
  focusColor?: "red" | "blue"
}

export function InputContainer({ children, className, icon, focusColor = "red" }: InputContainerProps) {
  const focusClasses = {
    red: "focus-within:border-[#B11226] focus-within:ring-2 focus-within:ring-[#B11226]/20",
    blue: "focus-within:border-[#2979ff] focus-within:ring-2 focus-within:ring-[#2979ff]/20",
  }

  const iconFocusClasses = {
    red: "group-focus-within:text-[#B11226]",
    blue: "group-focus-within:text-[#2979ff]",
  }

  return (
    <div className={cn("relative group", className)}>
      {icon && (
        <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors flex items-center justify-center", iconFocusClasses[focusColor])}>
          {icon}
        </div>
      )}
      <div className={cn("pl-12 h-12 bg-white border border-[#E5E7EB] rounded-xl text-sm transition-all font-medium shadow-sm w-full flex items-center", focusClasses[focusColor])}>
        {children}
      </div>
    </div>
  )
}
