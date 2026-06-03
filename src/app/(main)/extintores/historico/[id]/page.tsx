"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Flame, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  ClipboardCheck, 
  FileText, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight,
  ShieldCheck,
  Camera,
  Info
} from "lucide-react"
import { getExtintorComHistorico } from "@/app/actions/extintores"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemAnim = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

export default function HistoricoExtintorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [extintor, setExtintor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await getExtintorComHistorico(id)
      setExtintor(data)
      setIsLoading(false)
    }
    loadData()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!extintor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Equipamento não encontrado</h1>
        <Button onClick={() => router.push("/extintores")} className="mt-4 rounded-full px-8 bg-red-600 hover:bg-red-700">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-6 pb-10 px-4 sm:px-0"
    >
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 pt-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/extintores")} 
          className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 uppercase">
            Relatório do Extintor
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Histórico Completo</p>
        </div>
      </div>

      {/* Card Principal do Equipamento */}
      <motion.div variants={itemAnim}>
        <Card className="border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] bg-red-600 blur-2xl pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm shrink-0 overflow-hidden">
                {extintor.foto ? (
                  <img src={extintor.foto} alt={extintor.codigo} className="h-full w-full object-cover" />
                ) : (
                  <Flame className="h-8 w-8 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tighter">{extintor.codigo}</h2>
                  <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    extintor.inspecoes?.[0]?.status === 'Conforme' 
                      ? "bg-green-500 text-white" 
                      : "bg-orange-500 text-white"
                  }`}>
                    {extintor.inspecoes?.[0]?.status || 'Pendente'}
                  </Badge>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{extintor.unidade.nome}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <MapPin className="h-3 w-3 text-blue-500" /> Localização
                </span>
                <span className="text-sm font-bold text-slate-700">{extintor.localizacao}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Flame className="h-3 w-3 text-orange-500" /> Tipo / Capacidade
                </span>
                <span className="text-sm font-bold text-slate-700">{extintor.tipo} - {extintor.capacidade}</span>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Calendar className="h-3 w-3 text-red-500" /> Validade da Carga
                </span>
                <span className="text-sm font-black text-slate-700">
                  {new Date(extintor.validadeCarga).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <Button 
              onClick={() => router.push(`/extintores/inspecao/${extintor.id}`)}
              className="w-full h-12 mt-8 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-red-200"
            >
              <ClipboardCheck className="h-4 w-4" />
              Realizar Nova Inspeção
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Título do Histórico */}
      <div className="flex items-center gap-2 pt-4">
        <Clock className="h-5 w-5 text-slate-400" />
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Histórico de Inspeções</h3>
      </div>

      {/* Lista de Inspeções */}
      <div className="space-y-4">
        {extintor.inspecoes.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhuma inspeção registrada</p>
          </div>
        ) : extintor.inspecoes.map((inspecao: any, index: number) => (
          <motion.div key={inspecao.id} variants={itemAnim}>
            <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      inspecao.status === 'Conforme' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                      {inspecao.status === 'Conforme' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                        Inspeção #{extintor.inspecoes.length - index}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(inspecao.dataInspecao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 justify-end">
                      <User className="h-3 w-3" /> Inspetor
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 uppercase">{inspecao.usuario.nome}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Lacre', value: inspecao.lacre },
                    { label: 'Manômetro', value: inspecao.manometro },
                    { label: 'Sinalização', value: inspecao.sinalizacao },
                    { label: 'Mangueira', value: inspecao.mangueira },
                    { label: 'Pintura', value: inspecao.pintura },
                    { label: 'Inmetro', value: inspecao.seloInmetro },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</span>
                      {item.value ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>

                {inspecao.observacao && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Observações
                    </p>
                    <p className="text-xs font-bold text-slate-600 italic">"{inspecao.observacao}"</p>
                  </div>
                )}

                {inspecao.foto && (
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                    <img src={inspecao.foto} alt="Evidência" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
