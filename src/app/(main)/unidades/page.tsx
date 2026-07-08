"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Flame, Droplets, Plus, Loader2, Activity, Pencil, Trash2, DoorOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createUnidade, updateUnidade, deleteUnidade } from "@/app/actions/unidades"
import { getUnidades } from "@/app/actions/extintores"
import { motion } from "framer-motion"
import { BottomNavigation } from "@/components/BottomNavigation"

// Cores do tema emergência/neon
const COLORS = {
  redNeon: "#ff1744",
  orangeNeon: "#ff6d00",
  greenNeon: "#00e676",
  blueNeon: "#2979ff",
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

type UnidadeItem = {
  id: string
  nome: string
  cidade: string
  estado: string
  _count: { extintores: number; hidrantes: number }
}

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<UnidadeItem[]>([])
  const [dbError, setDbError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingUnidade, setEditingUnidade] = useState<UnidadeItem | null>(null)

  const loadUnidades = async () => {
    setIsLoading(true)
    const result = await getUnidades()
    setUnidades(result.data)
    setDbError(result.error ?? null)
    setIsLoading(false)
  }

  useEffect(() => {
    loadUnidades()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = await createUnidade(formData)
    if (result.success) {
      setOpen(false)
      loadUnidades()
    } else {
      alert(result.error)
    }
    setIsSubmitting(false)
  }

  const openEditDialog = (unidade: UnidadeItem) => {
    setEditingUnidade(unidade)
    setEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUnidade) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateUnidade(editingUnidade.id, formData)
    if (result.success) {
      setEditOpen(false)
      setEditingUnidade(null)
      loadUnidades()
    } else {
      alert(result.error)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (unidade: UnidadeItem) => {
    const totalEquipamentos = unidade._count.extintores + unidade._count.hidrantes
    const mensagem = totalEquipamentos > 0
      ? `Esta unidade possui ${unidade._count.extintores} extintor(es) e ${unidade._count.hidrantes} hidrante(s). Remova os equipamentos antes de excluir.`
      : `Deseja realmente excluir a unidade "${unidade.nome}"?`

    if (totalEquipamentos > 0) {
      alert(mensagem)
      return
    }

    if (!confirm(mensagem)) return

    setDeletingId(unidade.id)
    const result = await deleteUnidade(unidade.id)
    if (result.success) {
      loadUnidades()
    } else {
      alert(result.error)
    }
    setDeletingId(null)
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 bg-slate-50/50 p-4 md:p-8 min-h-screen rounded-3xl"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
            Unidades
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-1 uppercase tracking-widest">
            Gestão das Plantas
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className="sm:w-auto w-full bg-[#ff1744] hover:bg-[#d50000] text-white font-black uppercase tracking-widest rounded-full px-8 h-12 shadow-[0_8px_30px_rgba(255,23,68,0.3)] hover:shadow-[0_8px_30px_rgba(255,23,68,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            Nova Unidade
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <DialogHeader>
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 border border-red-100 shadow-[0_0_15px_rgba(255,23,68,0.1)]">
                  <Building2 className="h-6 w-6 text-[#ff1744]" />
                </div>
                <DialogTitle className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                  Cadastrar Unidade
                </DialogTitle>
                <DialogDescription className="font-bold text-slate-400">
                  Adicione uma nova planta industrial ao sistema.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Unidade</Label>
                  <Input 
                    id="nome" 
                    name="nome" 
                    placeholder="Ex: Matriz Itaquiraí" 
                    required 
                    className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 focus-visible:ring-[#ff1744] focus-visible:ring-offset-2 transition-all" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Cidade</Label>
                    <Input 
                      id="cidade" 
                      name="cidade" 
                      placeholder="Cidade" 
                      required 
                      className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 focus-visible:ring-[#ff1744] focus-visible:ring-offset-2 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Estado</Label>
                    <Input 
                      id="estado" 
                      name="estado" 
                      placeholder="UF" 
                      required 
                      maxLength={2}
                      className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 uppercase focus-visible:ring-[#ff1744] focus-visible:ring-offset-2 transition-all" 
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-8">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff1744] to-[#ff6d00] hover:opacity-90 text-white text-sm font-black uppercase tracking-widest shadow-[0_8px_25px_rgba(255,23,68,0.3)] transition-all"
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Salvar Unidade"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={editOpen}
          onOpenChange={(isOpen) => {
            setEditOpen(isOpen)
            if (!isOpen) setEditingUnidade(null)
          }}
        >
          <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
            {editingUnidade && (
              <form key={editingUnidade.id} onSubmit={handleEditSubmit} className="space-y-6">
                <DialogHeader>
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 border border-red-100 shadow-[0_0_15px_rgba(255,23,68,0.1)]">
                    <Pencil className="h-6 w-6 text-[#ff1744]" />
                  </div>
                  <DialogTitle className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                    Editar Unidade
                  </DialogTitle>
                  <DialogDescription className="font-bold text-slate-400">
                    Atualize os dados da planta industrial.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nome" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Unidade</Label>
                    <Input
                      id="edit-nome"
                      name="nome"
                      defaultValue={editingUnidade.nome}
                      required
                      className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 focus-visible:ring-[#ff1744] focus-visible:ring-offset-2 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-cidade" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Cidade</Label>
                      <Input
                        id="edit-cidade"
                        name="cidade"
                        defaultValue={editingUnidade.cidade}
                        required
                        className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 focus-visible:ring-[#ff1744] focus-visible:ring-offset-2 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-estado" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Estado</Label>
                      <Input
                        id="edit-estado"
                        name="estado"
                        defaultValue={editingUnidade.estado}
                        required
                        maxLength={2}
                        className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 uppercase focus-visible:ring-[#ff1744] focus-visible:ring-offset-2 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff1744] to-[#ff6d00] hover:opacity-90 text-white text-sm font-black uppercase tracking-widest shadow-[0_8px_25px_rgba(255,23,68,0.3)] transition-all"
                  >
                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>


      </div>



      {dbError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-black uppercase tracking-wide text-red-700">Banco de dados indisponível</p>
          <p className="mt-2 font-medium">{dbError}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Activity className="h-12 w-12 text-[#ff1744] animate-pulse drop-shadow-[0_0_15px_rgba(255,23,68,0.4)]" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Carregando Plantas...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {unidades.map((unidade) => (
            <motion.div key={unidade.id} variants={item}>
              <Card className="border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group bg-white relative">
                <div 
                  className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 blur-2xl pointer-events-none" 
                  style={{ backgroundColor: COLORS.redNeon }}
                />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-50 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-red-50 group-hover:border-red-100 transition-colors duration-300">
                      <Building2 className="h-6 w-6 text-slate-400 group-hover:text-[#ff1744] transition-colors" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-slate-800 tracking-tight">{unidade.nome}</CardTitle>
                      <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" style={{ color: COLORS.orangeNeon, filter: `drop-shadow(0px 0px 4px ${COLORS.orangeNeon}60)` }} />
                        {unidade.cidade} - {unidade.estado}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#00e676]/10 text-[#00c853] border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-sm">
                      Ativa
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#2979ff] transition-colors"
                      onClick={() => openEditDialog(unidade)}
                      title="Editar unidade"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Link href={`/unidades/${unidade.id}/setores`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-orange-50 text-slate-400 hover:text-[#ff6d00] transition-colors"
                        title="Ver setores"
                      >
                        <DoorOpen className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      onClick={() => handleDelete(unidade)}
                      disabled={deletingId === unidade.id}
                      title="Excluir unidade"
                    >
                      {deletingId === unidade.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Card Interno - Extintores (Vermelho/Fogo) */}
                    <div className="flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-red-100 hover:bg-red-50/30 transition-colors">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        <Flame className="h-4 w-4" style={{ color: COLORS.redNeon, filter: `drop-shadow(0px 0px 6px ${COLORS.redNeon}60)` }} />
                        Extintores
                      </div>
                      <span className="text-3xl font-black text-slate-800">{unidade._count.extintores}</span>
                    </div>

                    {/* Card Interno - Hidrantes (Azul/Água) */}
                    <div className="flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        <Droplets className="h-4 w-4" style={{ color: COLORS.blueNeon, filter: `drop-shadow(0px 0px 6px ${COLORS.blueNeon}60)` }} />
                        Hidrantes
                      </div>
                      <span className="text-3xl font-black text-slate-800">{unidade._count.hidrantes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {unidades.length === 0 && (
            <motion.div variants={item} className="col-span-full py-24 text-center bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-700">Nenhuma unidade encontrada</h3>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs mt-2">Clique em "Nova Unidade" para começar</p>
            </motion.div>
          )}
        </div>
      )}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </motion.div>
  )
}