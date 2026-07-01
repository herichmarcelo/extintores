"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Flame, Calendar, ShieldCheck, ClipboardList } from "lucide-react"

type KpiType = "total" | "vencidos" | "proximos" | "em-dia" | "inspecoes-hoje"

interface KpiCardProps {
  type: KpiType
  value: number
  label: string
  subtitle?: string
  className?: string
}

export function KpiCard({ type, value, label, subtitle, className }: KpiCardProps) {
  const config = {
    total: {
      icon: Flame,
      color: "text-[#B11226]",
      bg: "bg-[#B11226]/10"
    },
    vencidos: {
      icon: AlertCircle,
      color: "text-[#DC2626]",
      bg: "bg-[#DC2626]/10"
    },
    proximos: {
      icon: Calendar,
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10"
    },
    "em-dia": {
      icon: ShieldCheck,
      color: "text-[#16A34A]",
      bg: "bg-[#16A34A]/10"
    },
    "inspecoes-hoje": {
      icon: ClipboardList,
      color: "text-[#2563EB]",
      bg: "bg-[#2563EB]/10"
    }
  }

  const { icon: Icon, color, bg } = config[type]

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-[#E5E7EB] p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bg)}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
        <div className="flex-1">
          <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
          <p className="text-sm font-bold text-slate-900 mt-2">{label}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

import { AlertCircle } from "lucide-react"
