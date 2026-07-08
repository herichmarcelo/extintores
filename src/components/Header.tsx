"use client"

import { useState, useEffect } from "react"
import { Menu, Bell, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "./Avatar"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onMenuClick?: () => void
  className?: string
}

export function Header({ onMenuClick, className }: HeaderProps) {
  // 1. Inicializa ambos os estados para receberem dados dinâmicos
  const [userName, setUserName] = useState("Carregando...")
  const [userRole, setUserRole] = useState("Carregando...")

  // 2. Simula a busca dos dados do usuário logado
  useEffect(() => {
    async function loadUserData() {
      try {
        /* 
          AQUI ENTRA A SUA LÓGICA DE BANCO DE DADOS (API / Supabase / NextAuth).
          Você deve puxar não só o nome, mas também o cargo da tabela de usuários.
        */
        
        // Simulando a resposta do seu banco baseada na imagem que você enviou:
        const mockUserData = {
          nome: "CLEISON RAIMUNDO DO NASCIMENTO",
          cargo: "BRIGADISTA"
        }

        // 3. Atualiza os estados com os dados recebidos
        setUserName(mockUserData.nome)
        setUserRole(mockUserData.cargo)

      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        // Valores de fallback (segurança) caso a API falhe
        setUserName("Usuário Logado")
        setUserRole("Colaborador") 
      }
    }

    loadUserData()
  }, [])

  return (
    <header className={cn(
      "bg-white border-b border-[#E5E7EB] sticky top-0 z-40",
      className
    )}>
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 rounded-xl"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </Button>

          <div className="lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B11226] flex items-center justify-center text-white">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Extintores</h1>
              <p className="text-xs text-slate-500 font-medium">Matriz e Unidades</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl relative"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#B11226]" />
          </Button>

          <div className="flex items-center gap-3 pl-3 border-l border-[#E5E7EB]">
            <div className="text-right hidden sm:block">
              {/* 4. Renderiza as variáveis de estado diretamente no JSX */}
              <p className="text-sm font-bold text-slate-900 uppercase">{userName}</p>
              <p className="text-xs text-emerald-500 font-bold uppercase">{userRole}</p>
            </div>
            <Avatar size="md" />
          </div>
        </div>
      </div>
    </header>
  )
}