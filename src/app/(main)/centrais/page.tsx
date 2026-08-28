"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Siren, Search, Plus, RefreshCw, Building2,
  Flame, Thermometer, Volume2, Hand, Zap, Ban,
  ChevronRight, Filter, CheckCircle2, XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  getCentrais, getDispositivos, getEstatisticasCentral
} from "@/app/actions/centrais"
import { getUnidades } from "@/app/actions/extintores"
import { DispositivoCentralDrawer } from "@/components/forms/dispositivo-central-form"
import { cn } from "@/lib/utils"

// ─── Icon por tipo ────────────────────────────────────────────────────────────
function TipoIcon({ tipo, className }: { tipo: string; className?: string }) {
  const base = cn("w-4 h-4 shrink-0", className)
  switch (tipo) {
    case "detector_fumaca":    return <Flame       className={cn(base, "text-orange-500")} />
    case "detector_termico":   return <Thermometer className={cn(base, "text-red-500")} />
    case "sirene":             return <Volume2      className={cn(base, "text-purple-500")} />
    case "acionador_manual":   return <Hand         className={cn(base, "text-blue-500")} />
    case "fonte_alimentacao":  return <Zap          className={cn(base, "text-yellow-500")} />
    case "desabilitado":       return <Ban          className={cn(base, "text-gray-400")} />
    default:                   return <Siren        className={cn(base, "text-slate-400")} />
  }
}

