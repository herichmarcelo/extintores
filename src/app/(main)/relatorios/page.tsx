"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Filter, Calendar, Search, FileDown, Activity, AlertCircle, FileStack } from "lucide-react"
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
import { motion } from "framer-motion"
import { BottomNavigation } from "@/components/BottomNavigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Importações para gerar o PDF e buscar os dados
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getExtintores } from "@/app/actions/extintores"

// Cores do tema Documentos/Analytics
const COLORS = {
  violetNeon: "#7c3aed",
  pinkNeon: "#ec4899",
  blueNeon: "#2979ff",
  redNeon: "#ff1744",
  orangeNeon: "#ff6d00",
}

const relatorios = [
  {
    id: "1",
    titulo: "Inspeção Mensal - Matriz",
    data: "01/06/2026",
    tipo: "Extintores",
    usuario: "Inspetor Silva",
  },
  {
    id: "2",
    titulo: "Inspeção Semestral - Hidrantes",
    data: "28/05/2026",
    tipo: "Hidrantes",
    usuario: "Gestor Santos",
  },
  {
    id: "3",
    titulo: "Auditoria SESMT - Unidade II",
    data: "15/05/2026",
    tipo: "Geral",
    usuario: "Adm Admin",
  },
]

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

// Função auxiliar para converter Imagens em Base64 (Necessário para o jsPDF)
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

