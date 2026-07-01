"use client"

import { useState, useEffect } from "react"
import { getExtintores, deleteExtintor } from "@/app/actions/extintores"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { SearchBar } from "@/components/SearchBar"
import { KpiCard } from "@/components/KpiCard"
import { FilterTabs } from "@/components/FilterTabs"
import { FireExtinguisherCard } from "@/components/FireExtinguisherCard"
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
  const [loading, setLoading] = useState(true)
  const [editExtintor, setEditExtintor] = useState<Extintor | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    async function fetchData() {
      const data = await getExtintores()
      setExtintores(data as unknown as Extintor[])
      setFilteredExtintores(data as unknown as Extintor[])
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
        if (activeFilter === "pendentes") return status === "em-dia"
        if (activeFilter === "vencidos") return status === "vencido"
        if (activeFilter === "vencendo") return status === "vencendo"
        if (activeFilter === "em-dia") return status === "em-dia"
        if (activeFilter === "inspecionados") return status === "inspecionado"
        return true
      })
    }

    setFilteredExtintores(filtered)
    setCurrentPage(1)
  }, [extintores, activeFilter, searchQuery])

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
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header />
      <main className="px-4 lg:px-8 py-6 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="hidden lg:flex items-center justify-between mb-8">
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

          <div className="lg:hidden flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <SearchBar onSearch={setSearchQuery} />
              <ExtintorForm />
            </div>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
              <KpiCard
                type="total"
                value={total}
                label="Total"
                className="col-span-2 lg:col-span-1"
              />
              <KpiCard
                type="vencidos"
                value={vencidos}
                label="Vencidos"
                subtitle="Precisa de atenção"
              />
              <KpiCard
                type="proximos"
                value={proximos}
                label="Próximos 30 dias"
                subtitle="Vencem em breve"
              />
              <KpiCard
                type="em-dia"
                value={emDia}
                label="Em dia"
                subtitle="Tudo certo"
              />
              <KpiCard
                type="inspecoes-hoje"
                value={inspecoesHoje}
                label="Inspecções hoje"
                subtitle="Realizadas hoje"
                className="col-span-2 lg:col-span-1"
              />
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-between mb-6">
            <div className="flex-1">
              <SearchBar onSearch={setSearchQuery} className="max-w-xl" />
            </div>
            <div className="flex items-center gap-4">
              <FilterTabs
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
              <div className="text-sm text-slate-500 font-medium">
                {filteredExtintores.length} equipamentos
              </div>
            </div>
          </div>

          <div className="lg:hidden mb-6">
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          <div className="lg:hidden space-y-3">
            {paginatedExtintores.map((extintor) => (
              <FireExtinguisherCard
                key={extintor.id}
                id={extintor.id}
                codigo={extintor.codigo}
                foto={extintor.foto || undefined}
                status={getStatus(extintor)}
                localizacao={extintor.localizacao}
                unidade={extintor.unidade.nome}
                tipo={extintor.tipo}
                capacidade={extintor.capacidade}
                validade={formatDate(extintor.validadeCarga)}
                ultimaInspecao={extintor.inspecoes?.[0]?.dataInspecao ? formatDate(extintor.inspecoes[0].dataInspecao) : undefined}
              />
            ))}
          </div>

          <div className="hidden lg:block">
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
          </div>

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
        </div>
      </main>
      <BottomNavigation />

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
