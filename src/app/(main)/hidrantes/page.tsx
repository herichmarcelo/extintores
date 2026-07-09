"use client"

export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react"
import { getHidrantes, deleteHidrante } from "@/app/actions/hidrantes"
import { getUnidades } from "@/app/actions/extintores"
import { useSession } from "next-auth/react"
import { 
  RefreshCw, 
  Building2, 
  QrCode,
  ChevronRight,
  Clock,
  AlertCircle,
  Droplets,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Edit2,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/SearchBar"
import { KpiCard } from "@/components/KpiCard"
import { FilterTabs } from "@/components/FilterTabs"
import { FireHydrantTable } from "@/components/FireHydrantTable"
import { Pagination } from "@/components/Pagination"
import { BottomNavigation } from "@/components/BottomNavigation"
import { HidranteForm } from "@/components/forms/hidrante-form"
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

interface Hidrante {
  id: string
  codigo: string
  localizacao: string
  unidadeId: string
  foto?: string | null
  unidade: { id: string; nome: string }
  inspecoes?: Array<{ status: string; dataInspecao?: Date | string }>
}

export default function HidrantesPage() {
  const { data: session, status } = useSession()
  const [hidrantes, setHidrantes] = useState<Hidrante[]>([])
  const [filteredHidrantes, setFilteredHidrantes] = useState<Hidrante[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [selectedUnidade, setSelectedUnidade] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [editHidrante, setEditHidrante] = useState<Hidrante | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Estado para controlar qual card mobile está expandido
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  
  const itemsPerPage = 10

  // Obtém o nome da unidade selecionada
  const getNomeUnidadeSelecionada = () => {
    if (selectedUnidade === "todos") return "Todas as unidades"
    const unidade = unidades.find((u) => u.id === selectedUnidade)
    return unidade ? unidade.nome : "Todas as unidades"
  }

  useEffect(() => {
    async function fetchData() {
      if (status !== 'authenticated' || !session?.user?.id) return
      
      const unidadesData = await getUnidades()
      
      setUnidades(unidadesData.data || [])
      
      const hidrantesData = await getHidrantes(session.user.id)
      
      setHidrantes(hidrantesData as unknown as Hidrante[])
      setFilteredHidrantes(hidrantesData as unknown as Hidrante[])
      setLoading(false)
    }
    
    if (status === 'loading') {
      setLoading(true)
    } else {
      fetchData()
    }
  }, [status, session?.user?.id])

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

    if (activeFilter !== "todos") {
      filtered = filtered.filter((h) => {
        const status = getStatus(h)
        if (activeFilter === "pendentes") return status === "vencendo"
        if (activeFilter === "vencidos") return status === "vencido"
        if (activeFilter === "vencendo") return status === "vencendo"
        if (activeFilter === "em-dia") return status === "em-dia"
        if (activeFilter === "inspecionados") return status === "inspecionado"
        return true
      })
    }

    if (selectedUnidade !== "todos") {
      filtered = filtered.filter((h) => h.unidadeId === selectedUnidade)
    }
    
    setFilteredHidrantes(filtered)
    setCurrentPage(1)
    setExpandedCardId(null) // Fecha menus ao filtrar
  }, [hidrantes, activeFilter, searchQuery, selectedUnidade])

  const getStatus = (hidrante: Hidrante) => {
    const ultimaInspecao = hidrante.inspecoes?.[0]

    if (ultimaInspecao) {
      if (ultimaInspecao.status === "Não Conforme") return "vencido"
      return "inspecionado"
    }
    return "em-dia"
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    const result = await deleteHidrante(deleteId)
    if (result.success) {
      setHidrantes(hidrantes.filter((h) => h.id !== deleteId))
      setDeleteDialogOpen(false)
      setDeleteId(null)
      setExpandedCardId(null)
    } else {
      alert(result.error)
    }
    setIsDeleting(false)
  }

  const handleEdit = (id: string) => {
    const hidrante = hidrantes.find((h) => h.id === id)
    if (hidrante) {
      setEditHidrante(hidrante)
      setExpandedCardId(null)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const toggleCard = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id)
  }

  const total = filteredHidrantes.length
  const vencidos = filteredHidrantes.filter((h) => getStatus(h) === "vencido").length
  const proximos = filteredHidrantes.filter((h) => getStatus(h) === "vencendo").length
  const emDia = filteredHidrantes.filter((h) => getStatus(h) === "em-dia" || getStatus(h) === "inspecionado").length
  const inspecoesHoje = filteredHidrantes.filter((h) => {
    const ultima = h.inspecoes?.[0]
    if (!ultima?.dataInspecao) return false
    const data = new Date(ultima.dataInspecao)
    const hoje = new Date()
    return data.toDateString() === hoje.toDateString()
  }).length

  const paginatedHidrantes = filteredHidrantes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredHidrantes.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] overflow-x-hidden pb-24 lg:pb-0">
      {/* MOBILE LAYOUT */}
      <div className="lg:hidden">
        <div className="px-4 py-4">
          {/* SEARCH BAR */}
          <div className="mb-4">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {/* NEW HYDRANT BUTTON - FULL WIDTH */}
          <div className="mb-6">
            <HidranteForm />
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
            {paginatedHidrantes.map((hidrante) => {
              const status = getStatus(hidrante)
              const isExpanded = expandedCardId === hidrante.id

              return (
                <div key={hidrante.id} className="bg-white rounded-2xl p-4 flex flex-col shadow-sm border border-slate-100 transition-all duration-200">
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2 items-center w-[72px] shrink-0">
                      <div className="w-full h-[90px] bg-slate-100 rounded-xl flex items-center justify-center p-2">
                        {hidrante.foto ? (
                          <img src={hidrante.foto} alt={hidrante.codigo} className="w-full h-full object-contain" />
                        ) : (
                          <Droplets className="w-8 h-8 text-blue-600/50" />
                        )}
                      </div>
                      <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 bg-white shadow-sm">
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-between pt-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{hidrante.codigo}</h3>
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{hidrante.localizacao}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{hidrante.unidade.nome}</p>
                        </div>
                        <div className="flex items-center gap-1 -mt-1">
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
                          <button 
                            onClick={() => toggleCard(hidrante.id)}
                            className="p-1.5 -mr-1.5 rounded-full hover:bg-slate-100 transition-colors"
                          >
                            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                            <Droplets className="w-3 h-3 text-blue-500" />
                            <span className="text-[9px] font-medium text-slate-700">Hidrante</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                            <ClipboardCheck className="w-3 h-3 text-slate-400" />
                            <span className="text-[9px] font-medium text-slate-700">Última Insp.</span>
                          </div>
                          <span className="text-[10px] text-slate-900 font-bold pl-4">
                            {hidrante.inspecoes?.[0]?.dataInspecao ? formatDate(hidrante.inspecoes[0].dataInspecao) : '--/--/----'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MENU DE AÇÕES EXPANSÍVEL NO MOBILE */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                      <Link href={`/hidrantes/historico/${hidrante.id}`} className="flex-1">
                        <Button variant="ghost" className="w-full flex flex-col gap-1.5 h-auto py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl">
                          <FileText className="w-4 h-4" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Histórico</span>
                        </Button>
                      </Link>
                      <Link href={`/hidrantes/inspecao/${hidrante.id}`} className="flex-1">
                        <Button variant="ghost" className="w-full flex flex-col gap-1.5 h-auto py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl">
                          <ClipboardCheck className="w-4 h-4" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Inspecionar</span>
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleEdit(hidrante.id)}
                        className="flex-1 flex flex-col gap-1.5 h-auto py-3 bg-blue-50/50 hover:bg-blue-100 text-blue-600 rounded-xl"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Editar</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleDeleteClick(hidrante.id)}
                        className="flex-1 flex flex-col gap-1.5 h-auto py-3 bg-red-50/50 hover:bg-red-100 text-red-600 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Excluir</span>
                      </Button>
                    </div>
                  )}

                </div>
              )
            })}
          </div>

          {/* PAGINATION */}
          <div className="mt-6">
            {filteredHidrantes.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredHidrantes.length}
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
              <h1 className="text-4xl font-bold text-slate-900">Hidrantes</h1>
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
              <HidranteForm />
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              
              {/* CAIXA 1: Barra de Busca travada com altura 48px */}
              <div className="flex-1 max-w-md h-12">
                <SearchBar onSearch={setSearchQuery} />
              </div>
              
              {/* CAIXA 2: Select unidade */}
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
                {filteredHidrantes.length} equipamentos
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

          <FireHydrantTable
            hydrants={paginatedHidrantes.map((h) => ({
              id: h.id,
              codigo: h.codigo,
              foto: h.foto || undefined,
              status: getStatus(h),
              localizacao: h.localizacao,
              unidade: h.unidade.nome,
              ultimaInspecao: h.inspecoes?.[0]?.dataInspecao ? formatDate(h.inspecoes[0].dataInspecao) : undefined,
              onEdit: handleEdit,
              onDelete: handleDeleteClick,
            }))}
          />

          {filteredHidrantes.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredHidrantes.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {filteredHidrantes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <div className="w-10 h-16 rounded bg-blue-600/20"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum equipamento encontrado</h3>
          <p className="text-sm text-slate-500">
            {searchQuery ? "Tente ajustar os filtros ou a busca" : "Cadastre o primeiro hidrante"}
          </p>
        </div>
      )}

      <div className="lg:hidden">
        <BottomNavigation />
      </div>

      {editHidrante && (
        <HidranteForm
          hidrante={editHidrante}
          open={!!editHidrante}
          setOpen={(open) => !open && setEditHidrante(null)}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Tem certeza que deseja excluir este hidrante? Esta ação não pode ser desfeita.
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
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
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