export default function RelatoriosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Função auxiliar para verificar vencimento
  const isVencendoOuVencido = (validade: Date | string) => {
    const dataValidade = new Date(validade)
    const trintaDias = new Date()
    trintaDias.setDate(trintaDias.getDate() + 30)
    return dataValidade <= trintaDias
  }

  const gerarRelatorioPDF = async (tipo: "todos" | "vencimentos" | "detalhado") => {
    setIsGenerating(true)
    
    try {
      // 1. Busca os dados reais do banco
      const dados = await getExtintores()
      const extintores = dados as any[]

      // 2. Inicia o documento PDF e busca a logo
      const doc = new jsPDF()
      const dataAtual = new Date().toLocaleDateString('pt-BR')
      const logoBase64 = await loadImageAsBase64('/novalogo.png')

      // === RELATÓRIO 1: LISTA COMPLETA ===
      if (tipo === "todos") {
        if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 10, 35, 15)
        doc.setFontSize(16)
        doc.text("Relatório Geral de Extintores", 14, 35)
        doc.setFontSize(10)
        doc.text(`Gerado em: ${dataAtual}`, 14, 42)

        const tableData = extintores.map(ext => [
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
          headStyles: { fillColor: [124, 58, 237] } // Violeta Neon
        })
        doc.save(`extintores_geral_${dataAtual.replace(/\//g, '-')}.pdf`)
      }

      // === RELATÓRIO 2: VENCIMENTOS PRÓXIMOS ===
      else if (tipo === "vencimentos") {
        if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 10, 35, 15)
        doc.setFontSize(16)
        doc.setTextColor(255, 23, 68) // Vermelho
        doc.text("Relatório de Alerta: Vencimentos Próximos e Vencidos", 14, 35)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.text(`Gerado em: ${dataAtual}`, 14, 42)

        const extintoresAlerta = extintores.filter(ext => isVencendoOuVencido(ext.validadeCarga))
        
        const tableData = extintoresAlerta.map(ext => [
          ext.codigo,
          ext.localizacao,
          new Date(ext.validadeCarga).toLocaleDateString('pt-BR'),
          new Date(ext.validadeCarga) < new Date() ? "VENCIDO" : "VENCENDO",
          ext.unidade?.nome || "-"
        ])

        autoTable(doc, {
          startY: 50,
          head: [['Código', 'Localização', 'Validade', 'Status', 'Unidade']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [255, 23, 68] }, // Red Neon
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
        for (let i = 0; i < extintores.length; i++) {
          const ext = extintores[i]
          
          if (i > 0) doc.addPage() // Adiciona nova página para cada extintor subsequente

          // Cabeçalho da Página do Extintor
          doc.setFillColor(248, 250, 252) // Fundo cinza claro
          doc.rect(0, 0, 210, 40, 'F')
          
          if (logoBase64) {
             doc.addImage(logoBase64, 'PNG', 14, 10, 40, 20)
          }
          
          doc.setFontSize(22)
          doc.setTextColor(15, 23, 42) // Slate 900
          doc.text(`Dossiê: ${ext.codigo}`, 60, 25)
          
          // Dados Básicos
          doc.setFontSize(14)
          doc.setTextColor(41, 121, 255) // Azul Neon
          doc.text("Informações do Equipamento", 14, 55)
          
          doc.setFontSize(10)
          doc.setTextColor(15, 23, 42)
          doc.text(`Unidade: ${ext.unidade?.nome || "-"}`, 14, 65)
          doc.text(`Localização: ${ext.localizacao}`, 14, 72)
          doc.text(`Tipo / Carga: ${ext.tipo} - ${ext.capacidade}`, 14, 79)
          doc.text(`Validade da Carga: ${new Date(ext.validadeCarga).toLocaleDateString('pt-BR')}`, 14, 86)

          let currentY = 100;

          if (!ext.inspecoes || ext.inspecoes.length === 0) {
            doc.setFontSize(12)
            doc.setTextColor(100, 116, 139)
            doc.text("Nenhuma inspeção ou checklist registrado para este equipamento.", 14, currentY)
          } else {
            // Loop pelas inspeções daquele extintor
            for (const insp of ext.inspecoes) {
              
              if (currentY > 260) { doc.addPage(); currentY = 20; }

              doc.setFontSize(14)
              doc.setTextColor(124, 58, 237) // Violeta
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

              // 1. Renderiza a tabela do Checklist de forma inteligente
              let checklistData: string[][] = []

              if (Array.isArray(insp.checklist) && insp.checklist.length > 0) {
                checklistData = insp.checklist.map((item: any) => [
                  item.pergunta || item.nome,
                  item.resposta || '-',
                  item.conforme ? 'Sim' : 'Não'
                ])
              } 
              else {
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
                      data.cell.styles.textColor = [220, 38, 38] // Red 600
                      data.cell.styles.fontStyle = 'bold'
                    }
                    if (data.section === 'body' && (data.cell.raw === 'Sim' || data.cell.raw === 'Aprovado')) {
                      data.cell.styles.textColor = [22, 163, 74] // Green 600
                      data.cell.styles.fontStyle = 'bold'
                    }
                  }
                })
                
                currentY = (doc as any).lastAutoTable.finalY + 10
              } else {
                doc.text("Nenhum item de checklist detalhado foi preenchido.", 14, currentY)
                currentY += 10
              }

              // 2. Renderiza as Fotos vinculadas (se existirem)
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
        doc.save(`dossie_checklist_extintores_${dataAtual.replace(/\//g, '-')}.pdf`)
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
      {/* Cabeçalho da Página */}
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

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Relatórios Gerados", value: "128", icon: FileText, color: COLORS.violetNeon, bgShadow: "shadow-[0_8px_30px_rgba(124,58,237,0.15)]" },
          { title: "Downloads (Mês)", value: "45", icon: Download, color: COLORS.blueNeon, bgShadow: "shadow-[0_8px_30px_rgba(41,121,255,0.15)]" },
          { title: "Próxima Inspeção", value: "01/07", icon: Calendar, color: COLORS.orangeNeon, bgShadow: "shadow-[0_8px_30px_rgba(255,109,0,0.15)]" },
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

      {/* Área da Tabela */}
      <motion.div variants={item} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        
        {/* Toolbar da Tabela */}
        <div className="p-6 border-b border-slate-100/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-800">Histórico de Documentos</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Últimos relatórios emitidos</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
              <Input 
                placeholder="Buscar documento..." 
                className="pl-11 h-10 bg-slate-50 border-slate-200 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-violet-600/20 focus-visible:border-violet-600 transition-all font-bold"
              />
            </div>
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white shadow-sm hover:border-violet-600 hover:text-violet-600 hover:bg-violet-50 transition-all font-bold text-xs uppercase tracking-widest">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12">Título do Documento</TableHead>
                <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12">Data de Emissão</TableHead>
                <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12">Categoria</TableHead>
                <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12">Responsável</TableHead>
                <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-widest h-12 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorios.map((rel) => {
                let badgeColor = "";
                let badgeBg = "";
                if (rel.tipo === "Extintores") { badgeColor = COLORS.redNeon; badgeBg = "bg-red-50"; }
                else if (rel.tipo === "Hidrantes") { badgeColor = COLORS.blueNeon; badgeBg = "bg-blue-50"; }
                else { badgeColor = COLORS.violetNeon; badgeBg = "bg-violet-50"; }

                return (
                  <TableRow key={rel.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="font-bold text-slate-800 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors text-slate-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        {rel.titulo}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-500 text-sm">{rel.data}</TableCell>
                    <TableCell>
                      <Badge 
                        className={`border-none font-black text-[10px] uppercase tracking-widest px-2.5 py-1 ${badgeBg} hover:${badgeBg} shadow-sm`}
                        style={{ color: badgeColor }}
                      >
                        {rel.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-600 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                          {rel.usuario.charAt(0)}
                        </div>
                        {rel.usuario}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="rounded-xl hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-colors gap-2 font-bold text-xs"
                      >
                        <FileDown className="h-4 w-4" />
                        <span className="hidden sm:inline">Baixar PDF</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Menu Modal de Seleção de Relatório */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl border-none shadow-2xl p-6 bg-white">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Selecione o Relatório</DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 mt-1">
              Escolha qual formato de dados você deseja exportar em PDF.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3">
            {/* Botão 1: Lista Geral */}
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
                <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Lista Geral de Extintores</span>
                <span className="text-xs font-bold text-slate-500">Gera uma tabela listando todos os equipamentos cadastrados no sistema.</span>
              </div>
            </Button>

            {/* Botão 2: Vencimentos */}
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
                <span className="text-xs font-bold text-slate-500">Filtra e exporta apenas os extintores que estão vencidos ou vencendo em 30 dias.</span>
              </div>
            </Button>

            {/* Botão 3: Dossiê Detalhado */}
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
                <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Dossiê Detalhado (Checklist e Fotos)</span>
                <span className="text-xs font-bold text-slate-500">Cria um relatório detalhado dedicando uma página inteira para cada equipamento com as perguntas e registros fotográficos.</span>
              </div>
            </Button>
          </div>

          {isGenerating && (
            <div className="mt-4 text-center text-sm font-bold text-violet-600 animate-pulse uppercase tracking-widest">
              Extraindo dados e processando imagens para o PDF...
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