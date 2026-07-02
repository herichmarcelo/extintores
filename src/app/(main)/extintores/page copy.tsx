"use client"

import { useState, useEffect } from "react"
import { getExtintores, deleteExtintor, getUnidades } from "@/app/actions/extintores"
import { 
  RefreshCw, 
  Building2, 
  QrCode,
  ChevronRight,
  Clock,
  AlertCircle,
  Flame,
  Calendar,
  CheckCircle2,
  ClipboardCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/SearchBar"
import { KpiCard } from "@/components/KpiCard"
import { FilterTabs } from "@/components/FilterTabs"
import { FireExtinguisherTable } from "@/components/FireExtinguisherTable"
import { Pagination } from "@/components/Pagination"
import { BottomNavigation } from "@/components/BottomNavigation"
import { ExtintorForm } from "@/components/forms/extintor-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  SelectItem,
} from "@/components/ui/select"
import { SelectWithIcon } from "@/components/SelectWithIcon"

type FilterType = "todos" | "pendentes" | "vencidos" | "vencendo" | "em-dia" | "inspecionados"

interface Extintor {
  id: string
  codigo: string
  localizacao: string
  tipo: string
  capacidade: string
  validadeCarga: Date | string
  unidadeId: string
  foto?: string | null
  unidade: { id: string; nome: string }
  inspecoes?: Array<{ status: string; dataInspecao?: Date | string }>
}

