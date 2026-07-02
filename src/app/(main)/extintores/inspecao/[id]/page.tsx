"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Camera, ChevronLeft, Save, Loader2, CheckCircle2, AlertCircle, Flame, MapPin, Info, X, ClipboardCheck, User } from "lucide-react"
import { createInspecao, getExtintorComHistorico } from "@/app/actions/extintores"
import { motion, AnimatePresence } from "framer-motion"
import { DatePicker } from "@/components/date-picker"
import { format } from "date-fns"
import { BottomNavigation } from "@/components/BottomNavigation"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemAnim = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
}

export default function InspecaoExtintorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isSubmitting, setIsLoading] = useState(false)
  const [extintor, setExtintor] = useState<any>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [dataInspecao, setDataInspecao] = useState<Date | null>(new Date())

  // Estado para armazenar as fotos individuais de cada pergunta
  const [itemPhotos, setItemPhotos] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadData() {
      const data = await getExtintorComHistorico(id)
      setExtintor(data)
      setIsDataLoading(false)
    }
    loadData()
  }, [id])

  // Gerencia o upload de fotos por item
  const handleItemPhotoChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setItemPhotos(prev => ({ ...prev, [itemId]: url }))
    }
  }

  // Remove a foto de um item específico
  const removeItemPhoto = (itemId: string) => {
    setItemPhotos(prev => {
      const newState = { ...prev }
      delete newState[itemId]
      return newState
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('extintorId', id)
    formData.append('usuarioId', 'temp-user-id')
    if (dataInspecao) {
      formData.append('dataInspecao', format(dataInspecao, 'yyyy-MM-dd'))
    }
    
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

  const checklistItems = [
    { id: "manometro", label: "Manômetro em área verde?" },
    { id: "lacre", label: "Lacre de segurança intacto?" },
    { id: "sinalizacao", label: "Sinalização de solo/parede adequada?" },
    { id: "mangueira", label: "Mangueira livre de rachaduras?" },
    { id: "pintura", label: "Cilindro e pintura em bom estado?" },
    { id: "seloInmetro", label: "Selo do Inmetro legível e presente?" },
  ]

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!extintor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Equipamento não encontrado</h1>
        <Button onClick={() => router.push("/extintores")} className="mt-4 rounded-xl bg-red-600 hover:bg-red-700">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-6 pb-10 px-4 sm:px-0"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => !isSubmitting && router.push("/extintores")}
            disabled={isSubmitting}
            className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
              Nova Inspeção
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rotina de Vistoria</p>
          </div>
        </div>

        {/* Informações do Usuário Logado */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-black text-slate-800 uppercase tracking-tighter leading-none">INSPETOR BELLO</p>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">SESMT ALIMENTOS</p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Card Resumo do Equipamento */}
      <motion.div variants={itemAnim}>
        <Card className="border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] bg-[#B11226] blur-2xl pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm shrink-0 overflow-hidden">
                {extintor.foto ? (
                  <img src={extintor.foto} alt={extintor.codigo} className="h-full w-full object-cover" />
                ) : (
                  <Flame className="h-7 w-7 text-red-500" />
                )}
              </div>
              <div>
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipamento</Label>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">{extintor.codigo}</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <MapPin className="h-3 w-3 text-blue-500" /> Localização
                </span>
                <span className="text-sm font-bold text-slate-700">{extintor.localizacao}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Info className="h-3 w-3 text-orange-500" /> Tipo / Capacidade
                </span>
                <span className="text-sm font-bold text-slate-700">{extintor.tipo} - {extintor.capacidade}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={itemAnim}>
          <Card className="border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-[#B11226]" />
                Checklist Interativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-4 sm:px-6">
              
              {/* Campo de Data da Inspeção */}
              <div className="space-y-2 pb-6 border-b border-slate-100">
                <Label htmlFor="dataInspecao" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Data da Inspeção
                </Label>
                <DatePicker
                  date={dataInspecao}
                  setDate={setDataInspecao}
                  placeholder="dd/mm/aaaa"
                />
              </div>
              
              {/* Checklist Dinâmico com Fotos Individuais */}
              <div className="grid gap-6">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 pb-6 border-b border-slate-100/80 last:border-0 last:pb-0">
                    <Label className="text-[13px] font-bold text-slate-800 leading-snug">
                      {item.label}
                    </Label>
                    
                    {/* Linha de Botões (Ok / Falha / Câmera) */}
                    <div className="flex gap-2 h-12">
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name={item.id} value="conforme" defaultChecked className="peer hidden" />
                        <div className="h-full flex items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-slate-50 peer-checked:border-[#00e676] peer-checked:bg-[#00e676]/10 peer-checked:text-[#00c853] text-slate-400 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm">
                          <CheckCircle2 className="w-4 h-4" /> Ok
                        </div>
                      </label>

                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name={item.id} value="nao-conforme" className="peer hidden" />
                        <div className="h-full flex items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-slate-50 peer-checked:border-[#DC2626] peer-checked:bg-[#DC2626]/10 peer-checked:text-[#DC2626] text-slate-400 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm">
                          <AlertCircle className="w-4 h-4" /> Falha
                        </div>
                      </label>

                      {/* Botão de Câmera da Pergunta */}
                      <label className="w-16 shrink-0 cursor-pointer h-full flex items-center justify-center rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 shadow-sm relative overflow-hidden">
                        {/* Se tiver foto, o ícone da câmera fica azul para indicar */}
                        <Camera className={`w-5 h-5 transition-colors ${itemPhotos[item.id] ? "text-blue-600" : ""}`} />
                        <input
                          type="file"
                          name={`foto_${item.id}`} // O nome da foto vai ser "foto_manometro", etc.
                          className="hidden"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleItemPhotoChange(item.id, e)}
                        />
                      </label>
                    </div>

                    {/* Exibição da Miniatura da Foto Tirada */}
                    <AnimatePresence>
                      {itemPhotos[item.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm group"
                        >
                          <img src={itemPhotos[item.id]} alt={`Evidência ${item.label}`} className="w-full h-full object-cover" />
                          
                          {/* Botão de Remover a Foto */}
                          <button
                            type="button"
                            onClick={() => removeItemPhoto(item.id)}
                            className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-600 text-white p-1 rounded-lg backdrop-blur-sm transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Campo de Observações Gerais */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <Label htmlFor="observacao" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Observações Gerais
                </Label>
                <Textarea
                  id="observacao"
                  name="observacao"
                  placeholder="Se necessário, adicione observações gerais sobre o equipamento..."
                  className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus-visible:ring-[#B11226] focus-visible:ring-offset-2 transition-all font-medium text-sm resize-none p-4"
                />
              </div>

              {/* Termo de Assinatura */}
              <div className="flex items-start space-x-3 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 px-6 pb-6 rounded-b-[2rem]">
                <Checkbox
                  id="assinatura"
                  name="assinatura"
                  required
                  className="h-6 w-6 mt-0.5 rounded-lg border-slate-300 data-[state=checked]:bg-[#00e676] data-[state=checked]:border-[#00e676]"
                />
                <Label htmlFor="assinatura" className="text-[13px] font-bold text-slate-600 leading-relaxed cursor-pointer select-none">
                  Confirmo que realizei a inspeção física in-loco e as informações preenchidas são verdadeiras.
                </Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botão Flutuante de Ação */}
        <motion.div variants={itemAnim} className="pb-8">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#B11226] to-[#ff6d00] hover:opacity-90 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:-translate-y-1 transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registrando Inspeção...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Finalizar Vistoria
              </>
            )}
          </Button>
        </motion.div>
      </form>
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </motion.div>
  )
}