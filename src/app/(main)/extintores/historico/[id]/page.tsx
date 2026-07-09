"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Flame, 
  MapPin, 
  ChevronLeft, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Edit2,
  Trash2,
  Camera,
  Activity,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  Calendar
} from "lucide-react"
import { getExtintorComHistorico, updateInspecao, deleteInspecao } from "@/app/actions/extintores"
import { motion, AnimatePresence } from "framer-motion"
import { BottomNavigation } from "@/components/BottomNavigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function HistoricoExtintorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  
  const [extintor, setExtintor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingInspecao, setEditingInspecao] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  const canEdit = () => true // Lógica de permissão

  const toggleCard = (inspecaoId: string) => {
    setExpandedCards(prev => ({ ...prev, [inspecaoId]: !prev[inspecaoId] }))
  }

  const handleEditClick = (inspecao: any) => {
    setEditingInspecao(inspecao)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = async (inspecaoId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta inspeção?')) return
    setIsDeleting(true)
    if (session?.user?.id) {
      await deleteInspecao(inspecaoId, session.user.id)
      const data = await getExtintorComHistorico(id, session.user.id)
      setExtintor(data)
    }
    setIsDeleting(false)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session?.user?.id || !editingInspecao) return
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateInspecao(editingInspecao.id, session.user.id, {
      status: formData.get('status') as string,
      observacao: formData.get('observacao') as string,
      sinalizacao: formData.get('sinalizacao') === 'on',
      manometro: formData.get('manometro') === 'on',
      lacre: formData.get('lacre') === 'on',
      mangueira: formData.get('mangueira') === 'on',
      pintura: formData.get('pintura') === 'on',
      seloInmetro: formData.get('seloInmetro') === 'on',
      dataInspecao: new Date(formData.get('dataInspecao') as string),
    })
    
    if (result.success) {
      setEditDialogOpen(false)
      const data = await getExtintorComHistorico(id, session.user.id)
      setExtintor(data)
    } else {
      alert(result.error)
    }
    setIsSubmitting(false)
  }

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) return
      const data = await getExtintorComHistorico(id, session.user.id)
      setExtintor(data)
      setIsLoading(false)
    }
    loadData()
  }, [id, session?.user?.id])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sincronizando dados...</p>
      </div>
    )
  }

  if (!extintor) return null

  // Itens específicos para Extintores
  const checklistItems = [
    { id: "lacre", label: "Lacre Intacto" },
    { id: "manometro", label: "Manômetro na Faixa Verde" },
    { id: "sinalizacao", label: "Sinalização Adequada" },
    { id: "mangueira", label: "Mangueira/Esguicho em Boas Condições" },
    { id: "pintura", label: "Pintura do Cilindro" },
    { id: "seloInmetro", label: "Selo do Inmetro Legível" },
  ]

  // Métricas Rápidas
  const totalInspecoes = extintor.inspecoes?.length || 0
  const lastInspecao = extintor.inspecoes?.[0]
  const isHealthy = lastInspecao?.status === 'Conforme'

  const calculateScore = (inspecao: any) => {
    const passed = checklistItems.filter(item => inspecao[item.id]).length
    return { passed, total: checklistItems.length, percent: Math.round((passed / checklistItems.length) * 100) }
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] pb-28 font-sans">
      
      {/* 1. HERO SECTION & HEADER */}
      <div className={cn(
        "pt-8 pb-12 px-6 rounded-b-[40px] shadow-sm transition-colors duration-500",
        isHealthy ? "bg-gradient-to-br from-teal-600 to-emerald-800" : "bg-gradient-to-br from-rose-600 to-red-800",
        totalInspecoes === 0 && "bg-gradient-to-br from-slate-600 to-slate-800"
      )}>
        <div className="max-w-3xl mx-auto">
          {/* Navegação Topo */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => router.back()}
              className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2">
              <Flame className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white uppercase tracking-widest">{extintor.codigo}</span>
            </div>
          </div>

          {/* Status Principal */}
          <div className="text-center text-white mb-6">
            {isHealthy ? (
              <ShieldCheck className="h-16 w-16 mx-auto mb-4 opacity-90" />
            ) : (
              <ShieldAlert className="h-16 w-16 mx-auto mb-4 opacity-90" />
            )}
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {totalInspecoes === 0 ? "Sem Histórico" : (isHealthy ? "Equipamento Operacional" : "Atenção Necessária")}
            </h1>
            <p className="flex items-center justify-center gap-2 text-white/80 text-sm font-medium">
              <MapPin className="h-4 w-4" /> {extintor.unidade?.nome} • {extintor.localizacao}
            </p>
            
            {/* Badges com informações vitais do extintor */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <div className="bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold">
                <Flame className="h-3.5 w-3.5" /> 
                Tipo {extintor.tipo} ({extintor.capacidade} {extintor.capacidadeUnidade})
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-orange-100">
                <Calendar className="h-3.5 w-3.5" /> 
                Validade: {new Date(extintor.validadeCarga).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW METRICS */}
      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-3xl border-none shadow-md bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inspeções</p>
                <p className="text-2xl font-black text-slate-800">{totalInspecoes}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-3xl border-none shadow-md bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Última Visita</p>
                <p className="text-sm sm:text-base font-black text-slate-800 mt-1">
                  {lastInspecao ? new Date(lastInspecao.dataInspecao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Nunca'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. TIMELINE DE HISTÓRICO */}
      <div className="max-w-3xl mx-auto mt-10 px-6">
        <h2 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Linha do Tempo</h2>

        {totalInspecoes === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">Nenhum registro encontrado para este equipamento.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
            {extintor.inspecoes.map((inspecao: any, index: number) => {
              const score = calculateScore(inspecao)
              const isExpanded = expandedCards[inspecao.id]
              const isInspecaoOk = inspecao.status === 'Conforme'

              return (
                <div key={inspecao.id} className="relative pl-6 sm:pl-8">
                  {/* Ponto da Timeline */}
                  <div className={cn(
                    "absolute -left-[11px] top-4 w-5 h-5 rounded-full ring-4 ring-[#F4F4F5]",
                    isInspecaoOk ? "bg-emerald-500" : "bg-rose-500"
                  )} />

                  <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-0">
                      
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-black text-slate-800">
                              Inspeção #{extintor.inspecoes.length - index}
                            </p>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                              {new Date(inspecao.dataInspecao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          
                          {canEdit() && (
                            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg" onClick={() => handleEditClick(inspecao)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg" onClick={() => handleDeleteClick(inspecao.id)} disabled={isDeleting}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* BARRA DE PROGRESSO NATIVA */}
                        <div className="bg-slate-50 p-3.5 rounded-2xl">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-slate-500">Índice de Conformidade</span>
                            <span className="text-sm font-black text-slate-800">{score.passed}/{score.total}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all duration-500",
                                isInspecaoOk ? "bg-emerald-500" : "bg-rose-500"
                              )}
                              style={{ width: `${score.percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Inspetor</p>
                              <p className="text-xs font-bold text-slate-700">{inspecao.usuario?.nome || 'Desconhecido'}</p>
                            </div>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold"
                            onClick={() => toggleCard(inspecao.id)}
                          >
                            {isExpanded ? "Ocultar" : "Detalhes"}
                            {isExpanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-slate-100 bg-slate-50/50"
                          >
                            <div className="p-5 space-y-6">
                              <div className="space-y-3">
                                {checklistItems.map(item => (
                                  <div key={item.id} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                    {inspecao[item.id] ? (
                                      <CheckCircle2 className="h-5 w-5 text-emerald-500 drop-shadow-sm" />
                                    ) : (
                                      <AlertCircle className="h-5 w-5 text-rose-500 drop-shadow-sm" />
                                    )}
                                  </div>
                                ))}
                              </div>

                              {inspecao.observacao && (
                                <div className="p-4 bg-white rounded-2xl border border-slate-200">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observações</p>
                                  <p className="text-sm text-slate-700 italic">{inspecao.observacao}</p>
                                </div>
                              )}

                              {inspecao.foto && (
                                <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registro Fotográfico</p>
                                  <div className="relative h-40 w-full rounded-2xl overflow-hidden shadow-sm">
                                    <img src={inspecao.foto} alt="Evidência" className="h-full w-full object-cover" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. MODAL DE EDIÇÃO OTIMIZADO PARA MOBILE */}
      {editingInspecao && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-xl w-full h-[90vh] sm:h-auto mt-auto sm:mt-0 mb-0 sm:mb-auto rounded-t-[32px] sm:rounded-3xl p-0 flex flex-col overflow-hidden bg-[#F4F4F5]">
            <div className="p-6 bg-white border-b border-slate-100 shrink-0">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />
              <DialogTitle className="text-xl font-black text-slate-800">Editar Registro</DialogTitle>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              <form id="edit-form" onSubmit={handleEditSubmit} className="space-y-8">
                
                <div className="bg-white p-5 rounded-3xl shadow-sm space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data da Inspeção</Label>
                    <Input type="date" name="dataInspecao" defaultValue={new Date(editingInspecao.dataInspecao).toISOString().split('T')[0]} required className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status Geral</Label>
                    <select name="status" defaultValue={editingInspecao.status} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:ring-2 focus:ring-red-600 outline-none">
                      <option value="Conforme">Conforme (Operacional)</option>
                      <option value="Não Conforme">Não Conforme (Atenção)</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-3xl shadow-sm space-y-4">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Verificação Física</Label>
                  <div className="space-y-3">
                    {checklistItems.map((item) => (
                      <label key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                        <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                        <input type="checkbox" name={item.id} defaultChecked={editingInspecao[item.id]} className="h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-600" />
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-3xl shadow-sm space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Anotações Adicionais</Label>
                  <Textarea name="observacao" defaultValue={editingInspecao.observacao} placeholder="Justificativas ou detalhes..." className="min-h-[100px] rounded-xl bg-slate-50 border-slate-200 p-4 resize-none" />
                </div>
              </form>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1 h-14 rounded-2xl font-bold border-slate-200 text-slate-600">
                Cancelar
              </Button>
              <Button type="submit" form="edit-form" disabled={isSubmitting} className="flex-1 h-14 rounded-2xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20">
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}