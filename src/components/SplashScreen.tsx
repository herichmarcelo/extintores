"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

/**
 * SplashScreen
 *
 * Exibe a imagem /splash.png cobrindo 100vw × 100dvh com object-fit: cover.
 * Permanece visível ~1.8 s e depois faz fade-out suave.
 *
 * Regras:
 * - Exibe APENAS uma vez por sessão do navegador (sessionStorage).
 * - Em desktop fora de PWA também exibe, mas pode ser limitado por CSS
 *   via a media query `(display-mode: standalone)` se desejado.
 */
export function SplashScreen() {
  // null = ainda decidindo | true = mostrando | false = escondendo/oculta
  const [phase, setPhase] = useState<"idle" | "visible" | "fading" | "done">("idle")

  useEffect(() => {
    // Mostra splash apenas uma vez por sessão
    const shown = sessionStorage.getItem("splashShown")
    if (shown) {
      setPhase("done")
      return
    }

    // Marca como exibida ANTES de começar, para evitar dupla exibição
    sessionStorage.setItem("splashShown", "1")
    setPhase("visible")

    // Após 1.8 s inicia o fade-out (0.5 s de transição CSS)
    const fadeTimer = setTimeout(() => setPhase("fading"), 1800)
    // Após o fade remove do DOM completamente
    const doneTimer = setTimeout(() => setPhase("done"), 2350)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  // Já terminou — não renderiza nada
  if (phase === "done" || phase === "idle") return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        width: "100%",
        height: "100dvh",
        background: "#B11226",
        opacity: phase === "fading" ? 0 : 1,
        transition: phase === "fading" ? "opacity 0.55s ease-out" : "opacity 0.3s ease-in",
        pointerEvents: phase === "fading" ? "none" : "all",
        // Garante que cubra a barra de status no iOS PWA
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Image
        src="/splash.png"
        alt="Rota de Incêndio"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
    </div>
  )
}