export default function ExtintoresPage() {
  const [extintores, setExtintores] = useState<Extintor[]>([])
  const [filteredExtintores, setFilteredExtintores] = useState<Extintor[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [selectedUnidade, setSelectedUnidade] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [editExtintor, setEditExtintor] = useState<Extintor | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Obtém o nome da unidade selecionada
  const getNomeUnidadeSelecionada = () => {
    if (selectedUnidade === "todos") return "Todas as unidades"
    const unidade = unidades.find((u) => u.id === selectedUnidade)
    return unidade ? unidade.nome : "Todas as unidades"
  }

  useEffect(() => {
    async function fetchData() {
      const [extintoresData, unidadesData] = await Promise.all([
        getExtintores(),
        getUnidades()
      ])
      setExtintores(extintoresData as unknown as Extintor[])
      setFilteredExtintores(extintoresData as unknown as Extintor[])
      setUnidades(unidadesData.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...extintores]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.codigo.toLowerCase().includes(query) ||
          e.localizacao.toLowerCase().includes(query) ||
          e.tipo.toLowerCase().includes(query)
      )
    }

    if (activeFilter !== "todos") {
      filtered = filtered.filter((e) => {
        const status = getStatus(e)
        if (activeFilter === "pendentes") return status === "vencendo"
        if (activeFilter === "vencidos") return status === "vencido"
        if (activeFilter === "vencendo") return status === "vencendo"
        if (activeFilter === "em-dia") return status === "em-dia"
        if (activeFilter === "inspecionados") return status === "inspecionado"
        return true
      })
    }

    if (selectedUnidade !== "todos") {
      filtered = filtered.filter((e) => e.unidadeId === selectedUnidade)
    }

    setFilteredExtintores(filtered)
    setCurrentPage(1)
  }, [extintores, activeFilter, searchQuery, selectedUnidade])

  const getStatus = (extintor: Extintor) => {
    const validade = new Date(extintor.validadeCarga)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const trintaDias = new Date()
    trintaDias.setDate(trintaDias.getDate() + 30)

    const ultimaInspecao = extintor.inspecoes?.[0]

    if (validade < hoje) return "vencido"
    if (validade <= trintaDias) return "vencendo"
    if (ultimaInspecao) return "inspecionado"
    return "em-dia"
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    const result = await deleteExtintor(deleteId)
    if (result.success) {
      setExtintores(extintores.filter((e) => e.id !== deleteId))
      setDeleteDialogOpen(false)
      setDeleteId(null)
    } else {
      alert(result.error)
    }
    setIsDeleting(false)
  }

  const handleEdit = (id: string) => {
    const extintor = extintores.find((e) => e.id === id)
    if (extintor) {
      setEditExtintor(extintor)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const total = extintores.length
  const vencidos = extintores.filter((e) => getStatus(e) === "vencido").length
  const proximos = extintores.filter((e) => getStatus(e) === "vencendo").length
  const emDia = extintores.filter((e) => getStatus(e) === "em-dia" || getStatus(e) === "inspecionado").length
  const inspecoesHoje = extintores.filter((e) => {
    const ultima = e.inspecoes?.[0]
    if (!ultima?.dataInspecao) return false
    const data = new Date(ultima.dataInspecao)
    const hoje = new Date()
    return data.toDateString() === hoje.toDateString()
  }).length

  const paginatedExtintores = filteredExtintores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredExtintores.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B11226]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] overflow-x-hidden pb-24 lg:pb-0">
      {/* MOBILE LAYOUT */}
      <div className="lg:hidden">
        {/* MOBILE CONTENT */}
        <div className="px-4 py-4">
          {/* SEARCH BAR */}
          <div className="mb-4">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {/* NEW EXTINGUISHER BUTTON - FULL WIDTH */}
          <div className="mb-6">
            <ExtintorForm />
          </div>

          {/* KPIs 2x2 GRID */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <KpiCard type="vencidos" value={vencidos} label="Vencidos" subtitle="Precisa de atenção" />
            <KpiCard type="proximos" value={proximos} label="Próximos" subtitle="Vencem em breve" />
            <KpiCard type="em-dia" value={emDia} label="Em dia" subtitle="Tudo certo" />
            <KpiCard type="inspecoes-hoje" value={inspecoesHoje} label="Hoje" subtitle="Realizadas" />
          </div>

          {/* FILTER TABS */}
          <div className="mb-4">
            <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* SELECT UNIDADE */}
          <div className="mb-6 h-12">
            <SelectWithIcon
              icon={<Building2 className="w-5 h-5" />}
              value={selectedUnidade}
              onValueChange={(value) => setSelectedUnidade(value ?? "todos")}
              placeholder={getNomeUnidadeSelecionada()}
              displayValue={getNomeUnidadeSelecionada()}
              className="w-full h-full"
            >
              <SelectItem value="todos" className="font-medium">Todas as unidades</SelectItem>
              {unidades.map((u) => (
                <SelectItem key={u.id} value={u.id} className="font-medium">
                  {u.nome}
                </SelectItem>
              ))}
            </SelectWithIcon>
          </div>

          {/* CARDS LIST */}
          <div className="space-y-5">
            {paginatedExtintores.map((extintor) => {
              const status = getStatus(extintor);
              return (
                <div key={extintor.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-slate-100">
                  <div className="flex flex-col gap-2 items-center w-[72px] shrink-0">
                    <div className="w-full h-[90px] bg-slate-100 rounded-xl flex items-center justify-center p-2">
                      {extintor.foto ? (
                        <img src={extintor.foto} alt={extintor.codigo} className="w-full h-full object-contain" />
                      ) : (
                        <Flame className="w-8 h-8 text-[#B11226]/50" />
                      )}
                    </div>
                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 bg-white shadow-sm">
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col justify-between pt-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{extintor.codigo}</h3>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{extintor.localizacao}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{extintor.unidade.nome}</p>
                      </div>
                      <div className="flex items-center gap-1.5 -mt-1">
                        {status === 'vencido' && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider border border-red-100">
                            <AlertCircle className="w-3 h-3" /> Vencido
                          </span>
                        )}
                        {status === 'em-dia' || status === 'inspecionado' ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider border border-green-100">
                            <CheckCircle2 className="w-3 h-3" /> Em dia
                          </span>
                        ) : null}
                        {status === 'vencendo' && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider border border-orange-100">
                            <Clock className="w-3 h-3" /> Vencendo
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-[9px] font-bold text-slate-700">{extintor.tipo}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-medium pl-4">{extintor.capacidade}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-[9px] font-medium text-slate-700">Validade</span>
                        </div>
                        <span className="text-[10px] text-slate-900 font-bold pl-4">{formatDate(extintor.validadeCarga)}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                          <ClipboardCheck className="w-3 h-3 text-slate-400" />
                          <span className="text-[9px] font-medium text-slate-700">Última Insp.</span>
                        </div>
                        <span className="text-[10px] text-slate-900 font-bold pl-4">
                          {extintor.inspecoes?.[0]?.dataInspecao ? formatDate(extintor.inspecoes[0].dataInspecao) : '--/--/----'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* PAGINATION */}
          <div className="mt-6">
            {filteredExtintores.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredExtintores.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Extintores</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Matriz e Unidades</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="h-10 px-4 rounded-xl border border-[#E5E7EB] hover:bg-white hover:text-slate-900 font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <ExtintorForm />
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              
              {/* CAIXA 1: Barra de Busca travada com altura 48px */}
              <div className="flex-1 max-w-md h-12">
                <SearchBar onSearch={setSearchQuery} />
              </div>
              
              {/* CAIXA 2: Select travado com a mesma altura e largura que você definiu */}
              <div className="w-80 h-12">
                <SelectWithIcon
                  icon={<Building2 className="w-5 h-5" />}
                  value={selectedUnidade}
                  onValueChange={(value) => setSelectedUnidade(value ?? "todos")}
                  placeholder={getNomeUnidadeSelecionada()}
                  displayValue={getNomeUnidadeSelecionada()}
                  className="w-full h-full"
                >
                  <SelectItem value="todos" className="font-medium">Todas as unidades</SelectItem>
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="font-medium">
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectWithIcon>
              </div>

            </div>
            
            <div className="flex items-center gap-4">
              <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              <div className="text-sm text-slate-500 font-medium">
                {filteredExtintores.length} equipamentos
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            <KpiCard type="total" value={total} label="Total" />
            <KpiCard type="vencidos" value={vencidos} label="Vencidos" subtitle="Precisa de atenção" />
            <KpiCard type="proximos" value={proximos} label="Próximos 30 dias" subtitle="Vencem em breve" />
            <KpiCard type="em-dia" value={emDia} label="Em dia" subtitle="Tudo certo" />
            <KpiCard type="inspecoes-hoje" value={inspecoesHoje} label="Inspecções hoje" subtitle="Realizadas hoje" />
          </div>

          <FireExtinguisherTable
            extinguishers={paginatedExtintores.map((e) => ({
              id: e.id,
              codigo: e.codigo,
              foto: e.foto || undefined,
              status: getStatus(e),
              localizacao: e.localizacao,
              unidade: e.unidade.nome,
              tipo: e.tipo,
              capacidade: e.capacidade,
              validade: formatDate(e.validadeCarga),
              ultimaInspecao: e.inspecoes?.[0]?.dataInspecao ? formatDate(e.inspecoes[0].dataInspecao) : undefined,
              onEdit: handleEdit,
              onDelete: handleDeleteClick,
            }))}
          />

          {filteredExtintores.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredExtintores.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {filteredExtintores.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <div className="w-10 h-16 rounded bg-[#B11226]/20"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum equipamento encontrado</h3>
          <p className="text-sm text-slate-500">
            {searchQuery ? "Tente ajustar os filtros ou a busca" : "Cadastre o primeiro extintor"}
          </p>
        </div>
      )}

      <div className="lg:hidden">
        <BottomNavigation />
      </div>

      {editExtintor && (
        <ExtintorForm
          extintor={editExtintor}
          open={!!editExtintor}
          setOpen={(open) => !open && setEditExtintor(null)}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Tem certeza que deseja excluir este extintor? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl border-[#E5E7EB] hover:bg-slate-100"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl bg-[#B11226] hover:bg-[#9a0f1f] text-white font-bold"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}