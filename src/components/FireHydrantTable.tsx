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
import { QrCode, FileText, ClipboardCheck, Edit2, MoreHorizontal, Droplets } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Hydrant {
  id: string
  codigo: string
  foto?: string
  status: "em-dia" | "vencendo" | "vencido" | "inspecionado" | "sem-inspecao"
  localizacao: string
  unidade: string
  ultimaInspecao?: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

interface FireHydrantTableProps {
  hydrants: Hydrant[]
  className?: string
}

export function FireHydrantTable({ hydrants, className }: FireHydrantTableProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Localização</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Última inspeção</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hydrants.map((hydrant) => (
            <TableRow
              key={hydrant.id}
              className="border-b border-[#E5E7EB] hover:bg-slate-50/50 transition-colors"
            >
              <TableCell className="py-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-[#E5E7EB]">
                  {hydrant.foto ? (
                    <img src={hydrant.foto} alt={hydrant.codigo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                      <Droplets className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="font-bold text-slate-900">{hydrant.codigo}</div>
                <div className="text-xs text-slate-500 font-medium">{hydrant.unidade}</div>
              </TableCell>
              <TableCell className="py-4">
                <div className="font-medium text-slate-900">{hydrant.localizacao}</div>
              </TableCell>
              <TableCell className="py-4">
                <div className="text-slate-900 font-medium">{hydrant.ultimaInspecao || "-"}</div>
              </TableCell>
              <TableCell className="py-4">
                <StatusBadge status={hydrant.status} />
              </TableCell>
              <TableCell className="py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/hidrantes/historico/${hydrant.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg hover:bg-slate-100"
                    >
                      <FileText className="w-4 h-4 text-slate-600" />
                    </Button>
                  </Link>
                  <Link href={`/hidrantes/inspecao/${hydrant.id}`}>
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
                    onClick={() => hydrant.onEdit(hydrant.id)}
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
                        onClick={() => hydrant.onDelete(hydrant.id)}
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
