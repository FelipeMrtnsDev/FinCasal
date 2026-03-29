"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "payment_required"
const EVENT_NAME = "payment-required"

export function PaymentRequiredBanner() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  const bypassRoutes = [
    "/plans",
    "/checkout",
    "/assinatura",
    "/login",
    "/registro",
    "/auth/callback",
    "/invite",
    "/convite",
  ]
  const canBypassBlock = bypassRoutes.some((route) => pathname.startsWith(route))

  useEffect(() => {
    const syncFromStorage = () => {
      setVisible(localStorage.getItem(STORAGE_KEY) === "1")
    }

    const handleEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ required?: boolean }>
      if (typeof customEvent.detail?.required === "boolean") {
        setVisible(customEvent.detail.required)
        return
      }
      syncFromStorage()
    }

    syncFromStorage()
    window.addEventListener(EVENT_NAME, handleEvent)
    window.addEventListener("storage", syncFromStorage)
    return () => {
      window.removeEventListener(EVENT_NAME, handleEvent)
      window.removeEventListener("storage", syncFromStorage)
    }
  }, [])

  if (!visible || canBypassBlock) return null

  return (
    <div className="fixed inset-0 z-[120] bg-background/95 backdrop-blur-sm p-4">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold text-foreground mb-2">
            Acesso bloqueado
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Você precisa contratar um plano para acessar esta área do dashboard.
          </p>
          <Link href="/plans" className="block">
            <Button className="w-full">
              Ir para pagamento
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
