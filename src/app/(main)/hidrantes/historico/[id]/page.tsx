"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Droplets, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  ClipboardCheck, 
  FileText, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Edit2,
  Trash2,
  Camera,
  X
} from "lucide-react"
import { getHidranteComHistorico, updateInspecaoHidrante, deleteInspecaoHidrante } from "@/app/actions/hidrantes"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { BottomNavigation } from "@/components/BottomNavigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemAnim = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

export default function HistoricoHidrantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [hidrante, setHidrante] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingInspecao, setEditingInspecao] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if user can edit (Bombeiro or Administrador)
  const canEdit = (): boolean => {
    // Since we don't have user role in session, but we check in backend anyway
    return true
  }

  const handleEditClick = (inspecao: any) => {
    setEditingInspecao(inspecao)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = async (inspecaoId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta inspeção?')) return
    
    setIsDeleting(true)
    if (session?.user?.id) {
      await deleteInspecaoHidrante(inspecaoId, session.user.id)
      const data = await getHidranteComHistorico(id, session.user.id)
      setHidrante(data)
    }
    setIsDeleting(false)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session?.user?.id || !editingInspecao) return
    
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    const result = await updateInspecaoHidrante(
      editingInspecao.id, 
      session.user.id, 
      {
        status: formData.get('status') as string,
        observacao: formData.get('observacao') as string,
        dataInspecao: new Date(formData.get('dataInspecao') as string),
        localAcessivel: formData.get('localAcessivel') === 'on',
        sinalizado: formData.get('sinalizado') === 'on',
        estadoMangueiras: formData.get('estadoMangueiras') === 'on',
        enroladasCorretamente: formData.get('enroladasCorretamente') === 'on',
        esguichosNoLocal: formData.get('esguichosNoLocal') === 'on',
        esguichosBoasCondicoes: formData.get('esguichosBoasCondicoes') === 'on',
        semVazamentos: formData.get('semVazamentos') === 'on',
        valvulaFechada: formData.get('valvulaFechada') === 'on',
        temChaveStorz: formData.get('temChaveStorz') === 'on',
        estadoPintura: formData.get('estadoPintura') === 'on',
        proximoTesteHidrostatico: formData.get('proximoTesteHidrostatico') === 'on',
      }
    )
    
    if (result.success) {
      setEditDialogOpen(false)
      const data = await getHidranteComHistorico(id, session.user.id)
      setHidrante(data)
    } else {
      alert(result.error)
    }
    
    setIsSubmitting(false)
  }

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) return
      const data = await getHidranteComHistorico(id, session.user.id)
      setHidrante(data)
      setIsLoading(false)
    }
    loadData()
  }, [id, session?.user?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando...</p>
      </div>
    )
  }

  if (!hidrante) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertCircle className="h-12 w-12 text-blue-500 mb-4" />
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Equipamento não encontrado</h1>
        <Button onClick={() => router.push("/hidrantes")} className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700">
          Voltar
        </Button>
      </div>
    )
  }

  const checklistItems = [
    { id: "localAcessivel", label: "Local Acessível", checked: false },
    { id: "sinalizado", label: "Sinalizado", checked: false },
    { id: "estadoMangueiras", label: "Estado Mangueiras", checked: false },
    { id: "enroladasCorretamente", label: "Enroladas Corretamente", checked: false },
    { id: "esguichosNoLocal", label: "Esguichos no Local", checked: false },
    { id: "esguichosBoasCondicoes", label: "Esguichos Boas Condições", checked: false },
    { id: "semVazamentos", label: "Sem Vazamentos", checked: false },
    { id: "valvulaFechada", label: "Válvula Fechada", checked: false },
    { id: "temChaveStorz", label: "Tem Chave Storz", checked: false },
    { id: "estadoPintura", label: "Estado Pintura", checked: false },
    { id: "proximoTesteHidrostatico", label: "Próximo Teste Hidrostático", checked: false },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-4 lg:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <ChevronLeft className="h-6 w-6 text-slate-600" onClick={() => router.back()} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">Histórico Completo</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{hidrante.codigo}</p>
            </div>
          </div>
        </div>

        <motion.div variants={itemAnim}>
          <Card className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center shrink-0 border border-blue-200">
                  <Droplets className="h-10 w-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{hidrante.codigo}</p>
                    <Badge className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                      hidrante.inspecoes?.length > 0 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-slate-100 text-slate-600"
                    )}>
                      {hidrante.inspecoes?.length > 0 
                        ? hidrante.inspecoes[0].status 
                        : "Pendente"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <MapPin className="h-3.5 w-3.5" /> Localização
                      </span>
                      <p className="text-sm font-bold text-slate-700">{hidrante.localizacao}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {hidrante.inspecoes.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhuma inspeção registrada</p>
            </div>
          ) : hidrante.inspecoes.map((inspecao: any, index: number) => (
            <motion.div key={inspecao.id} variants={itemAnim}>
              <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        inspecao.status === 'Conforme' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {inspecao.status === 'Conforme' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                          Inspeção #{hidrante.inspecoes.length - index}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(inspecao.dataInspecao).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block mr-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 justify-end">
                          <User className="h-3 w-3" /> Inspetor
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 uppercase">{inspecao.usuario?.nome || 'Desconhecido'}</p>
                      </div>
                      {canEdit() && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleEditClick(inspecao)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(inspecao.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {checklistItems.map((item, i) => (
                      <div key={i} className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          {item.label}
                        </span>
                        {inspecao[item.id] ? (
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
        </motion.div>

        {editingInspecao && (
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Editar Inspeção</DialogTitle>
                <DialogDescription>Edite os detalhes da inspeção</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data da Inspeção</Label>
                    <Input
                      type="date"
                      name="dataInspecao"
                      defaultValue={new Date(editingInspecao.dataInspecao).toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      name="status"
                      defaultValue={editingInspecao.status}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Conforme">Conforme</option>
                      <option value="Não Conforme">Não Conforme</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Checklist</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <input
                          type="checkbox"
                          name={item.id}
                          defaultChecked={editingInspecao[item.id]}
                          id={item.id}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={item.id} className="text-sm font-medium text-slate-700">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    name="observacao"
                    defaultValue={editingInspecao.observacao}
                    placeholder="Digite observações sobre a inspeção..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="lg:hidden mt-auto">
        <BottomNavigation />
      </div>
    </div>
  )
}
