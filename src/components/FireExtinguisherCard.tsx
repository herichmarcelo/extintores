"use client"

import { StatusBadge } from "./StatusBadge"
import { QrCode, MapPin, Calendar, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FireExtinguisherCardProps {
  id: string
  codigo: string
  foto?: string
  status: "em-dia" | "vencendo" | "vencido" | "inspecionado" | "sem-inspecao"
  localizacao: string
  unidade: string
  tipo: string
  capacidade: string
  validade: string
  ultimaInspecao?: string
  className?: string
}

export function FireExtinguisherCard({
  id,
  codigo,
  foto,
  status,
  localizacao,
  unidade,
  tipo,
  capacidade,
  validade,
  ultimaInspecao,
  className
}: FireExtinguisherCardProps) {
  return (
    <Link href={`/extintores/historico/${id}`} className="block">
      <div className={cn(
        "bg-white rounded-2xl border border-[#E5E7EB] p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group",
        className
      )}>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-[#E5E7EB]">
              {foto ? (
                <img src={foto} alt={codigo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#B11226]/10 to-[#FF6A00]/10">
                  <div className="w-10 h-14 rounded bg-[#B11226]"></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-lg truncate">{codigo}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1 truncate">{localizacao}</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">{unidade}</p>
              </div>
              <div className="shrink-0">
                <StatusBadge status={status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Tipo</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{tipo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Validade</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{validade}</p>
                </div>
              </div>
              {ultimaInspecao && (
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-medium">Última inspeção</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{ultimaInspecao}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#B11226] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  )
}
