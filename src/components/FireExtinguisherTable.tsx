"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "./StatusBadge"
import { QrCode, FileText, ClipboardCheck, Edit2, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Extinguisher {
  id: string
  codigo: string
  foto?: string
  status: "em-dia" | "vencendo" | "vencido" | "inspecionado" | "sem-inspecao"
  localizacao: string
  unidade: string
  tipo: string
  capacidade: string
  validade: string
  ultimaInspecao?: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

interface FireExtinguisherTableProps {
  extinguishers: Extinguisher[]
  className?: string
}

export function FireExtinguisherTable({ extinguishers, className }: FireExtinguisherTableProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Localização</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo / Carga</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Validade</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Última inspeção</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {extinguishers.map((extinguisher) => (
            <TableRow
              key={extinguisher.id}
              className="border-b border-[#E5E7EB] hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="py-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-[#E5E7EB]">
                  {extinguisher.foto ? (
                    <img src={extinguisher.foto} alt={extinguisher.codigo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#B11226]/10 to-[#FF6A00]/10">
                      <div className="w-5 h-8 rounded bg-[#B11226]"></div>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="font-bold text-slate-900">{extinguisher.codigo}</div>
                <div className="text-xs text-slate-500 font-medium">{extinguisher.unidade}</div>
              </TableCell>
              <TableCell className="py-4">
                <div className="font-medium text-slate-900">{extinguisher.localizacao}</div>
              </TableCell>
              <TableCell className="py-4">
                <div className="font-medium text-slate-900">{extinguisher.tipo}</div>
                <div className="text-xs text-slate-500 font-medium">{extinguisher.capacidade}</div>
              </TableCell>
              <TableCell className="py-4">
                <div className={cn(
                  "font-bold",
                  extinguisher.status === "vencido" ? "text-[#DC2626]" :
                  extinguisher.status === "vencendo" ? "text-[#F59E0B]" : "text-slate-900"
                )}>
                  {extinguisher.validade}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="text-slate-900 font-medium">{extinguisher.ultimaInspecao || "-"}</div>
              </TableCell>
              <TableCell className="py-4">
                <StatusBadge status={extinguisher.status} />
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/extintores/historico/${extinguisher.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-slate-100"
                    >
                      <FileText className="w-4 h-4 text-slate-600" />
                    </Button>
                  </Link>
                  <Link href={`/extintores/inspecao/${extinguisher.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-slate-100"
                    >
                      <ClipboardCheck className="w-4 h-4 text-slate-600" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg hover:bg-slate-100"
                    onClick={() => extinguisher.onEdit(extinguisher.id)}
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg hover:bg-slate-100"
                        />
                      }
                    >
                      <MoreHorizontal className="w-4 h-4 text-slate-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem
                        className="text-red-600 font-medium cursor-pointer"
                        onClick={() => extinguisher.onDelete(extinguisher.id)}
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
