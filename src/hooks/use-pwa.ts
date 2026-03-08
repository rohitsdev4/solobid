"use client"
import { useState, useEffect } from "react"

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", () => { setIsInstalled(true); setDeferredPrompt(null) })
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return outcome === "accepted"
  }

  return { canInstall: !!deferredPrompt, isInstalled, isStandalone, install }
}
