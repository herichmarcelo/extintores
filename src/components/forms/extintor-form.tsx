"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { createExtintor, getUnidades } from "@/app/actions/extintores"

export function ExtintorForm() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [unidades, setUnidades] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      getUnidades().then((result) => setUnidades(result.data))
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
    const result = await createExtintor(formData)

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
        className="w-full bg-[#9d1d36] hover:bg-[#82182d] text-white font-black uppercase tracking-widest rounded-xl h-12 shadow-lg shadow-[#9d1d36]/20 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="h-5 w-5" />
        Novo Extintor
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Cadastrar Extintor</DialogTitle>
            <DialogDescription className="font-bold text-slate-500">
              Adicione um novo equipamento ao sistema SESMT.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código/Tag</Label>
              <Input id="codigo" name="codigo" placeholder="EXT-000" required className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
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
            <Input id="localizacao" name="localizacao" placeholder="Ex: Galpão A, Pilar 12" required className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Carga</Label>
              <Select name="tipo" required>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 bg-white">
                  <SelectItem value="PQS ABC" className="font-bold">PQS ABC</SelectItem>
                  <SelectItem value="CO2" className="font-bold">CO2</SelectItem>
                  <SelectItem value="Água" className="font-bold">Água</SelectItem>
                  <SelectItem value="Espuma" className="font-bold">Espuma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidade" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacidade</Label>
              <Input id="capacidade" name="capacidade" placeholder="Ex: 6kg, 10L" required className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validadeCarga" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Próximo Vencimento</Label>
            <Input id="validadeCarga" name="validadeCarga" type="date" required className="rounded-xl border-slate-100 bg-slate-50 font-bold h-12" />
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
              className="w-full h-12 rounded-2xl bello-gradient hover:opacity-95 text-sm font-black uppercase tracking-widest shadow-xl shadow-[#9d1d36]/20 transition-all"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Cadastro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
