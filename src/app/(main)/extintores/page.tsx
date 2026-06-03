import { getExtintores } from "@/app/actions/extintores"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button"
import { ClipboardCheck, MapPin, Calendar, Camera, Flame, Search, Filter, AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { ExtintorForm } from "@/components/forms/extintor-form"
import { Input } from "@/components/ui/input"

// Constantes de cores Neon para reuso (inline styles para os drop-shadows)
const COLORS = {
  redNeon: "#ff1744",
  orangeNeon: "#ff6d00",
  greenNeon: "#00e676",
  blueNeon: "#2979ff",
}

export default async function ExtintoresPage() {
  const extintores = await getExtintores()

  return (
    <div className="flex flex-col space-y-6 max-w-2xl mx-auto bg-slate-50/50 p-4 md:p-8 min-h-screen rounded-3xl">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
          Extintores
        </h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
          Matriz e Unidades
        </p>
      </div>

      {/* Busca e Filtro */}
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-[#ff1744] transition-colors" />
          <Input 
            placeholder="Buscar equipamento, código ou local..." 
            className="pl-12 h-12 bg-white border-slate-200 rounded-2xl text-sm focus-visible:ring-2 focus-visible:ring-[#ff1744]/20 focus-visible:border-[#ff1744] transition-all font-bold shadow-sm"
          />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 bg-white shadow-sm hover:border-[#ff1744] hover:text-[#ff1744] hover:bg-red-50 transition-all">
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {/* Botão Novo Extintor (O Form deve encapsular o botão Trigger) */}
      <div className="w-full">
        <ExtintorForm />
      </div>

      {/* Lista de Extintores */}
      <div className="space-y-5 mt-4">
        {extintores.map((extintor) => {
          const ultimaInspecao = extintor.inspecoes?.[0]
          const status = ultimaInspecao?.status || "Pendente"
          
          // Lógica de Cores por Status
          const isConforme = status === "Conforme"
          const isPendente = status === "Pendente"
          
          const statusColor = isConforme ? COLORS.greenNeon : isPendente ? COLORS.orangeNeon : COLORS.redNeon
          const statusBgClass = isConforme ? "bg-[#00e676]" : isPendente ? "bg-[#ff6d00]" : "bg-[#ff1744]"
          const StatusIcon = isConforme ? CheckCircle2 : isPendente ? Clock : AlertCircle

          return (
            <div 
              key={extintor.id} 
              className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Brilho de Fundo Hover */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.04] group-hover:scale-150 transition-transform duration-700 blur-2xl pointer-events-none" 
                style={{ backgroundColor: statusColor }}
              />

              {/* Indicador Lateral Neon */}
              <div 
                className={`absolute top-0 left-0 w-2 h-full ${statusBgClass} transition-colors`} 
                style={{ boxShadow: `0 0 15px ${statusColor}40` }}
              />
              
              <div className="p-6 pl-8">
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0 group-hover:border-slate-200 transition-colors shadow-sm">
                      {extintor.foto ? (
                        <img src={extintor.foto} alt={extintor.codigo} className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-xl tracking-tighter leading-none mb-1.5">{extintor.codigo}</h3>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{extintor.unidade.nome}</p>
                    </div>
                  </div>
                  
                  {/* Badge de Status Vibrante */}
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge
                      className={`border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm`}
                      style={{ 
                        backgroundColor: `${statusColor}15`, 
                        color: statusColor,
                      }}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status}
                    </Badge>
                  </div>
                </div>
                
                {/* Informações (Grid) */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-6 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <MapPin className="h-3 w-3" style={{ color: COLORS.blueNeon }} />
                      Localização
                    </span>
                    <span className="text-sm font-bold text-slate-700 truncate">{extintor.localizacao}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Flame className="h-3 w-3" style={{ color: COLORS.orangeNeon }} />
                      Tipo
                    </span>
                    <span className="text-sm font-bold text-slate-700 truncate">{extintor.tipo}</span>
                  </div>

                  <div className="flex flex-col gap-1 col-span-2 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" style={{ color: !isConforme && !isPendente ? COLORS.redNeon : COLORS.blueNeon }} />
                      Validade da Carga
                    </span>
                    <span className={`text-sm font-black tracking-tight ${!isConforme && !isPendente ? "text-[#ff1744]" : "text-slate-700"}`}>
                      {new Date(extintor.validadeCarga).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação */} 
                <div className="flex flex-col gap-2">
                  <Button 
                    nativeButton={false}
                    variant="outline"
                    className="w-full h-12 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-100 hover:border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all gap-2 shadow-sm hover:shadow-md"
                    render={
                      <Link href={`/extintores/historico/${extintor.id}`}>
                        <FileText className="h-4 w-4 text-blue-500" />
                        Relatório do Extintor
                      </Link>
                    }
                  />
                  <Button 
                    nativeButton={false}
                    className="w-full h-12 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-100 hover:border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all gap-2 shadow-sm hover:shadow-md"
                    render={
                      <Link href={`/extintores/inspecao/${extintor.id}`}>
                        <ClipboardCheck className="h-4 w-4" style={{ color: statusColor }} />
                        Realizar Inspeção
                      </Link>
                    }
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Estado Vazio (Empty State) */}
        {extintores.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="p-5 rounded-full bg-red-50 text-[#ff1744] shadow-[0_0_20px_rgba(255,23,68,0.15)] relative">
                <div className="absolute inset-0 border-2 border-[#ff1744] rounded-full animate-ping opacity-20" />
                <Flame className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-slate-800 text-lg">Nenhum equipamento</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Cadastre o primeiro extintor para iniciar.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}