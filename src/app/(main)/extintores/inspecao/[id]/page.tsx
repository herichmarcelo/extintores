"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Camera, ChevronLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { createInspecao } from "@/app/actions/extintores"

export default function InspecaoExtintorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isSubmitting, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('extintorId', id)
    formData.append('usuarioId', 'temp-user-id') // TODO: Pegar do Auth real
    
    // Determinar status global baseado nos itens
    const items = ['manometro', 'lacre', 'sinalizacao', 'mangueira', 'pintura', 'seloInmetro']
    const hasNonConformity = items.some(item => formData.get(item) === 'nao-conforme')
    formData.append('status', hasNonConformity ? 'Não Conforme' : 'Conforme')

    const result = await createInspecao(formData)

    if (result.success) {
      router.push("/extintores")
    } else {
      alert(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => !isSubmitting && router.push("/extintores")} disabled={isSubmitting}>
          <Link href="/extintores">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Inspeção de Extintor</h1>
      </div>

      <Card className="border-none shadow-xl bg-white">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tighter">Equipamento</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</Label>
            <p className="font-black text-slate-900">EXT-001</p>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</Label>
            <p className="font-bold text-slate-700">Almoxarifado</p>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</Label>
            <p className="font-bold text-slate-700">PQS - ABC</p>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacidade</Label>
            <p className="font-bold text-slate-700">6kg</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-[#9d1d36] text-white">
            <CardTitle className="text-lg font-black uppercase tracking-widest">Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4">
              {[
                { id: "manometro", label: "Manômetro em área verde?" },
                { id: "lacre", label: "Lacre intacto?" },
                { id: "sinalizacao", label: "Sinalização adequada?" },
                { id: "mangueira", label: "Mangueira sem rachaduras?" },
                { id: "pintura", label: "Pintura em bom estado?" },
                { id: "seloInmetro", label: "Selo Inmetro presente?" },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <Label htmlFor={item.id} className="text-sm font-bold text-slate-600 cursor-pointer">
                    {item.label}
                  </Label>
                  <Select name={item.id} defaultValue="conforme">
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200 font-bold">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conforme" className="font-bold text-green-600">Conforme</SelectItem>
                      <SelectItem value="nao-conforme" className="font-bold text-red-600">Não Conforme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <Label htmlFor="observacao" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações</Label>
              <Textarea
                id="observacao"
                name="observacao"
                placeholder="Descreva aqui qualquer irregularidade encontrada..."
                className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidência Fotográfica</Label>
              <div className="flex items-center justify-center w-full">
                <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-200 transition-all overflow-hidden group">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="p-4 rounded-2xl bg-white shadow-lg mb-3 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-[#9d1d36]" />
                      </div>
                      <p className="mb-2 text-sm text-slate-500 font-bold">
                        Tirar Foto da Inspeção
                      </p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Captura de Ambiente Ativa</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    name="foto"
                    className="hidden" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-6 border-t border-slate-100">
              <Checkbox id="assinatura" name="assinatura" required className="h-6 w-6 rounded-lg border-slate-300 data-[state=checked]:bg-[#9d1d36]" />
              <Label htmlFor="assinatura" className="text-xs font-bold text-slate-500 leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Confirmo que realizei a inspeção física e as informações são verdadeiras.
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 h-14 rounded-2xl bello-gradient hover:opacity-90 text-lg font-black uppercase tracking-widest shadow-2xl shadow-[#9d1d36]/20 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Finalizar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
