"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Camera, ChevronLeft, Save, Loader2, CheckCircle2, AlertCircle, Droplets, MapPin, Info, X, ClipboardCheck, User } from "lucide-react"
import { createInspecaoHidrante, getHidranteComHistorico } from "@/app/actions/hidrantes"
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

export default function InspecaoHidrantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsLoading] = useState(false)
  const [hidrante, setHidrante] = useState<any>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [dataInspecao, setDataInspecao] = useState<Date | null>(new Date())

  const [itemPhotos, setItemPhotos] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) return
      const data = await getHidranteComHistorico(id, session.user.id)
      setHidrante(data)
      setIsDataLoading(false)
    }
    loadData()
  }, [id, session?.user?.id])

  const handleItemPhotoChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setItemPhotos(prev => ({ ...prev, [itemId]: url }))
    }
  }

  const removeItemPhoto = (itemId: string) => {
    setItemPhotos(prev => {
      const newState = { ...prev }
      delete newState[itemId]
      return newState
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session?.user?.id) {
      alert("Você precisa estar logado para realizar uma inspeção!")
      return
    }
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('hidranteId', id)
    formData.append('usuarioId', session.user.id)
    if (dataInspecao) {
      formData.append('dataInspecao', format(dataInspecao, 'yyyy-MM-dd'))
    }
    
    const items = [
      'localAcessivel',
      'sinalizado',
      'estadoMangueiras',
      'enroladasCorretamente',
      'esguichosNoLocal',
      'esguichosBoasCondicoes',
      'semVazamentos',
      'valvulaFechada',
      'temChaveStorz',
      'estadoPintura',
      'proximoTesteHidrostatico'
    ]
    const hasNonConformity = items.some(item => formData.get(item) === 'nao-conforme')
    formData.append('status', hasNonConformity ? 'Não Conforme' : 'Conforme')

    const result = await createInspecaoHidrante(formData)

    if (result.success) {
      router.push("/hidrantes")
    } else {
      alert(result.error)
      setIsLoading(false)
    }
  }

  const checklistItems = [
    { id: "localAcessivel", label: "O local está acessível?" },
    { id: "sinalizado", label: "Está sinalizado?" },
    { id: "estadoMangueiras", label: "Qual o estado das mangueiras?" },
    { id: "enroladasCorretamente", label: "Estão enroladas corretamente?" },
    { id: "esguichosNoLocal", label: "Os esguichos estão no local?" },
    { id: "esguichosBoasCondicoes", label: "Estão em boas condições?" },
    { id: "semVazamentos", label: "Há vazamentos?" },
    { id: "valvulaFechada", label: "A válvula está fechada?" },
    { id: "temChaveStorz", label: "Tem Chave storz?" },
    { id: "estadoPintura", label: "Qual o estado da pintura?" },
    { id: "proximoTesteHidrostatico", label: "Próximo teste hidrostáticos?" },
  ]

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hidrante) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertCircle className="h-12 w-12 text-blue-500 mb-4" />
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Equipamento não encontrado</h1>
        <Button onClick={() => router.push("/hidrantes")} className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700">
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
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => !isSubmitting && router.push("/hidrantes")}
            disabled={isSubmitting}
            className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Nova Inspeção
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rotina de Vistoria</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-black text-slate-800 uppercase tracking-tighter leading-none">INSPETOR {session?.user?.name || "USUÁRIO"}</p>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">BELLO ALIMENTOS</p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>

      <motion.div variants={itemAnim}>
        <Card className="border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] bg-[#2563eb] blur-2xl pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm shrink-0 overflow-hidden">
                {hidrante.foto ? (
                  <img src={hidrante.foto} alt={hidrante.codigo} className="h-full w-full object-cover" />
                ) : (
                  <Droplets className="h-7 w-7 text-blue-500" />
                )}
              </div>
              <div>
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipamento</Label>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">{hidrante.codigo}</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-4 gap-x-4">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <MapPin className="h-3 w-3 text-blue-500" /> Localização
                </span>
                <span className="text-sm font-bold text-slate-700">{hidrante.localizacao}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={itemAnim}>
          <Card className="border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
                Checklist Interativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-4 sm:px-6">
              
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
              
              <div className="grid gap-6">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 pb-6 border-b border-slate-100/80 last:border-0 last:pb-0">
                    <Label className="text-[13px] font-bold text-slate-800 leading-snug">
                      {item.label}
                    </Label>
                    
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

                      <label className="w-16 shrink-0 cursor-pointer h-full flex items-center justify-center rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 shadow-sm relative overflow-hidden">
                        <Camera className={`w-5 h-5 transition-colors ${itemPhotos[item.id] ? "text-blue-600" : ""}`} />
                        <input
                          type="file"
                          name={`foto_${item.id}`}
                          className="hidden"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleItemPhotoChange(item.id, e)}
                        />
                      </label>
                    </div>

                    <AnimatePresence>
                      {itemPhotos[item.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm group"
                        >
                          <img src={itemPhotos[item.id]} alt={`Evidência ${item.label}`} className="w-full h-full object-cover" />
                          
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

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <Label htmlFor="observacao" className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Observações Gerais
                </Label>
                <Textarea
                  id="observacao"
                  name="observacao"
                  placeholder="Se necessário, adicione observações gerais sobre o equipamento..."
                  className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all font-medium text-sm resize-none p-4"
                />
              </div>

              <div className="flex items-start space-x-3 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 px-6 pb-6 rounded-b-[2rem]">
                <Checkbox
                  id="assinatura"
                  name="assinatura"
                  required
                  className="h-6 w-6 mt-0.5 rounded-lg border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="assinatura" className="text-[13px] font-bold text-slate-600 leading-relaxed cursor-pointer select-none">
                  Confirmo que realizei a inspeção física in-loco e as informações preenchidas são verdadeiras.
                </Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim} className="pb-8">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300"
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
