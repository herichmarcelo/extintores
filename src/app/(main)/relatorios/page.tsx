"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Calendar as CalendarIcon, 
  Search, 
  FileStack, 
  Building2, 
  User, 
  FileText, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  SlidersHorizontal 
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BottomNavigation } from "@/components/BottomNavigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Importações do calendário moderno (Shadcn UI)
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils" // Utilitário de classes do Shadcn

// Importações para gerar o PDF e buscar os dados
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useSession } from "next-auth/react"
import { getRelatoriosExtintores, getUnidades } from "@/app/actions/extintores"

// Função auxiliar para converter Imagens em Base64
const loadImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erro ao carregar imagem:", error);
    return "";
  }
}

// Função auxiliar para verificar vencimento
const getStatusExtintor = (validade: Date | string) => {
  const dataValidade = new Date(validade)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const trintaDias = new Date()
  trintaDias.setDate(trintaDias.getDate() + 30)

  if (dataValidade < hoje) return "VENCIDO"
  if (dataValidade <= trintaDias) return "VENCENDO"
  return "EM DIA"
}

export default function RelatoriosPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Dados do Banco
  const [extintores, setExtintores] = useState<any[]>([])
  const [filteredExtintores, setFilteredExtintores] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])

  // Estados para os Filtros Avançados (Datas agora usam objetos Date)
  const [filterUnidade, setFilterUnidade] = useState("todas")
  const [filterDataInicio, setFilterDataInicio] = useState<Date>()
  const [filterDataFim, setFilterDataFim] = useState<Date>()
  const [filterColaborador, setFilterColaborador] = useState("")
  const [buscaGeral, setBuscaGeral] = useState("")

  useEffect(() => {
    async function loadData() {
      if (sessionStatus === 'loading' || !session?.user?.id) return
      
      setIsLoadingData(true)
      try {
        const [extData, uniData] = await Promise.all([
          getRelatoriosExtintores(session.user.id), 
          getUnidades()
        ])
        setExtintores(extData as any[])
        setFilteredExtintores(extData as any[])
        setUnidades(uniData?.data || [])
      } catch (error) {
        console.error("Erro ao carregar dados", error)
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [sessionStatus, session?.user?.id])

  useEffect(() => {
    let result = [...extintores]

    if (buscaGeral) {
      const term = buscaGeral.toLowerCase()
      result = result.filter(e => 
        e.codigo?.toLowerCase().includes(term) || 
        e.localizacao?.toLowerCase().includes(term) ||
        e.tipo?.toLowerCase().includes(term)
      )
    }

    if (filterUnidade !== "todas") {
      result = result.filter(e => e.unidadeId === filterUnidade)
    }

    if (filterDataInicio || filterDataFim || filterColaborador) {
      result = result.filter(ext => {
        if (!ext.inspecoes || ext.inspecoes.length === 0) return false;
        
        return ext.inspecoes.some((insp: any) => {
          let matchData = true;
          let matchColab = true;
          
          const inspDate = new Date(insp.dataInspecao);
          inspDate.setHours(0, 0, 0, 0);

          if (filterDataInicio) {
            const start = new Date(filterDataInicio);
            start.setHours(0, 0, 0, 0);
            if (inspDate < start) matchData = false;
          }
          
          if (filterDataFim) {
            const end = new Date(filterDataFim);
            end.setHours(0, 0, 0, 0);
            if (inspDate > end) matchData = false;
          }
          
          if (filterColaborador) {
            matchColab = insp.usuario?.nome?.toLowerCase().includes(filterColaborador.toLowerCase());
          }
          return matchData && matchColab;
        });
      });
    }

    setFilteredExtintores(result)
  }, [extintores, filterUnidade, filterDataInicio, filterDataFim, filterColaborador, buscaGeral])

  const countTotal = filteredExtintores.length
  const countVencidos = filteredExtintores.filter(e => getStatusExtintor(e.validadeCarga) !== "EM DIA").length
  const countInspecionados = filteredExtintores.filter(e => e.inspecoes && e.inspecoes.length > 0).length

  // ============================================================================
  // GERAÇÃO DE PDF
  // ============================================================================
  const gerarRelatorioPDF = async (tipo: "todos" | "vencimentos" | "detalhado") => {
    if (filteredExtintores.length === 0) {
      alert("Não há dados na tabela para gerar o relatório.")
      return
    }

    setIsGenerating(tipo)
    
    try {
      const doc = new jsPDF()
      const dataAtual = new Date().toLocaleDateString('pt-BR')
      const logoBase64 = await loadImageAsBase64('/novalogo.png')

      if (tipo === "todos") {
        if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 10, 35, 15)
        doc.setFontSize(16)
        doc.text("Relatório Geral de Extintores", 14, 35)
        doc.setFontSize(10)
        doc.text(`Gerado em: ${dataAtual} | Total: ${filteredExtintores.length} equipamentos`, 14, 42)

        const tableData = filteredExtintores.map(ext => [
          ext.codigo, ext.localizacao, ext.tipo, ext.capacidade,
          new Date(ext.validadeCarga).toLocaleDateString('pt-BR'), ext.unidade?.nome || "-"
        ])

        autoTable(doc, {
          startY: 50,
          head: [['Código', 'Localização', 'Tipo', 'Capacidade', 'Validade', 'Unidade']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [40, 40, 40] } 
        })
        doc.save(`extintores_geral_${dataAtual.replace(/\//g, '-')}.pdf`)
      }
      else if (tipo === "vencimentos") {
        if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 10, 35, 15)
        doc.setFontSize(16)
        doc.setTextColor(220, 38, 38)
        doc.text("Alerta de Vencimentos", 14, 35)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.text(`Gerado em: ${dataAtual}`, 14, 42)

        const extintoresAlerta = filteredExtintores.filter(ext => getStatusExtintor(ext.validadeCarga) !== "EM DIA")
        const tableData = extintoresAlerta.map(ext => [
          ext.codigo, ext.localizacao, new Date(ext.validadeCarga).toLocaleDateString('pt-BR'),
          getStatusExtintor(ext.validadeCarga), ext.unidade?.nome || "-"
        ])

        autoTable(doc, {
          startY: 50,
          head: [['Código', 'Localização', 'Validade', 'Status', 'Unidade']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [220, 38, 38] },
          didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 3) {
              if (data.cell.raw === 'VENCIDO') { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
              else { data.cell.styles.textColor = [234, 88, 12]; data.cell.styles.fontStyle = 'bold'; }
            }
          }
        })
        doc.save(`extintores_vencimentos_${dataAtual.replace(/\//g, '-')}.pdf`)
      }
      else if (tipo === "detalhado") {
        let pagesAdded = 0;
        for (let i = 0; i < filteredExtintores.length; i++) {
          const ext = filteredExtintores[i]
          if (pagesAdded > 0) doc.addPage()
          pagesAdded++;

          doc.setFillColor(248, 250, 252) 
          doc.rect(0, 0, 210, 35, 'F')
          
          if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 7, 40, 20)
          
          doc.setFontSize(18)
          doc.setTextColor(15, 23, 42)
          doc.text(`CheckList Técnico: ${ext.codigo}`, 65, 22)
          
          doc.setFontSize(12)
          doc.setTextColor(51, 65, 85)
          doc.text("Especificações do Equipamento", 14, 50)
          
          doc.setFontSize(10)
          doc.setTextColor(71, 85, 105)
          doc.text(`Unidade: ${ext.unidade?.nome || "-"}`, 14, 60)
          doc.text(`Local: ${ext.localizacao}`, 14, 67)
          doc.text(`Classe/Carga: ${ext.tipo} - ${ext.capacidade}`, 14, 74)
          doc.text(`Validade Carga: ${new Date(ext.validadeCarga).toLocaleDateString('pt-BR')}`, 14, 81)

          let currentY = 95;
          let inspecoesParaExibir = ext.inspecoes || [];
          
          if (filterDataInicio || filterDataFim) {
            inspecoesParaExibir = inspecoesParaExibir.filter((insp: any) => {
              const inspDate = new Date(insp.dataInspecao);
              inspDate.setHours(0, 0, 0, 0);
              
              if (filterDataInicio) {
                const start = new Date(filterDataInicio);
                start.setHours(0, 0, 0, 0);
                if (inspDate < start) return false;
              }
              if (filterDataFim) {
                const end = new Date(filterDataFim);
                end.setHours(0, 0, 0, 0);
                if (inspDate > end) return false;
              }
              return true;
            });
          }

          if (filterColaborador) {
            inspecoesParaExibir = inspecoesParaExibir.filter((insp: any) => insp.usuario?.nome?.toLowerCase().includes(filterColaborador.toLowerCase()));
          }

          if (inspecoesParaExibir.length === 0) {
            doc.text("Nenhum registro de inspeção no período selecionado.", 14, currentY)
          } else {
            for (const insp of inspecoesParaExibir) {
              if (currentY > 260) { doc.addPage(); currentY = 20; }

              doc.setFontSize(12)
              doc.setTextColor(15, 23, 42)
              doc.setFont("helvetica", "bold")
              doc.text(`Data da Inspeção: ${new Date(insp.dataInspecao).toLocaleDateString('pt-BR')}`, 14, currentY)
              currentY += 6

              doc.setFontSize(9)
              doc.setFont("helvetica", "normal")
              doc.setTextColor(100, 116, 139)
              doc.text(`Inspetor Responsável: ${insp.usuario?.nome || 'Não informado'} | Resultado: ${insp.status}`, 14, currentY)
              currentY += 6

              if (insp.observacao) {
                doc.text(`Laudo/Obs: ${insp.observacao}`, 14, currentY)
                currentY += 6
              }

              currentY += 2
              let checklistData: string[][] = []

              if (Array.isArray(insp.checklist) && insp.checklist.length > 0) {
                checklistData = insp.checklist.map((item: any) => [
                  item.pergunta || item.nome, item.resposta || '-', item.conforme ? 'Sim' : 'Não'
                ])
              } else {
                const mapeamento = [
                  { campo: 'lacre', rotulo: 'Lacre Intacto' },
                  { campo: 'manometro', rotulo: 'Pressão (Manômetro)' },
                  { campo: 'sinalizacao', rotulo: 'Sinalização Visível' },
                  { campo: 'mangueira', rotulo: 'Mangueira/Bico' },
                  { campo: 'pintura', rotulo: 'Estado do Cilindro' }
                ]
                mapeamento.forEach(item => {
                  if (insp[item.campo] !== undefined && insp[item.campo] !== null) {
                    const isConforme = insp[item.campo] === true || insp[item.campo] === "Conforme" || insp[item.campo] === "Sim"
                    checklistData.push([item.rotulo, isConforme ? 'OK' : 'Falha', isConforme ? 'Sim' : 'Não'])
                  }
                })
              }

              if (checklistData.length > 0) {
                autoTable(doc, {
                  startY: currentY,
                  head: [['Parâmetro Avaliado', 'Laudo', 'Conformidade']],
                  body: checklistData,
                  theme: 'grid',
                  headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
                  didParseCell: function(data) {
                    if (data.section === 'body' && (data.cell.raw === 'Não' || data.cell.raw === 'Falha')) {
                      data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold';
                    }
                  }
                })
                currentY = (doc as any).lastAutoTable.finalY + 10
              }

              const itemsComFoto = insp.checklist?.filter((item: any) => item.foto)
              if (itemsComFoto && itemsComFoto.length > 0) {
                doc.setFontSize(10)
                doc.setTextColor(15, 23, 42)
                doc.text("Anexos Fotográficos:", 14, currentY)
                currentY += 8
                for (const item of itemsComFoto) {
                  if (currentY > 210) { doc.addPage(); currentY = 20; }
                  doc.setFontSize(8)
                  doc.text(`Evidência: ${item.pergunta}`, 14, currentY)
                  currentY += 4
                  try {
                    let fotoB64 = item.foto
                    if (fotoB64.startsWith('http') || fotoB64.startsWith('/')) fotoB64 = await loadImageAsBase64(fotoB64)
                    if (fotoB64) { doc.addImage(fotoB64, 'JPEG', 14, currentY, 50, 50); currentY += 55; }
                  } catch (e) {
                    doc.setTextColor(220, 38, 38)
                    doc.text("[Erro na renderização da imagem]", 14, currentY); currentY += 10;
                  }
                }
              }
              currentY += 10 
            }
          }
        }
        doc.save(`checklist_detalhado_${dataAtual.replace(/\//g, '-')}.pdf`)
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      alert("Ocorreu um erro ao processar o arquivo PDF.")
    } finally {
      setIsGenerating(null)
    }
  }

  const limparFiltros = () => {
    setFilterUnidade("todas")
    setFilterDataInicio(undefined)
    setFilterDataFim(undefined)
    setFilterColaborador("")
    setBuscaGeral("")
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row font-sans selection:bg-blue-500/30 text-zinc-900 pb-20 lg:pb-0">
      
      {/* =========================================
          COLUNA ESQUERDA: PAINEL DE CONTROLE 
          ========================================= */}
      <aside className="w-full lg:w-[380px] bg-white border-r border-zinc-200 lg:h-screen lg:sticky lg:top-0 flex flex-col shrink-0 overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        
        <div className="p-6 border-b border-zinc-100 bg-white">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Exportação
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gere relatórios e checklists em PDF.
          </p>
        </div>

        {/* Bloco 1: Ações de Exportação */}
        <div className="p-6 border-b border-zinc-100 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Formatos de Relatório
            </h2>
          </div>

          <button 
            onClick={() => gerarRelatorioPDF("todos")}
            disabled={isGenerating !== null}
            className="flex items-start gap-4 p-4 rounded-xl border border-zinc-200 bg-white hover:border-blue-500 hover:shadow-[0_4px_12px_rgba(59,130,246,0.1)] transition-all text-left group"
          >
            <div className={`p-2 rounded-lg bg-blue-50 text-blue-600 ${isGenerating === 'todos' ? 'animate-pulse' : ''}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">Inventário Geral</h3>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">Lista completa de equipamentos baseada nos filtros atuais.</p>
            </div>
          </button>

          <button 
            onClick={() => gerarRelatorioPDF("vencimentos")}
            disabled={isGenerating !== null}
            className="flex items-start gap-4 p-4 rounded-xl border border-zinc-200 bg-white hover:border-red-500 hover:shadow-[0_4px_12px_rgba(239,68,68,0.1)] transition-all text-left group"
          >
            <div className={`p-2 rounded-lg bg-red-50 text-red-600 ${isGenerating === 'vencimentos' ? 'animate-pulse' : ''}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-red-600 transition-colors">Relatório Crítico</h3>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">Apenas ativos vencidos ou próximos do vencimento.</p>
            </div>
          </button>

          <button 
            onClick={() => gerarRelatorioPDF("detalhado")}
            disabled={isGenerating !== null}
            className="flex items-start gap-4 p-4 rounded-xl border border-zinc-200 bg-white hover:border-emerald-500 hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)] transition-all text-left group"
          >
            <div className={`p-2 rounded-lg bg-emerald-50 text-emerald-600 ${isGenerating === 'detalhado' ? 'animate-pulse' : ''}`}>
              <FileStack className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors">CheckLists Detalhados</h3>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">Histórico completo de inspeções com fotos e laudos.</p>
            </div>
          </button>
        </div>

        {/* Bloco 2: Filtros Fixos */}
        <div className="p-6 flex-1 flex flex-col gap-5 bg-zinc-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Parâmetros de Filtro
              </h2>
            </div>
            {(filterUnidade !== "todas" || filterDataInicio || filterDataFim || filterColaborador) && (
              <button onClick={limparFiltros} className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 transition-colors">
                Limpar
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-600">Unidade Base</label>
              <Select value={filterUnidade} onValueChange={setFilterUnidade}>
                <SelectTrigger className="w-full bg-white border-zinc-200 h-10 shadow-sm focus:ring-blue-500">
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as unidades</SelectItem>
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
            {/* DATE PICKER SHADCN: DATA INÍCIO */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-semibold text-zinc-600">Data Início</label>
              <Popover>
                <PopoverTrigger
                  render={<Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-10 justify-start text-left font-normal bg-white border-zinc-200 shadow-sm",
                      !filterDataInicio && "text-zinc-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDataInicio ? format(filterDataInicio, "dd/MM/yyyy", { locale: ptBR }) : <span>DD/MM/AAAA</span>}
                  </Button>}
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterDataInicio}
                    onSelect={setFilterDataInicio}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* DATE PICKER SHADCN: DATA FIM */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[11px] font-semibold text-zinc-600">Data Fim</label>
              <Popover>
                <PopoverTrigger
                  render={<Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-10 justify-start text-left font-normal bg-white border-zinc-200 shadow-sm",
                      !filterDataFim && "text-zinc-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDataFim ? format(filterDataFim, "dd/MM/yyyy", { locale: ptBR }) : <span>DD/MM/AAAA</span>}
                  </Button>}
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterDataFim}
                    onSelect={setFilterDataFim}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-600">Técnico / Inspetor</label>
              <Input 
                type="text"
                placeholder="Ex: João Silva"
                value={filterColaborador}
                onChange={(e) => setFilterColaborador(e.target.value)}
                className="bg-white border-zinc-200 h-10 shadow-sm text-sm focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================
          COLUNA DIREITA: LIVE PREVIEW E DADOS
          ========================================= */}
      <main className="flex-1 flex flex-col h-full lg:h-screen lg:overflow-y-auto w-full p-4 lg:p-8 gap-6">
        
        {/* Topo do Main: Busca Rápida e Título */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-800">Pré-visualização de Dados</h2>
            <p className="text-sm text-zinc-500 mt-1">O PDF será gerado com base nos registros abaixo.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Buscar por código ou local..." 
              value={buscaGeral}
              onChange={(e) => setBuscaGeral(e.target.value)}
              className="pl-9 h-10 bg-white border-zinc-200 shadow-sm rounded-full focus-visible:ring-blue-500"
            />
          </div>
        </div>

        {/* Cards de Métricas Estilo Minimalista */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Filtrado</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">{isLoadingData ? '-' : countTotal}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
              <FileStack className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Com Inspeção</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">{isLoadingData ? '-' : countInspecionados}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Vencimentos</p>
              <p className={`text-2xl font-bold mt-1 ${countVencidos > 0 ? 'text-red-600' : 'text-zinc-900'}`}>
                {isLoadingData ? '-' : countVencidos}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${countVencidos > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {countVencidos > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            {countVencidos > 0 && (
              <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
            )}
          </div>
        </div>

        {/* Tabela de Dados (Estilo Data Grid) */}
        <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            {isLoadingData ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-400">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium">Carregando dados estruturados...</p>
              </div>
            ) : filteredExtintores.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-400">
                <FileText className="w-10 h-10 text-zinc-300 mb-3" />
                <p className="text-sm font-medium">Nenhum registro encontrado para estes filtros.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80 border-b border-zinc-200">
                    <TableHead className="font-semibold text-xs text-zinc-500 h-11">Identificação</TableHead>
                    <TableHead className="font-semibold text-xs text-zinc-500 h-11">Unidade & Local</TableHead>
                    <TableHead className="font-semibold text-xs text-zinc-500 h-11">Especificação</TableHead>
                    <TableHead className="font-semibold text-xs text-zinc-500 h-11 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExtintores.slice(0, 20).map((ext) => {
                    const status = getStatusExtintor(ext.validadeCarga);
                    const isVencido = status === "VENCIDO" || status === "VENCENDO";
                    
                    return (
                      <TableRow key={ext.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                        <TableCell className="py-3">
                          <span className="font-mono text-sm font-semibold text-zinc-900 bg-zinc-100 px-2 py-1 rounded">
                            {ext.codigo}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-900">{ext.unidade?.nome || "Sem Unidade"}</span>
                            <span className="text-xs text-zinc-500">{ext.localizacao}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                           <div className="flex flex-col">
                            <span className="text-sm text-zinc-700">{ext.tipo}</span>
                            <span className="text-xs text-zinc-500">{ext.capacidade}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Badge 
                            variant="outline"
                            className={`font-medium text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                              isVencido 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
          {filteredExtintores.length > 20 && (
             <div className="bg-zinc-50 p-3 text-center border-t border-zinc-200">
               <span className="text-xs font-medium text-zinc-500">
                 Mostrando 20 de {filteredExtintores.length} registros. A exportação em PDF incluirá todos.
               </span>
             </div>
          )}
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}