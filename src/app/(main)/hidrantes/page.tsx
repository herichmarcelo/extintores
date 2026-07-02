"use client"

import { useState, useEffect } from "react"
import { getHidrantes, deleteHidrante } from "@/app/actions/hidrantes"
import { getUnidades } from "@/app/actions/extintores"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, MapPin, Camera, Search, Building2, AlertCircle, CheckCircle2, Clock, Droplets, Gauge, Ruler, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"
import { HidranteForm } from "@/components/forms/hidrante-form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { SearchBar } from "@/components/SearchBar"
import { SelectWithIcon } from "@/components/SelectWithIcon"
import { BottomNavigation } from "@/components/BottomNavigation"

const COLORS = {
  blueNeon: "#2979ff",
  cyanNeon: "#00b0ff",
  greenNeon: "#00e676",
  orangeNeon: "#ff6d00",
  redNeon: "#ff1744"
}

interface Hidrante {
  id: string
  codigo: string
  localizacao: string
  unidadeId: string
  foto?: string | null
  unidade: { id: string; nome: string }
  inspecoes?: Array<{ status: string }>
}

export default function HidrantesPage() {
  const [hidrantes, setHidrantes] = useState<Hidrante[]>([])
  const [filteredHidrantes, setFilteredHidrantes] = useState<Hidrante[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [selectedUnidade, setSelectedUnidade] = useState<string>("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [editHidrante, setEditHidrante] = useState<Hidrante | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Obtém o nome da unidade selecionada
  const getNomeUnidadeSelecionada = () => {
    if (selectedUnidade === "todos") return "Todas as unidades"
    const unidade = unidades.find((u) => u.id === selectedUnidade)
    return unidade ? unidade.nome : "Todas as unidades"
  }

  useEffect(() => {
    async function fetchData() {
      const [hidrantesData, unidadesData] = await Promise.all([
        getHidrantes(),
        getUnidades()
      ])
      setHidrantes(hidrantesData as unknown as Hidrante[])
      setFilteredHidrantes(hidrantesData as unknown as Hidrante[])
      setUnidades(unidadesData.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...hidrantes]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (h) =>
          h.codigo.toLowerCase().includes(query) ||
          h.localizacao.toLowerCase().includes(query)
      )
    }

    if (selectedUnidade !== "todos") {
      filtered = filtered.filter((h) => h.unidadeId === selectedUnidade)
    }

    setFilteredHidrantes(filtered)
  }, [hidrantes, searchQuery, selectedUnidade])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    const result = await deleteHidrante(deleteId)
    if (result.success) {
      setHidrantes(hidrantes.filter((h) => h.id !== deleteId))
      setDeleteDialogOpen(false)
      setDeleteId(null)
    } else {
      alert(result.error)
    }
    setIsDeleting(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="flex flex-col space-y-6 max-w-2xl mx-auto bg-slate-50/50 p-4 md:p-8 min-h-screen rounded-3xl">
      <div className="flex flex-col space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Hidrantes</h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Rede de Combate a Incêndio</p>
      </div>

      <div className="flex flex-col gap-3">
        <SearchBar
          placeholder="Buscar por código, registro ou local..."
          onSearch={setSearchQuery}
          focusColor="blue"
        />
        <SelectWithIcon
          icon={<Building2 className="w-5 h-5" />}
          value={selectedUnidade}
          onValueChange={setSelectedUnidade}
          placeholder={getNomeUnidadeSelecionada()}
          displayValue={getNomeUnidadeSelecionada()}
          focusColor="blue"
        >
          <SelectItem value="todos" className="font-medium">Todas as unidades</SelectItem>
          {unidades.map((u) => (
            <SelectItem key={u.id} value={u.id} className="font-medium">
              {u.nome}
            </SelectItem>
          ))}
        </SelectWithIcon>
      </div>
      <div className="w-full">
        <HidranteForm />
      </div>

      <div className="space-y-5 mt-4">
        {filteredHidrantes.map((hidrante) => {
          const ultimaInspecao = (hidrante as any).inspecoes?.[0]
          const status = ultimaInspecao?.status || "Pendente"
          const isConforme = status === "Conforme"
          const isPendente = status === "Pendente"
          const statusColor = isConforme ? COLORS.greenNeon : isPendente ? COLORS.orangeNeon : COLORS.redNeon
          const StatusIcon = isConforme ? CheckCircle2 : isPendente ? Clock : AlertCircle

          return (
            <div key={hidrante.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group">
              <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: statusColor }} />
              <div className="p-6 pl-8">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                      {hidrante.foto ? <img src={hidrante.foto} alt={hidrante.codigo} className="h-full w-full object-cover" /> : <Droplets className="h-6 w-6 text-slate-300" />}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-xl tracking-tighter leading-none mb-1.5">{hidrante.codigo}</h3>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{hidrante.unidade.nome}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge className="border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm" style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-6 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <div className="flex flex-col gap-1 col-span-2 pb-2 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <MapPin className="h-3 w-3" style={{ color: COLORS.cyanNeon }} />
                      Localização / Abrigo
                    </span>
                    <span className="text-sm font-bold text-slate-700 truncate">{hidrante.localizacao}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Ruler className="h-3 w-3" style={{ color: COLORS.blueNeon }} />
                      Mangueira
                    </span>
                    <span className="text-sm font-bold text-slate-700 truncate">-</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Gauge className="h-3 w-3" style={{ color: COLORS.blueNeon }} />
                      Teste Hidrostático
                    </span>
                    <span className="text-sm font-black tracking-tight">-</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-12 bg-white hover:bg-blue-50 text-slate-800 border-2 border-slate-100 hover:border-blue-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all gap-2 shadow-sm hover:shadow-md" onClick={() => setEditHidrante(hidrante)}>
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" className="h-12 w-12 bg-white hover:bg-red-50 text-red-600 border-2 border-slate-100 hover:border-red-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all gap-2 shadow-sm hover:shadow-md" onClick={() => { setDeleteId(hidrante.id); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Link href={"/hidrantes/inspecao/" + hidrante.id} className="w-full h-12 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border-2 border-slate-100 hover:border-blue-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all gap-2 shadow-sm hover:shadow-md flex items-center justify-center">
                    <ClipboardCheck className="h-4 w-4" style={{ color: statusColor }} />
                    Realizar Inspeção
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
        {filteredHidrantes.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="p-5 rounded-full bg-blue-50 text-blue-600 shadow-[0_0_20px_rgba(41,121,255,0.15)] relative">
                <div className="absolute inset-0 border-2 border-blue-600 rounded-full animate-ping opacity-20" />
                <Droplets className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-slate-800 text-lg">Nenhum hidrante</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cadastre o primeiro ponto da rede para iniciar.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {editHidrante && (
        <HidranteForm hidrante={editHidrante} open={!!editHidrante} setOpen={(open) => !open && setEditHidrante(null)} />
      )}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl p-8 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Confirmar Exclusão</DialogTitle>
            <DialogDescription className="font-bold text-slate-500">Tem certeza que deseja excluir este hidrante? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50 font-black text-xs uppercase tracking-widest" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancelar</Button>
              <Button className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : "Excluir"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}
