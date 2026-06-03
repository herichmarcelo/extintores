"use client"

import {
  LayoutDashboard,
  Flame,
  Droplets,
  Building2,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Extintores", url: "/extintores", icon: Flame },
  { title: "Hidrantes", url: "/hidrantes", icon: Droplets },
  { title: "Unidades", url: "/unidades", icon: Building2 },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Usuários", url: "/usuarios", icon: Users },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-[#1f1d1a] text-[#e8ddbd]">
      <SidebarHeader className="h-24 flex items-center justify-center px-4">
        <Link href="/dashboard" className="flex items-center gap-4 w-full">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bello-gradient shadow-2xl shadow-[#9d1d36]/30 text-white">
            <Flame className="h-8 w-8" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-black text-white text-xl leading-tight tracking-tighter truncate uppercase">Bello</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dba887] leading-tight">Alimentos</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 pt-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#a9b79e] font-black px-4 mb-4 text-[10px] uppercase tracking-[0.2em] opacity-50">
            Menu Geral
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      tooltip={item.title}
                      className={cn(
                        "h-12 px-4 rounded-2xl transition-all duration-300 group",
                        isActive 
                          ? "bg-white/10 text-white font-black shadow-lg" 
                          : "hover:bg-white/5 hover:text-white"
                      )}
                      render={
                        <Link href={item.url}>
                          <item.icon className={cn(
                            "h-5 w-5 transition-all duration-300",
                            isActive ? "text-[#c25848] scale-110" : "text-[#a9b79e] group-hover:text-[#dba887]"
                          )} />
                          <span className="ml-3 text-sm tracking-wide">{item.title}</span>
                          {isActive && !isCollapsed && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c25848] shadow-[0_0_10px_#c25848]" />
                          )}
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="h-12 px-4 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group"
              render={
                <Link href="/login">
                  <LogOut className="h-5 w-5 text-[#a9b79e] group-hover:text-[#9d1d36]" />
                  <span className="ml-3 font-bold text-sm">Encerrar Sessão</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
