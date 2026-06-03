"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import { Flame, CheckCircle2, TrendingUp, ShieldAlert, Map, Activity, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { getDashboardData } from "@/app/actions/extintores"

// Cores vibrantes estilo "Bombeiro / Alerta / Neon"
const COLORS = {
  redNeon: "#ff1744", // Vermelho Extintor/Emergência
  orangeNeon: "#ff6d00", // Laranja Fogo/Chama
  greenNeon: "#00e676", // Verde Segurança/Aprovado
  blueNeon: "#2979ff", // Azul SLA/Informação
}

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

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const result = await getDashboardData()
      setData(result)
      setIsLoading(false)
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </div>
    )
  }

  const stats = [
    { title: "Total Extintores", value: data?.totalExtintores || 0, icon: Flame, color: COLORS.orangeNeon, trend: "Ativo", bgShadow: "shadow-[0_8px_30px_rgba(255,109,0,0.15)]" },
    { title: "Aprovados", value: data?.aprovados || 0, icon: CheckCircle2, color: COLORS.greenNeon, trend: `${data?.taxaEficiencia || 0}%`, bgShadow: "shadow-[0_8px_30px_rgba(0,230,118,0.15)]" },
    { title: "Reprovados", value: data?.reprovados || 0, icon: ShieldAlert, color: COLORS.redNeon, trend: "Atenção", bgShadow: "shadow-[0_8px_30px_rgba(255,23,68,0.15)]" },
    { title: "SLA de Correção", value: "48h", icon: TrendingUp, color: COLORS.blueNeon, trend: "Meta ok", bgShadow: "shadow-[0_8px_30_rgba(41,121,255,0.15)]" },
  ]

  const pieData = [
    { name: "Conforme", value: data?.aprovados || 0, color: COLORS.greenNeon },
    { name: "Não Conforme", value: data?.reprovados || 0, color: COLORS.redNeon },
  ]

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 bg-slate-50/50 p-4 md:p-8 min-h-screen rounded-3xl"
    >
      {/* Header com Gradiente Fogo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
            Dashboard
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-1 uppercase tracking-widest">
            SESMT Bello Alimentos
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(255,23,68,0.1)] border border-red-100">
          <Activity className="h-4 w-4 text-red-500 animate-pulse" />
          <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sistema Operativo</span>
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_#00e676]" />
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className={`relative overflow-hidden border border-slate-100 ${stat.bgShadow} hover:-translate-y-1 transition-all duration-300 group bg-white`}>
              <div 
                className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 blur-2xl" 
                style={{ backgroundColor: stat.color }}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{stat.title}</CardTitle>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <stat.icon 
                    className="h-5 w-5 transition-transform group-hover:scale-110" 
                    style={{ color: stat.color, filter: `drop-shadow(0px 0px 8px ${stat.color}80)` }} 
                  />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                <div className="flex items-center gap-2 mt-3">
                  <span 
                    className="text-[11px] font-black px-2.5 py-1 rounded-md text-white uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: stat.color }}
                  >
                    {stat.trend}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo Real</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div variants={item} className="col-span-full lg:col-span-4">
          <Card className="border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full overflow-hidden rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-slate-100/50 pb-6">
              <div>
                <CardTitle className="text-xl font-black text-slate-800">Conformidade por Unidade</CardTitle>
                <p className="text-sm text-slate-500 font-semibold mt-1">Equipamentos aprovados vs. reprovados</p>
              </div>
              <div className="p-3 bg-red-50 rounded-2xl border border-red-100 shadow-[0_0_15px_rgba(255,23,68,0.1)]">
                <Map className="h-6 w-6 text-red-500" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px] min-h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.dataPorUnidade || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.greenNeon} stopOpacity={1}/>
                        <stop offset="100%" stopColor="#00c853" stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.redNeon} stopOpacity={1}/>
                        <stop offset="100%" stopColor="#d50000" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={12}
                      fontWeight={800}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      fontWeight={800}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9', opacity: 0.4}}
                      contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', fontWeight: 'bold'}}
                    />
                    <Bar dataKey="conforme" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={28} />
                    <Bar dataKey="naoConforme" fill="url(#errorGradient)" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-full lg:col-span-3">
          <Card className="border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full overflow-hidden rounded-2xl bg-white">
            <CardHeader className="bg-white border-b border-slate-100/50 pb-6">
              <CardTitle className="text-xl font-black text-slate-800">Taxa de Eficiência Global</CardTitle>
              <p className="text-sm text-slate-500 font-semibold mt-1">Percentual de extintores regulares</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-8">
              <div className="h-[280px] min-h-[280px] w-full relative">
                {/* Centro do Gráfico */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <div className="bg-white w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,230,118,0.2)]">
                    <span className="text-5xl font-black text-slate-900" style={{ color: COLORS.greenNeon, filter: `drop-shadow(0px 0px 4px ${COLORS.greenNeon}40)` }}>{data?.taxaEficiencia || 0}%</span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Global</span>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda Customizada */}
              <div className="grid grid-cols-2 gap-4 w-full mt-8">
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.greenNeon }} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conforme</span>
                  </div>
                  <span className="text-xl font-black text-slate-800">{data?.aprovados || 0}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.redNeon }} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Crítico</span>
                  </div>
                  <span className="text-xl font-black text-slate-800">{data?.reprovados || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
