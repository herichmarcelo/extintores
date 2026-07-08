"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Filter, Calendar, Search, Activity, AlertCircle, FileStack, Building2, User, X, Loader2, ShieldCheck } from "lucide-react"
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
import { motion, AnimatePresence } from "framer-motion"
import { BottomNavigation } from "@/components/BottomNavigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Importações para gerar o PDF e buscar os dados
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getExtintores, getUnidades } from "@/app/actions/extintores"

// Cores do tema Documentos/Analytics
const COLORS = {
  violetNeon: "#7c3aed",
  pinkNeon: "#ec4899",
  blueNeon: "#2979ff",
  redNeon: "#ff1744",
  orangeNeon: "#ff6d00",
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Dados do Banco
  const [extintores, setExtintores] = useState<any[]>([])
  const [filteredExtintores, setFilteredExtintores] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])

  // Estados para os Filtros Avançados
  const [showFilters, setShowFilters] = useState(false)
  const [filterUnidade, setFilterUnidade] = useState("todas")
  const [filterData, setFilterData] = useState("")
  const [filterColaborador, setFilterColaborador] = useState("")
  const [buscaGeral, setBuscaGeral] = useState("")

  // 1. Busca os dados reais ao carregar a página
  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true)
      try {
        const [extData, uniData] = await Promise.all([getExtintores(), getUnidades()])
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
  }, [])

  // 2. Aplica os filtros em TEMPO REAL (Live Preview na Tabela)
  useEffect(() => {
    let result = [...extintores]

    // Filtro de Busca (Texto livre)
    if (buscaGeral) {
      const term = buscaGeral.toLowerCase()
      result = result.filter(e => 
        e.codigo?.toLowerCase().includes(term) || 
        e.localizacao?.toLowerCase().includes(term) ||
        e.tipo?.toLowerCase().includes(term)
      )
    }

    // Filtro de Unidade
    if (filterUnidade !== "todas") {
      result = result.filter(e => e.unidadeId === filterUnidade)
    }

    // Filtro de Data e Colaborador (Procura nas inspeções do extintor)
    if (filterData || filterColaborador) {
      result = result.filter(ext => {
        if (!ext.inspecoes || ext.inspecoes.length === 0) return false;
        
        return ext.inspecoes.some((insp: any) => {
          let matchData = true;
          let matchColab = true;
          
          if (filterData) {
            // Garante a comparação correta ignorando fuso horário
            const inspDateStr = new Date(insp.dataInspecao).toISOString().split('T')[0];
            matchData = inspDateStr === filterData;
          }
          if (filterColaborador) {
            matchColab = insp.responsavel?.toLowerCase().includes(filterColaborador.toLowerCase());
          }
          return matchData && matchColab;
        });
      });
    }

    setFilteredExtintores(result)
  }, [extintores, filterUnidade, filterData, filterColaborador, buscaGeral])

  const activeFiltersCount = (filterUnidade !== "todas" ? 1 : 0) + (filterData ? 1 : 0) + (filterColaborador ? 1 : 0)

  const clearFilters = () => {
    setFilterUnidade("todas")
    setFilterData("")
    setFilterColaborador("")
    setBuscaGeral("")
  }

  // Estatísticas Dinâmicas
  const countTotal = filteredExtintores.length
  const countVencidos = filteredExtintores.filter(e => getStatusExtintor(e.validadeCarga) !== "EM DIA").length
  const countInspecionados = filteredExtintores.filter(e => e.inspecoes && e.inspecoes.length > 0).length

  // ============================================================================
  // GERAÇÃO DE PDF (Agora usa os dados filtrados diretamente da tela)
  // ============================================================================
  const gerarRelatorioPDF = async (tipo: "todos" | "vencimentos" | "detalhado") => {
    if (filteredExtintores.length === 0) {
      alert("Não há dados na tabela para gerar o relatório. Altere os filtros.")
      return
    }

    setIsGenerating(true)
    
    try {
      const doc = new jsPDF()
      const dataAtual = new Date().toLocaleDateString('pt-BR')
      const logoBase64 = await loadImageAsBase64('/novalogo.png')

      // === RELATÓRIO 1: LISTA GERAL ===
      if (tipo === "todos") {
        if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 10, 35, 15)
        doc.setFontSize(16)
        doc.text("Relatório Geral de Extintores (Filtrado)", 14, 35)
        doc.setFontSize(10)
        doc.text(`Gerado em: ${dataAtual} | Total: ${filteredExtintores.length} equipamentos`, 14, 42)

        const tableData = filteredExtintores.map(ext => [
          ext.codigo,
          ext.localizacao,
          ext.tipo,
          ext.capacidade,
          new Date(ext.validadeCarga).toLocaleDateString('pt-BR'),
          ext.unidade?.nome || "-"
        ])

        autoTable(doc, {
          startY: 50,
          head: [['Código', 'Localização', 'Tipo', 'Capacidade', 'Validade', 'Unidade']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [124, 58, 237] }
        })
        doc.save(`extintores_geral_${dataAtual.replace(/\//g, '-')}.pdf`)
      }

      // === RELATÓRIO 2: VENCIMENTOS PRÓXIMOS ===
      else if (tipo === "vencimentos") {
        if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 10, 35, 15)
        doc.setFontSize(16)
        doc.setTextColor(255, 23, 68) 
        doc.text("Alerta de Vencimentos", 14, 35)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.text(`Gerado em: ${dataAtual}`, 14, 42)

        const extintoresAlerta = filteredExtintores.filter(ext => getStatusExtintor(ext.validadeCarga) !== "EM DIA")
        
        const tableData = extintoresAlerta.map(ext => [
          ext.codigo,
          ext.localizacao,
          new Date(ext.validadeCarga).toLocaleDateString('pt-BR'),
          getStatusExtintor(ext.validadeCarga),
          ext.unidade?.nome || "-"
        ])

        autoTable(doc, {
          startY: 50,
          head: [['Código', 'Localização', 'Validade', 'Status', 'Unidade']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [255, 23, 68] },
          didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 3) {
              if (data.cell.raw === 'VENCIDO') data.cell.styles.textColor = [255, 0, 0]
              else data.cell.styles.textColor = [255, 109, 0]
            }
          }
        })
        doc.save(`extintores_vencimentos_${dataAtual.replace(/\//g, '-')}.pdf`)
      }

      // === RELATÓRIO 3: DETALHADO (COM CHECKLIST E FOTOS) ===
      else if (tipo === "detalhado") {
        let pagesAdded = 0;

        for (let i = 0; i < filteredExtintores.length; i++) {
          const ext = filteredExtintores[i]
          
          if (pagesAdded > 0) doc.addPage()
          pagesAdded++;

          doc.setFillColor(248, 250, 252) 
          doc.rect(0, 0, 210, 40, 'F')
          
          if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 10, 40, 20)
          
          doc.setFontSize(22)
          doc.setTextColor(15, 23, 42)
          doc.text(`Dossiê: ${ext.codigo}`, 60, 25)
          
          doc.setFontSize(14)
          doc.setTextColor(41, 121, 255)
          doc.text("Informações do Equipamento", 14, 55)
          
          doc.setFontSize(10)
          doc.setTextColor(15, 23, 42)
          doc.text(`Unidade: ${ext.unidade?.nome || "-"}`, 14, 65)
          doc.text(`Localização: ${ext.localizacao}`, 14, 72)
          doc.text(`Tipo / Carga: ${ext.tipo} - ${ext.capacidade}`, 14, 79)
          doc.text(`Validade da Carga: ${new Date(ext.validadeCarga).toLocaleDateString('pt-BR')}`, 14, 86)

          let currentY = 100;

          // Aplica os filtros nas inspeções para exibir apenas as desejadas no PDF
          let inspecoesParaExibir = ext.inspecoes || [];
          if (filterData) {
            inspecoesParaExibir = inspecoesParaExibir.filter((insp: any) => new Date(insp.dataInspecao).toISOString().split('T')[0] === filterData);
          }
          if (filterColaborador) {
            inspecoesParaExibir = inspecoesParaExibir.filter((insp: any) => insp.responsavel?.toLowerCase().includes(filterColaborador.toLowerCase()));
          }

          if (inspecoesParaExibir.length === 0) {
            doc.setFontSize(12)
            doc.setTextColor(100, 116, 139)
            doc.text("Nenhuma inspeção atende aos filtros para este equipamento.", 14, currentY)
          } else {
            for (const insp of inspecoesParaExibir) {
              if (currentY > 260) { doc.addPage(); currentY = 20; }

              doc.setFontSize(14)
              doc.setTextColor(124, 58, 237)
              doc.text(`Inspeção: ${new Date(insp.dataInspecao).toLocaleDateString('pt-BR')}`, 14, currentY)
              currentY += 6

              doc.setFontSize(10)
              doc.setTextColor(100, 116, 139)
              doc.text(`Status: ${insp.status} | Responsável: ${insp.responsavel || 'Não informado'}`, 14, currentY)
              currentY += 6

              if (insp.observacao) {
                doc.text(`Obs Geral: ${insp.observacao}`, 14, currentY)
                currentY += 6
              }

              currentY += 4

              let checklistData: string[][] = []

              if (Array.isArray(insp.checklist) && insp.checklist.length > 0) {
                checklistData = insp.checklist.map((item: any) => [
                  item.pergunta || item.nome,
                  item.resposta || '-',
                  item.conforme ? 'Sim' : 'Não'
                ])
              } else {
                const mapeamentoDeCampos = [
                  { campo: 'lacre', rotulo: 'Lacre' },
                  { campo: 'manometro', rotulo: 'Manômetro' },
                  { campo: 'sinalizacao', rotulo: 'Sinalização' },
                  { campo: 'mangueira', rotulo: 'Mangueira' },
                  { campo: 'pintura', rotulo: 'Pintura' },
                  { campo: 'inmetro', rotulo: 'Selo Inmetro' }
                ]

                mapeamentoDeCampos.forEach(item => {
                  if (insp[item.campo] !== undefined && insp[item.campo] !== null) {
                    const isConforme = insp[item.campo] === true || insp[item.campo] === "Conforme" || insp[item.campo] === "Sim"
                    checklistData.push([
                      item.rotulo,
                      isConforme ? 'Aprovado' : 'Irregular',
                      isConforme ? 'Sim' : 'Não'
                    ])
                  }
                })
              }

              if (checklistData.length > 0) {
                autoTable(doc, {
                  startY: currentY,
                  head: [['Item Verificado', 'Status', 'Conforme']],
                  body: checklistData,
                  theme: 'grid',
                  headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
                  margin: { left: 14, right: 14 },
                  didParseCell: function(data) {
                    if (data.section === 'body' && (data.cell.raw === 'Não' || data.cell.raw === 'Irregular')) {
                      data.cell.styles.textColor = [220, 38, 38]
                      data.cell.styles.fontStyle = 'bold'
                    }
                    if (data.section === 'body' && (data.cell.raw === 'Sim' || data.cell.raw === 'Aprovado')) {
                      data.cell.styles.textColor = [22, 163, 74]
                      data.cell.styles.fontStyle = 'bold'
                    }
                  }
                })
                currentY = (doc as any).lastAutoTable.finalY + 10
              } else {
                doc.text("Nenhum item de checklist detalhado foi preenchido.", 14, currentY)
                currentY += 10
              }

              const itemsComFoto = insp.checklist?.filter((item: any) => item.foto)
              
              if (itemsComFoto && itemsComFoto.length > 0) {
                doc.setFontSize(12)
                doc.setTextColor(15, 23, 42)
                doc.text("Registros Fotográficos:", 14, currentY)
                currentY += 10

                for (const item of itemsComFoto) {
                  if (currentY > 210) { doc.addPage(); currentY = 20; }

                  doc.setFontSize(9)
                  doc.setTextColor(100, 116, 139)
                  doc.text(`Referente à: ${item.pergunta}`, 14, currentY)
                  currentY += 5

                  try {
                    let fotoB64 = item.foto
                    if (fotoB64.startsWith('http') || fotoB64.startsWith('/')) {
                       fotoB64 = await loadImageAsBase64(fotoB64)
                    }
                    if (fotoB64) {
                       doc.addImage(fotoB64, 'JPEG', 14, currentY, 60, 60)
                       currentY += 65
                    }
                  } catch (e) {
                    doc.setTextColor(255, 0, 0)
                    doc.text("[Erro ao processar imagem]", 14, currentY)
                    currentY += 10
                  }
                  currentY += 5 
                }
              }
              currentY += 10 
            }
          }
        }
        doc.save(`dossie_checklist_filtrado_${dataAtual.replace(/\//g, '-')}.pdf`)
      }

    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      alert("Ocorreu um erro ao gerar o relatório. Verifique os dados no console.")
    } finally {
      setIsGenerating(false)
      setIsModalOpen(false)
    }
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
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">
            Relatórios
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-1 uppercase tracking-widest">
            Exportação e Histórico
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="sm:w-auto w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:opacity-90 text-white font-black uppercase tracking-widest rounded-full px-8 h-12 shadow-[0_8px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.5)] hover:-translate-y-1 transition-all duration-300 gap-2"
        >
          <FileText className="h-5 w-5" />
          Gerar Novo Relatório
        </Button>
      </div>

      {/* Cards de Estatísticas Atualizados para refletir o Filtro */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Equipamentos Listados", value: isLoadingData ? "-" : countTotal, icon: FileText, color: COLORS.violetNeon, bgShadow: "shadow-[0_8px_30px_rgba(124,58,237,0.15)]" },
          { title: "Inspeções Realizadas", value: isLoadingData ? "-" : countInspecionados, icon: ShieldCheck, color: COLORS.blueNeon, bgShadow: "shadow-[0_8px_30px_rgba(41,121,255,0.15)]" },
          { title: "Alertas / Vencidos", value: isLoadingData ? "-" : countVencidos, icon: AlertCircle, color: COLORS.redNeon, bgShadow: "shadow-[0_8px_30px_rgba(255,23,68,0.15)]" },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className={`relative overflow-hidden border border-slate-100 ${stat.bgShadow} hover:-translate-y-1 transition-all duration-300 group bg-white rounded-3xl`}>
              <div 
                className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 blur-2xl" 
                style={{ backgroundColor: stat.color }}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{stat.title}</CardTitle>
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <stat.icon 
                    className="h-5 w-5 transition-transform group-hover:scale-110" 
                    style={{ color: stat.color, filter: `drop-shadow(0px 0px 8px ${stat.color}80)` }} 
                  />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ÁREA DA TABELA COM PRÉ-VISUALIZAÇÃO AO VIVO */}
      <motion.div variants={item} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        
        <div className="p-6 border-b border-slate-100/50 flex flex-col gap-4 bg-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-800">Pré-visualização dos Dados</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">O que você vê aqui é o que sairá no PDF</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                <Input 
                  placeholder="Buscar equipamento..." 
                  value={buscaGeral}
                  onChange={(e) => setBuscaGeral(e.target.value)}
                  className="pl-11 h-10 bg-slate-50 border-slate-200 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-violet-600/20 focus-visible:border-violet-600 transition-all font-bold"
                />
              </div>
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline" 
                className={`h-10 rounded-xl border-slate-200 transition-all font-bold text-xs uppercase tracking-widest ${showFilters || activeFiltersCount > 0 ? 'bg-violet-50 text-violet-600 border-violet-300' : 'bg-white hover:border-violet-600 hover:text-violet-600 hover:bg-violet-50 text-slate-600'}`}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Filter className="w-4 h-4 text-violet-600" /> Refinar Busca
                    </h3>
                    {activeFiltersCount > 0 && (
                      <Button onClick={clearFilters} variant="ghost" className="h-8 text-[10px] uppercase font-bold tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
                        <X className="w-3 h-3 mr-1" /> Limpar
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unidade</label>
                      <Select value={filterUnidade} onValueChange={setFilterUnidade}>
                        <SelectTrigger className="h-14 bg-white border-slate-200 rounded-2xl font-bold text-slate-700 px-4 focus:ring-violet-600/20 focus:border-violet-600 transition-all">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-slate-400" />
                            <SelectValue placeholder="Todas as unidades" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                          <SelectItem value="todas" className="font-bold py-3">Todas as unidades</SelectItem>
                          {unidades.map((u) => (
                            <SelectItem key={u.id} value={u.id} className="font-bold py-3">{u.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data da Inspeção</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-slate-400" />
                        </div>
                        <Input 
                          type="date"
                          value={filterData}
                          onChange={(e) => setFilterData(e.target.value)}
                          className="h-14 pl-12 bg-white border-slate-200 rounded-2xl font-bold text-slate-700 w-full focus-visible:ring-2 focus-visible:ring-violet-600/20 focus-visible:border-violet-600 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inspetor / Colaborador</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <Input 
                          type="text"
                          placeholder="Digite o nome..."
                          value={filterColaborador}
                          onChange={(e) => setFilterColaborador(e.target.value)}
                          className="h-14 pl-12 bg-white border-slate-200 rounded-2xl font-bold text-slate-700 w-full focus-visible:ring-2 focus-visible:ring-violet-600/20 focus-visible:border-violet-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabela de Preview dos Extintores */}
        <div className="overflow-x-auto">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-500" />
              <p className="text-sm font-bold uppercase tracking-widest">Carregando dados...</p>
            </div>
          ) : filteredExtintores.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <AlertCircle className="w-8 h-8 mb-4 text-slate-300" />
              <p className="text-sm font-bold uppercase tracking-widest">Nenhum equipamento encontrado com estes filtros.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12">Código</TableHead>
                  <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12">Localização</TableHead>
                  <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12">Tipo / Capacidade</TableHead>
                  <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12">Unidade</TableHead>
                  <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExtintores.slice(0, 15).map((ext) => {
                  const status = getStatusExtintor(ext.validadeCarga);
                  const isVencido = status === "VENCIDO" || status === "VENCENDO";
                  
                  return (
                    <TableRow key={ext.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="font-black text-slate-800 py-4">{ext.codigo}</TableCell>
                      <TableCell className="font-semibold text-slate-500 text-sm">{ext.localizacao}</TableCell>
                      <TableCell className="font-bold text-slate-600 text-xs">
                        {ext.tipo} <span className="text-slate-400 font-medium">({ext.capacidade})</span>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-600 text-sm">{ext.unidade?.nome || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          className={`border-none font-black text-[10px] uppercase tracking-widest px-2.5 py-1 shadow-sm ${
                            isVencido ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                          }`}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredExtintores.length > 15 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      E mais {filteredExtintores.length - 15} equipamentos (Visíveis no PDF)
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>

      {/* Menu Modal de Seleção de Relatório */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl border-none shadow-2xl p-6 bg-white">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Exportar Relatório PDF</DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 mt-1">
              Os filtros aplicados na tela anterior serão mantidos nos relatórios abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline"
              disabled={isGenerating}
              onClick={() => gerarRelatorioPDF("todos")}
              className="flex items-center justify-start h-auto p-4 gap-4 rounded-2xl border-2 border-slate-100 hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
            >
              <div className="h-12 w-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Lista Geral (Filtrada)</span>
                <span className="text-xs font-bold text-slate-500">Gera uma tabela resumida baseada nos filtros que você selecionou.</span>
              </div>
            </Button>

            <Button 
              variant="outline"
              disabled={isGenerating}
              onClick={() => gerarRelatorioPDF("vencimentos")}
              className="flex items-center justify-start h-auto p-4 gap-4 rounded-2xl border-2 border-slate-100 hover:border-red-300 hover:bg-red-50 transition-all text-left"
            >
              <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Alerta de Vencimentos</span>
                <span className="text-xs font-bold text-slate-500">Exporta os extintores listados que vencerão nos próximos 30 dias.</span>
              </div>
            </Button>

            <Button 
              variant="outline"
              disabled={isGenerating}
              onClick={() => gerarRelatorioPDF("detalhado")}
              className="flex items-center justify-start h-auto p-4 gap-4 rounded-2xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FileStack className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Dossiê de Inspeções Específicas</span>
                <span className="text-xs font-bold text-slate-500">Imprime o histórico de inspeções, fotos e checklist das datas/inspetores selecionados.</span>
              </div>
            </Button>
          </div>

          {isGenerating && (
            <div className="mt-4 text-center text-sm font-bold text-violet-600 animate-pulse uppercase tracking-widest">
              Consultando base de dados e gerando PDF...
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </motion.div>
  )
}