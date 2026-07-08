"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DoorOpen, Flame, Plus, Loader2, Activity, ArrowLeft, Trash2, Pencil } from "lucide-react"
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
import { createSetor, deleteSetor, getSetores, updateSetor } from "@/app/actions/setores"
import { getUnidades } from "@/app/actions/extintores"
import { motion } from "framer-motion"
import { BottomNavigation } from "@/components/BottomNavigation"

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
}

type SetorItem = {
  id: string
  nome: string
  unidadeId: string
  unidade: UnidadeItem
  _count: { extintores: number }
}

export default function SetoresPage() {
  const params = useParams()
  const router = useRouter()
  const unidadeId = params.unidadeId as string

  const [unidade, setUnidade] = useState<UnidadeItem | null>(null)
  const [setores, setSetores] = useState<SetorItem[]>([])
  const [dbError, setDbError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingSetorId, setDeletingSetorId] = useState<string | null>(null)
  const [setorOpen, setSetorOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingSetor, setEditingSetor] = useState<SetorItem | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    const [unidadesResult, setoresResult] = await Promise.all([
      getUnidades(),
      getSetores(unidadeId)
    ])

    const foundUnidade = unidadesResult.data.find((u: any) => u.id === unidadeId)
    setUnidade(foundUnidade || null)
    setSetores(setoresResult.data as SetorItem[])
    setDbError(unidadesResult.error ?? setoresResult.error ?? null)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [unidadeId])

  const handleSetorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set("unidadeId", unidadeId)
    const result = await createSetor(formData)
    if (result.success) {
      setSetorOpen(false)
      loadData()
    } else {
      alert(result.error)
    }
    setIsSubmitting(false)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingSetor) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set("unidadeId", unidadeId)
    const result = await updateSetor(editingSetor.id, formData)
    if (result.success) {
      setEditOpen(false)
      setEditingSetor(null)
      loadData()
    } else {
      alert(result.error)
    }
    setIsSubmitting(false)
  }

  const handleDeleteSetor = async (setor: SetorItem) => {
    const confirmacao = setor._count.extintores > 0
      ? `Este setor possui ${setor._count.extintores} extintor(es). Remova os equipamentos antes de excluir.`
      : `Deseja realmente excluir o setor "${setor.nome}"?`

    if (setor._count.extintores > 0) {
      alert(confirmacao)
      return
    }

    if (!confirm(confirmacao)) return

    setDeletingSetorId(setor.id)
    const result = await deleteSetor(setor.id)
    if (result.success) {
      loadData()
    } else {
      alert(result.error)
    }
    setDeletingSetorId(null)
  }

  const openEditDialog = (setor: SetorItem) => {
    setEditingSetor(setor)
    setEditOpen(true)
  }

  if (isLoading) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 bg-slate-50/50 p-4 md:p-8 min-h-screen rounded-3xl"
      >
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Activity className="h-12 w-12 text-[#ff1744] animate-pulse drop-shadow-[0_0_15px_rgba(255,23,68,0.4)]" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Carregando Setores...</p>
        </div>
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </motion.div>
    )
  }

  if (!unidade) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 bg-slate-50/50 p-4 md:p-8 min-h-screen rounded-3xl"
      >
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Unidade não encontrada</p>
          <Button onClick={() => router.push("/unidades")} className="bg-[#ff1744] hover:bg-[#d50000]">
            Voltar
          </Button>
        </div>
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 bg-slate-50/50 p-4 md:p-8 min-h-screen rounded-3xl"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-slate-100"
            onClick={() => router.push("/unidades")}
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              {unidade.nome}
            </h1>
            <p className="text-slate-500 font-bold text-lg mt-1 uppercase tracking-widest">
              Setores
            </p>
          </div>
        </div>

        <Dialog open={setorOpen} onOpenChange={setSetorOpen}>
          <DialogTrigger
            className="sm:w-auto w-full bg-[#ff6d00] hover:bg-[#e65100] text-white font-black uppercase tracking-widest rounded-full px-8 h-12 shadow-[0_8px_30px_rgba(255,109,0,0.3)] hover:shadow-[0_8px_30px_rgba(255,109,0,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            Novo Setor
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
            <form onSubmit={handleSetorSubmit} className="space-y-6">
              <DialogHeader>
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 border border-orange-100 shadow-[0_0_15px_rgba(255,109,0,0.1)]">
                  <DoorOpen className="h-6 w-6 text-[#ff6d00]" />
                </div>
                <DialogTitle className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                  Cadastrar Setor
                </DialogTitle>
                <DialogDescription className="font-bold text-slate-400">
                  Adicione um novo setor a esta unidade.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="setor-nome" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Setor</Label>
                  <Input
                    id="setor-nome"
                    name="nome"
                    placeholder="Ex: Galpão A"
                    required
                    className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 focus-visible:ring-[#ff6d00] focus-visible:ring-offset-2 transition-all"
                  />
                </div>
              </div>

              <DialogFooter className="mt-8">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff6d00] to-[#ff1744] hover:opacity-90 text-white text-sm font-black uppercase tracking-widest shadow-[0_8px_25px_rgba(255,109,0,0.3)] transition-all"
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Salvar Setor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {dbError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-black uppercase tracking-wide text-red-700">Banco de dados indisponível</p>
          <p className="mt-2 font-medium">{dbError}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {setores.map((setor) => (
          <motion.div key={setor.id} variants={item}>
            <Card className="border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group bg-white relative">
              <div
                className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 blur-2xl pointer-events-none"
                style={{ backgroundColor: COLORS.orangeNeon }}
              />
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl group-hover:bg-orange-100/50 transition-colors duration-300">
                    <DoorOpen className="h-6 w-6 text-[#ff6d00]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-slate-800 tracking-tight">{setor.nome}</CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#2979ff] transition-colors"
                    onClick={() => openEditDialog(setor)}
                    title="Editar setor"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    onClick={() => handleDeleteSetor(setor)}
                    disabled={deletingSetorId === setor.id}
                    title="Excluir setor"
                  >
                    {deletingSetorId === setor.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 relative z-10">
                <div className="flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-orange-100 hover:bg-orange-50/30 transition-colors">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    <Flame className="h-4 w-4" style={{ color: COLORS.redNeon, filter: `drop-shadow(0px 0px 6px ${COLORS.redNeon}60)` }} />
                    Extintores
                  </div>
                  <span className="text-3xl font-black text-slate-800">{setor._count.extintores}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {setores.length === 0 && (
          <motion.div variants={item} className="col-span-full py-24 text-center bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <DoorOpen className="h-10 w-10 text-orange-300" />
            </div>
            <h3 className="text-lg font-black text-slate-700">Nenhum setor encontrado</h3>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs mt-2">Clique em "Novo Setor" para começar</p>
          </motion.div>
        )}
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(isOpen) => {
          setEditOpen(isOpen)
          if (!isOpen) setEditingSetor(null)
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
          {editingSetor && (
            <form key={editingSetor.id} onSubmit={handleEditSubmit} className="space-y-6">
              <DialogHeader>
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 border border-orange-100 shadow-[0_0_15px_rgba(255,109,0,0.1)]">
                  <Pencil className="h-6 w-6 text-[#ff6d00]" />
                </div>
                <DialogTitle className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                  Editar Setor
                </DialogTitle>
                <DialogDescription className="font-bold text-slate-400">
                  Atualize os dados do setor.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Setor</Label>
                  <Input
                    id="edit-nome"
                    name="nome"
                    defaultValue={editingSetor.nome}
                    required
                    className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 focus-visible:ring-[#ff6d00] focus-visible:ring-offset-2 transition-all"
                  />
                </div>
              </div>

              <DialogFooter className="mt-8">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff6d00] to-[#ff1744] hover:opacity-90 text-white text-sm font-black uppercase tracking-widest shadow-[0_8px_25px_rgba(255,109,0,0.3)] transition-all"
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </motion.div>
  )
}
