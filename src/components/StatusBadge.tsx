"use client"

import { CheckCircle, Clock, AlertCircle, FileCheck, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "em-dia" | "vencendo" | "vencido" | "inspecionado" | "sem-inspecao"

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    "em-dia": {
      label: "Em dia",
      icon: CheckCircle,
      color: "text-[#16A34A]",
      bg: "bg-[#16A34A]/10",
      border: "border-[#16A34A]/20"
    },
    "vencendo": {
      label: "Vencendo",
      icon: Clock,
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10",
      border: "border-[#F59E0B]/20"
    },
    "vencido": {
      label: "Vencido",
      icon: AlertCircle,
      color: "text-[#DC2626]",
      bg: "bg-[#DC2626]/10",
      border: "border-[#DC2626]/20"
    },
    "inspecionado": {
      label: "Inspecionado",
      icon: FileCheck,
      color: "text-[#2563EB]",
      bg: "bg-[#2563EB]/10",
      border: "border-[#2563EB]/20"
    },
    "sem-inspecao": {
      label: "Sem inspeção",
      icon: HelpCircle,
      color: "text-slate-500",
      bg: "bg-slate-100",
      border: "border-slate-200"
    }
  }

  const { label, icon: Icon, color, bg, border } = config[status]

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200",
      bg, color, border, className
    )}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}
