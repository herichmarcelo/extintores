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
      <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-slate-900">
            Instalar App
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600 font-medium">
            {isIOS ? (
              <>
                Instale o Rota de Incêndio na sua tela inicial para acesso rápido e offline.
                <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 text-left">
                  <p className="text-sm font-semibold text-slate-800 mb-2">Como instalar:</p>
                  <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Toque no botão Compartilhar</li>
                    <li>Selecione "Adicionar à Tela de Início"</li>
                    <li>Toque "Adicionar" para confirmar</li>
                  </ol>
                </div>
              </>
            ) : (
              "Instale o Rota de Incêndio no seu dispositivo para acesso rápido e funcionalidade offline."
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-3 mt-6">
          {!isIOS && (
            <Button
              onClick={handleInstall}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg transition-all"
            >
              <Download className="h-5 w-5 mr-2" />
              Instalar Agora
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full h-12 rounded-xl border-slate-300 hover:bg-slate-200 font-medium"
          >
            Agora Não
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
