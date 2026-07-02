"use client"

import { StatusBadge } from "./StatusBadge"
import { QrCode, MapPin, Calendar, Clock, ChevronRight, Flame } from "lucide-react"
import Link from "next/link"
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
        "w-full bg-white rounded-3xl border border-slate-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.995] group",
        className
      )}>
        {/* Header - Foto, Código e Status */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden border border-slate-100 flex-shrink-0">
              {foto ? (
                <img src={foto} alt={codigo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Flame className="w-10 h-10 text-[#B11226]/50" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{codigo}</h3>
              <p className="text-base font-bold text-slate-700">{localizacao}</p>
              <p className="text-sm font-medium text-slate-500 mt-0.5">{unidade}</p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-4 mb-5">
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6 text-slate-500" />
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Tipo</p>
              <p className="text-lg font-black text-slate-900">{tipo} {capacidade}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-slate-500" />
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Validade</p>
              <p className="text-lg font-black text-slate-900">{validade}</p>
            </div>
          </div>

          {ultimaInspecao && (
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-slate-500" />
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Última inspeção</p>
                <p className="text-lg font-black text-slate-900">{ultimaInspecao}</p>
              </div>
            </div>
          )}
        </div>

        {/* Botão de navegação */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-600">QR Code</p>
          </div>
          <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-[#B11226] group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}