function tipoLabel(tipo: string) {
  const map: Record<string, string> = {
    detector_fumaca:   "Det. Fumaça",
    detector_termico:  "Det. Térmico",
    sirene:            "Sirene",
    acionador_manual:  "Acionador",
    fonte_alimentacao: "Fonte Alim.",
    desabilitado:      "Desabilitado",
    outro:             "Outro",
  }
  return map[tipo] ?? tipo
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon: Icon, color, onClick, active
}: {
  label: string; value: number; icon: React.ElementType
  color: string; onClick?: () => void; active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 rounded-2xl p-4 text-left transition-all border",
        active
          ? "border-[#B11226] bg-[#B11226]/5 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <span className="text-2xl font-black text-slate-900">{value}</span>
    </button>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CentraisPage() {
  const { data: session, status } = useSession()

  // Seleção de unidade / central
  const [unidades, setUnidades]       = useState<{ id: string; nome: string }[]>([])
  const [centrais, setCentrais]       = useState<{ id: string; nome: string; _count: { dispositivos: number } }[]>([])
  const [unidadeId, setUnidadeId]     = useState<string>("")
  const [centralId, setCentralId]     = useState<string>("")

  // Estatísticas
  const [stats, setStats] = useState<{
    total: number; ativos: number; desabilitados: number
    detectorFumaca: number; detectorTermico: number; sirenes: number; acionadores: number
    locais: string[]
  } | null>(null)

  // Dispositivos
  const [dispositivos, setDispositivos] = useState<{
    id: string; enderecoId: string; tipo: string; tipoNormalizado: string
    local: string | null; textoNaCentral: string | null; zona: string | null
    status: string; observacoes: string | null
  }[]>([])
  const [pagination, setPagination] = useState<{ total: number; page: number; totalPages: number } | null>(null)

  // Filtros
  const [busca, setBusca]       = useState("")
  const [filtroTipo, setFiltroTipo]   = useState<string>("all")
  const [filtroLocal, setFiltroLocal] = useState<string>("all")
  const [filtroStatus, setFiltroStatus] = useState<string>("all")
  const [page, setPage]         = useState(1)

  // Drawer
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [novoOpen, setNovoOpen]       = useState(false)

  const [loading, setLoading]   = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Carrega unidades
  useEffect(() => {
    if (status !== "authenticated") return
    getUnidades().then(res => {
      const list = res.data || []
      setUnidades(list)
      if (list.length > 0) setUnidadeId(list[0].id)
    })
  }, [status])

  // Carrega centrais quando unidade muda
  useEffect(() => {
    if (!unidadeId) return
    getCentrais(unidadeId).then(res => {
      if (res.success && res.data.length > 0) {
        setCentrais(res.data as typeof centrais)
        setCentralId(res.data[0].id)
      } else {
        setCentrais([])
        setCentralId("")
      }
    })
  }, [unidadeId])

  // Carrega stats quando central muda
  useEffect(() => {
    if (!centralId) return
    getEstatisticasCentral(centralId).then(res => {
      if (res.success && res.data) setStats(res.data)
    })
  }, [centralId])

  // Carrega dispositivos
  const fetchDispositivos = useCallback(async () => {
    if (!centralId) return
    setLoading(true)
    const res = await getDispositivos(centralId, {
      busca: busca || undefined,
      tipo: filtroTipo !== "all" ? filtroTipo : undefined,
      local: filtroLocal !== "all" ? filtroLocal : undefined,
      status: filtroStatus !== "all" ? filtroStatus as "Ativo" | "Desabilitado" : undefined,
      page,
      perPage: 60,
    })
    if (res.success) {
      setDispositivos(res.data as typeof dispositivos)
      setPagination(res.pagination)
    }
    setLoading(false)
  }, [centralId, busca, filtroTipo, filtroLocal, filtroStatus, page])

  useEffect(() => {
    fetchDispositivos()
  }, [fetchDispositivos])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDispositivos()
    if (centralId) {
      const res = await getEstatisticasCentral(centralId)
      if (res.success && res.data) setStats(res.data)
    }
    setRefreshing(false)
  }

  // KPI filter toggle
  const [kpiFilter, setKpiFilter] = useState<string | null>(null)
  const toggleKpiFilter = (tipo: string) => {
    if (kpiFilter === tipo) {
      setKpiFilter(null)
      setFiltroTipo("all")
      setFiltroStatus("all")
    } else {
      setKpiFilter(tipo)
      if (tipo === "desabilitados") {
        setFiltroStatus("Desabilitado")
        setFiltroTipo("all")
      } else {
        setFiltroTipo(tipo)
        setFiltroStatus("all")
      }
      setPage(1)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B11226]/10">
              <Siren className="h-5 w-5 text-[#B11226]" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">Centrais de Incêndio</h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {pagination ? `${pagination.total} dispositivo${pagination.total !== 1 ? "s" : ""}` : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl h-9 w-9 border-slate-200"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
            {session?.user?.perfil !== "Gestor" && (
              <Button
                onClick={() => setNovoOpen(true)}
                className="bg-[#B11226] hover:bg-[#9a0f1f] text-white rounded-xl h-9 px-4 font-black text-xs uppercase tracking-wide"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Novo</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* ── Seleção Unidade / Central ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <Select value={unidadeId} onValueChange={v => { if (v) { setUnidadeId(v); setPage(1) } }}>
              <SelectTrigger className="bg-white border-slate-200 rounded-xl h-10 text-sm font-medium">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {unidades.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Siren className="h-4 w-4 text-slate-400 shrink-0" />
            <Select value={centralId} onValueChange={v => { if (v) { setCentralId(v); setPage(1) } }}>
              <SelectTrigger className="bg-white border-slate-200 rounded-xl h-10 text-sm font-medium">
                <SelectValue placeholder="Selecione a central" />
              </SelectTrigger>
              <SelectContent>
                {centrais.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome} ({c._count.dispositivos})
                  </SelectItem>
                ))}
                {centrais.length === 0 && (
                  <SelectItem value="__none" disabled>Nenhuma central</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        {stats && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <KpiCard label="Total"   value={stats.total}           icon={Siren}       color="text-slate-500" />
            <KpiCard label="Fumaça"  value={stats.detectorFumaca}  icon={Flame}       color="text-orange-500" onClick={() => toggleKpiFilter("detector_fumaca")}  active={kpiFilter === "detector_fumaca"} />
            <KpiCard label="Térmico" value={stats.detectorTermico} icon={Thermometer} color="text-red-500"    onClick={() => toggleKpiFilter("detector_termico")} active={kpiFilter === "detector_termico"} />
            <KpiCard label="Sirenes" value={stats.sirenes}         icon={Volume2}     color="text-purple-500" onClick={() => toggleKpiFilter("sirene")}           active={kpiFilter === "sirene"} />
            <KpiCard label="Acionad." value={stats.acionadores}   icon={Hand}        color="text-blue-500"  onClick={() => toggleKpiFilter("acionador_manual")} active={kpiFilter === "acionador_manual"} />
            <KpiCard label="Desabili." value={stats.desabilitados} icon={Ban}         color="text-gray-400"  onClick={() => toggleKpiFilter("desabilitados")}    active={kpiFilter === "desabilitados"} />
          </div>
        )}

        {/* ── Filtros ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por endereço, local ou texto..."
              value={busca}
              onChange={e => { setBusca(e.target.value); setPage(1) }}
              className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filtroTipo} onValueChange={v => { setFiltroTipo(v ?? "all"); setKpiFilter(null); setPage(1) }}>
              <SelectTrigger className="bg-white border-slate-200 rounded-xl h-10 text-sm w-40">
                <Filter className="h-3 w-3 mr-1 text-slate-400" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="detector_fumaca">Detector Fumaça</SelectItem>
                <SelectItem value="detector_termico">Detector Térmico</SelectItem>
                <SelectItem value="sirene">Sirene</SelectItem>
                <SelectItem value="acionador_manual">Acionador Manual</SelectItem>
                <SelectItem value="fonte_alimentacao">Fonte Alimentação</SelectItem>
                <SelectItem value="desabilitado">Desabilitado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={v => { setFiltroStatus(v ?? "all"); setKpiFilter(null); setPage(1) }}>
              <SelectTrigger className="bg-white border-slate-200 rounded-xl h-10 text-sm w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Desabilitado">Desabilitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Tabela ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : dispositivos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Siren className="h-10 w-10 text-slate-200" />
              <p className="text-slate-400 font-medium text-sm">
                {centralId ? "Nenhum dispositivo encontrado" : "Selecione uma central"}
              </p>
            </div>
          ) : (
            <>
              {/* Header da tabela — desktop */}
              <div className="hidden sm:grid grid-cols-[80px_1fr_1fr_80px_90px] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">End.</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zona</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
              </div>

              <div className="divide-y divide-slate-100">
                {dispositivos.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedId(d.id); setDrawerOpen(true) }}
                    className="w-full text-left hover:bg-slate-50 transition-colors group"
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden flex items-center gap-3 px-4 py-3">
                      <TipoIcon tipo={d.tipoNormalizado} className="w-5 h-5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">E{d.enderecoId}</span>
                          <span className="text-xs text-slate-500 truncate">{tipoLabel(d.tipoNormalizado)}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{d.local ?? "—"}</p>
                      </div>
                      <Badge
                        className={cn(
                          "text-[10px] font-black shrink-0",
                          d.status === "Ativo"
                            ? "bg-emerald-100 text-emerald-700 border-0"
                            : "bg-slate-100 text-slate-500 border-0"
                        )}
                      >
                        {d.status === "Ativo" ? <CheckCircle2 className="w-3 h-3 mr-0.5" /> : <XCircle className="w-3 h-3 mr-0.5" />}
                        {d.status}
                      </Badge>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-[80px_1fr_1fr_80px_90px] gap-4 px-5 py-3 items-center">
                      <div className="flex items-center gap-2">
                        <TipoIcon tipo={d.tipoNormalizado} />
                        <span className="font-black text-slate-900 text-sm">E{d.enderecoId}</span>
                      </div>
                      <span className="text-sm text-slate-700 truncate font-medium">{tipoLabel(d.tipoNormalizado)}</span>
                      <span className="text-sm text-slate-500 truncate">{d.local ?? "—"}</span>
                      <span className="text-sm text-slate-400 font-mono">Z{d.zona ?? "00"}</span>
                      <div className="flex items-center justify-between">
                        <Badge
                          className={cn(
                            "text-[10px] font-black",
                            d.status === "Ativo"
                              ? "bg-emerald-100 text-emerald-700 border-0"
                              : "bg-slate-100 text-slate-500 border-0"
                          )}
                        >
                          {d.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Paginação */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50">
                  <p className="text-xs text-slate-500">
                    {((page - 1) * 60) + 1}–{Math.min(page * 60, pagination.total)} de {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="rounded-lg text-xs h-8"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="rounded-lg text-xs h-8"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Drawer Edição ── */}
      {selectedId && (
        <DispositivoCentralDrawer
          id={selectedId}
          open={drawerOpen}
          onClose={() => { setDrawerOpen(false); setSelectedId(null) }}
          onSuccess={() => { fetchDispositivos(); handleRefresh() }}
          userId={session?.user?.id ?? ""}
          perfil={session?.user?.perfil ?? ""}
        />
      )}

      {/* ── Drawer Novo ── */}
      {centralId && (
        <DispositivoCentralDrawer
          id={null}
          centralId={centralId}
          open={novoOpen}
          onClose={() => setNovoOpen(false)}
          onSuccess={() => { fetchDispositivos(); handleRefresh(); setNovoOpen(false) }}
          userId={session?.user?.id ?? ""}
          perfil={session?.user?.perfil ?? ""}
        />
      )}
    </div>
  )
}
