"use client"

import { Menu, Bell, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "./Avatar"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onMenuClick?: () => void
  className?: string
}

export function Header({ onMenuClick, className }: HeaderProps) {
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
              <p className="text-sm font-bold text-slate-900">Inspetor Bello</p>
              <p className="text-xs text-slate-500 font-medium">SESMT Alimentos</p>
            </div>
            <Avatar size="md" />
          </div>
        </div>
      </div>
    </header>
  )
}
