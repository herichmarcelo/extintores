"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, Loader2, Plus } from "lucide-react"
import { createHidrante, updateHidrante } from "@/app/actions/hidrantes"
import { getUnidades } from "@/app/actions/extintores"

interface Hidrante {
  id: string
  codigo: string
  localizacao: string
  unidadeId: string
  foto?: string | null
}

interface HidranteFormProps {
  hidrante?: Hidrante
  open?: boolean
  setOpen?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function HidranteForm({ hidrante, open: controlledOpen, setOpen: setControlledOpen, trigger }: HidranteFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen : setInternalOpen

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [unidades, setUnidades] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      getUnidades().then((result) => setUnidades(result.data))
      if (hidrante?.foto) {
        setPreviewUrl(hidrante.foto)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [open, hidrante])

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
    let result

    if (hidrante) {
      result = await updateHidrante(hidrante.id, formData)
    } else {
      result = await createHidrante(formData)
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
      ) : !hidrante && (
        <DialogTrigger>
          <Button
            className="bg-[#2979ff] hover:bg-[#2962ff] text-white font-bold rounded-xl h-11 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Novo Hidrante
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md rounded-2xl border-[#E5E7EB] shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {hidrante ? "Editar Hidrante" : "Cadastrar Hidrante"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              {hidrante
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
                placeholder="HID-000"
                required
                defaultValue={hidrante?.codigo}
                className="h-11 rounded-xl border-[#E5E7EB] bg-slate-50 focus:border-[#2979ff] focus:ring-1 focus:ring-[#2979ff]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidadeId" className="text-xs font-bold text-slate-600">
                Unidade
              </Label>
              <Select name="unidadeId" required defaultValue={hidrante?.unidadeId}>
                <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB] bg-slate-50 focus:border-[#2979ff] focus:ring-1 focus:ring-[#2979ff]/20">
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
              placeholder="Ex: Galpão B, Ala Norte"
              required
              defaultValue={hidrante?.localizacao}
              className="h-11 rounded-xl border-[#E5E7EB] bg-slate-50 focus:border-[#2979ff] focus:ring-1 focus:ring-[#2979ff]/20"
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
              className="flex-1 h-11 rounded-xl bg-[#2979ff] hover:bg-[#2962ff] text-white font-bold"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : hidrante ? (
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