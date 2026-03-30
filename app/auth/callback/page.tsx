"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { authSession } from "@/lib/authSession"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const onboardingToken =
      searchParams.get("onboardingToken") || searchParams.get("onboarding_token")
    const dashboardId = searchParams.get("dashboardId")
    const paymentRequired =
      searchParams.get("paymentRequired") === "true" ||
      searchParams.get("requiresPayment") === "true"

    if (token) {
      authSession.persistFinalToken(token)
      localStorage.removeItem("payment_required")
      router.push("/")
      return
    }

    if ((paymentRequired && onboardingToken) || onboardingToken) {
      authSession.persistOnboardingSession({
        onboardingToken,
        dashboardId,
      })
      router.push("/plans")
      return
    }

    router.push("/login")
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Autenticando...</p>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
