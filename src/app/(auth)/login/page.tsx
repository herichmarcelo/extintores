"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Flame, Lock, Mail, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("E-mail ou senha incorretos")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#9d1d36] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#dba887] blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex h-24 w-24 items-center justify-center rounded-[2.5rem] bello-gradient text-white mb-8 shadow-2xl shadow-[#9d1d36]/30"
          >
            <Flame className="h-14 w-14" />
          </motion.div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Bello</h1>
          <p className="mt-1 text-[#c25848] font-black uppercase tracking-[0.4em] text-xs">Alimentos</p>
        </div>

        <Card className="shadow-2xl border-none bg-white rounded-[2rem] overflow-hidden">
          <CardHeader className="space-y-1 pt-10 px-10">
            <CardTitle className="text-3xl font-black text-slate-800 tracking-tight">Login</CardTitle>
            <CardDescription className="text-slate-500 font-bold">
              Painel SESMT - Segurança do Trabalho
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold text-sm">
              {error}
            </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-800 font-black text-xs uppercase tracking-widest ml-1">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="inspetor@belloalimentos.com.br"
                    className="pl-12 h-14 bg-white/50 border-slate-100 rounded-2xl focus:bg-white transition-all font-bold text-slate-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-slate-800 font-black text-xs uppercase tracking-widest">Senha</Label>
                  <Button variant="link" className="px-0 font-black text-[10px] text-[#c25848] uppercase tracking-widest hover:text-[#9d1d36]">
                    Recuperar
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-12 h-14 bg-white/50 border-slate-100 rounded-2xl focus:bg-white transition-all font-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bello-gradient hover:opacity-95 h-14 text-lg font-black uppercase tracking-widest shadow-2xl shadow-[#9d1d36]/30 transition-all group rounded-2xl"
              >
                {isLoading ? (
                  <div className="h-6 w-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center gap-3">
                    Entrar
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center text-sm"
        >
          <p className="text-slate-400 font-medium">&copy; {new Date().getFullYear()} Bello Alimentos S/A</p>
          <p className="text-slate-500 font-bold mt-1">SESMT - Segurança do Trabalho</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
