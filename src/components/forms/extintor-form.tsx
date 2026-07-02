"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, Loader2, Plus } from "lucide-react"
import { createExtintor, getUnidades, updateExtintor } from "@/app/actions/extintores"
import { DatePicker } from "@/components/date-picker"
import { format } from "date-fns"

interface Extintor {
  id: string
  codigo: string
  localizacao: string
  tipo: string
  capacidade: string
  validadeCarga: Date | string
  unidadeId: string
  foto?: string | null
}

interface ExtintorFormProps {
  extintor?: Extintor
  open?: boolean
  setOpen?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function ExtintorForm({ extintor, open: controlledOpen, setOpen: setControlledOpen, trigger }: ExtintorFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen : setInternalOpen

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [unidades, setUnidades] = useState<any[]>([])
  const [validadeCarga, setValidadeCarga] = useState<Date | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (open) {
      getUnidades().then((result) => setUnidades(result.data))
      if (extintor?.foto) {
        setPreviewUrl(extintor.foto)
      }
      if (extintor?.validadeCarga) {
        setValidadeCarga(new Date(extintor.validadeCarga))
      } else {
        setValidadeCarga(null)
      }
    } else {
      setPreviewUrl(null)
      setValidadeCarga(null)
    }
  }, [open, extintor])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    if (validadeCarga) {
      formData.append('validadeCarga', format(validadeCarga, 'yyyy-MM-dd'))
    }
    let result

    if (extintor) {
      result = await updateExtintor(extintor.id, formData)
    } else {
      result = await createExtintor(formData)
    }

    if (result.success) {
      setOpen(false)
      setPreviewUrl(null)
    } else {
      alert(result.error)
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger>{trigger}</DialogTrigger>
      ) : !extintor && (
        <DialogTrigger
          render={
            <Button
              className="w-full bg-[#B11226] hover:bg-[#9a0f1f] text-white font-bold rounded-2xl h-12 shadow-sm transition-all flex items-center justify-center gap-2"
            />
          }
        >
          <Plus className="h-6 w-6" />
          Novo Extintor
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md rounded-2xl border-[#E5E7EB] shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {extintor ? "Editar Extintor" : "Cadastrar Extintor"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              {extintor
                ? "Atualize os dados do equipamento"
                : "Adicione um novo equipamento ao sistema"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-xs font-bold text-slate-600">
                Código/Tag
              </Label>
              <Input
                id="codigo"
                name="codigo"
                placeholder="EXT-000"
                required
                defaultValue={extintor?.codigo}
                className="h-11 rounded-xl border-[#E5E7EB] bg-slate-50 focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidadeId" className="text-xs font-bold text-slate-600">
                Unidade
              </Label>
              <Select name="unidadeId" required defaultValue={extintor?.unidadeId}>
                <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB] bg-slate-50 focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226]/20">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E5E7EB]">
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="font-medium">
                      {u.nome}
                    </SelectItem>
                  ))}
                  {unidades.length === 0 && (
                    <p className="p-3 text-xs text-slate-400">Nenhuma unidade cadastrada</p>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="localizacao" className="text-xs font-bold text-slate-600">
              Localização
            </Label>
            <Input
              id="localizacao"
              name="localizacao"
              placeholder="Ex: Galpão A, Pilar 12"
              required
              defaultValue={extintor?.localizacao}
              className="h-11 rounded-xl border-[#E5E7EB] bg-slate-50 focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-xs font-bold text-slate-600">
                Tipo de Carga
              </Label>
              <Select name="tipo" required defaultValue={extintor?.tipo}>
                <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB] bg-slate-50 focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226]/20">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E5E7EB]">
                  <SelectItem value="PQS ABC" className="font-medium">PQS ABC</SelectItem>
                  <SelectItem value="PQS BC" className="font-medium">PQS BC</SelectItem>
                  <SelectItem value="CO2" className="font-medium">CO2</SelectItem>
                  <SelectItem value="Água" className="font-medium">Água</SelectItem>
                  <SelectItem value="Espuma" className="font-medium">Espuma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidade" className="text-xs font-bold text-slate-600">
                Capacidade
              </Label>
              <Input
                id="capacidade"
                name="capacidade"
                placeholder="Ex: 6kg, 10L"
                required
                defaultValue={extintor?.capacidade}
                className="h-11 rounded-xl border-[#E5E7EB] bg-slate-50 focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226]/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validadeCarga" className="text-xs font-bold text-slate-600">
              Validade
            </Label>
            <DatePicker
              date={validadeCarga}
              setDate={setValidadeCarga}
              placeholder="dd/mm/aaaa"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-600">Foto do Equipamento</Label>
            <div className="flex items-center justify-center w-full">
              <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 border-[#E5E7EB] transition-all overflow-hidden group">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-7 h-7 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs text-slate-400 font-medium">Clique para adicionar</p>
                  </div>
                )}
                <input type="file" name="foto" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1 h-11 rounded-xl border-[#E5E7EB] hover:bg-slate-100 font-medium"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-[#B11226] hover:bg-[#9a0f1f] text-white font-bold"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : extintor ? (
                "Atualizar"
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
