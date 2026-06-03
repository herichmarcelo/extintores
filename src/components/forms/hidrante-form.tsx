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
import { createHidrante } from "@/app/actions/hidrantes"
import { getUnidades } from "@/app/actions/extintores"

export function HidranteForm() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [unidades, setUnidades] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      getUnidades().then(setUnidades)
    }
  }, [open])

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
    const result = await createHidrante(formData)

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
      <DialogTrigger
        render={
          <Button
            className="w-full bg-[#2979ff] hover:bg-[#2962ff] text-white font-black uppercase tracking-widest rounded-xl h-12 shadow-lg shadow-[#2979ff]/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Novo Hidrante
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Cadastrar Hidrante</DialogTitle>
            <DialogDescription className="font-bold text-slate-500">
              Adicione um novo hidrante ao sistema SESMT.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código/Tag</Label>
              <Input id="codigo" name="codigo" placeholder="HID-000" required className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidadeId" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidade</Label>
              <Select name="unidadeId" required>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 bg-white">
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="font-bold">
                      {u.nome}
                    </SelectItem>
                  ))}
                  {unidades.length === 0 && (
                    <p className="p-2 text-xs text-slate-400">Nenhuma unidade cadastrada</p>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="localizacao" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização Exata</Label>
            <Input id="localizacao" name="localizacao" placeholder="Ex: Galpão B, Ala Norte" required className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Foto do Equipamento</Label>
            <div className="flex items-center justify-center w-full">
              <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-200 transition-all overflow-hidden group">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Capturar Foto</p>
                  </div>
                )}
                <input type="file" name="foto" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-[#2979ff] hover:bg-[#2962ff] text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-[#2979ff]/20 transition-all"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Cadastro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
