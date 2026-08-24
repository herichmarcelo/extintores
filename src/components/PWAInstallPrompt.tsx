"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, X, Smartphone } from "lucide-react"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Verificar se já mostrou o prompt antes
    const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown')
    if (hasShownPrompt) return

    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Para iOS, mostrar prompt após um delay
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        // Verificar se não está em modo standalone (já instalado)
        if (!(window as any).navigator.standalone) {
          setShowPrompt(true)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }

    // Para Android/Desktop, usar beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      // Para iOS, mostrar instruções
      setShowPrompt(false)
      localStorage.setItem('pwa-install-prompt-shown', 'true')
      return
    }

    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }

    setShowPrompt(false)
    localStorage.setItem('pwa-install-prompt-shown', 'true')
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-prompt-shown', 'true')
  }

  if (!showPrompt) return null

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-slate-900">
            Instalar App
          </DialogTitle>
        </DialogHeader>

        <div className="text-center text-slate-600 font-medium text-sm sm:text-base mb-4 sm:mb-6">
          {isIOS ? (
            <>
              <p>Instale o Rota de Incêndio na sua tela inicial para acesso rápido e offline.</p>
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-xl border border-slate-200 text-left">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-2">Como instalar:</p>
                <ol className="text-xs sm:text-sm text-slate-600 space-y-1 sm:space-y-2 list-decimal list-inside">
                  <li>Toque no botão Compartilhar</li>
                  <li>Selecione "Adicionar à Tela de Início"</li>
                  <li>Toque "Adicionar" para confirmar</li>
                </ol>
              </div>
            </>
          ) : (
            <p>Instale o Rota de Incêndio no seu dispositivo para acesso rápido e funcionalidade offline.</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          {!isIOS && (
            <Button
              onClick={handleInstall}
              className="w-full h-10 sm:h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg transition-all text-sm sm:text-base"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Instalar Agora
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full h-10 sm:h-12 rounded-xl border-slate-300 hover:bg-slate-200 font-medium text-sm sm:text-base"
          >
            Agora Não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
