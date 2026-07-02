"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Filter, Calendar, Search, FileDown, Activity } from "lucide-react"
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

export default function RelatoriosPage() {
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
        
        <Button className="sm:w-auto w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:opacity-90 text-white font-black uppercase tracking-widest rounded-full px-8 h-12 shadow-[0_8px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.5)] hover:-translate-y-1 transition-all duration-300 gap-2">
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
                // Lógica de cores para os Badges
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
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </motion.div>
  )
}