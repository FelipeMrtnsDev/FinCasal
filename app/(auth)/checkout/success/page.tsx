"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { billingService } from "@/services/financeService"
import { authService } from "@/services/authService"
import { authSession } from "@/lib/authSession"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const plan = searchParams.get("plan")
  const planLabel = plan === "casal" ? "Casal" : "Individual"

  useEffect(() => {
    const completeOnboarding = async () => {
      setLoading(true)
      setError(null)
      try {
        const onboardingToken = authSession.getOnboardingToken()
        const dashboardId = authSession.getOnboardingDashboardId() || ""
        const sessionId =
          searchParams.get("session_id") ||
          searchParams.get("sessionId") ||
          searchParams.get("checkoutId")

        if (!onboardingToken) {
          throw new Error("Seu onboarding expirou. Faça login novamente para continuar.")
        }

        if (!dashboardId) {
          throw new Error("Não encontramos o dashboard para confirmar o pagamento.")
        }

        if (!sessionId) {
          throw new Error("Não encontramos a sessão do checkout para confirmar o pagamento.")
        }

        await billingService.confirmCheckoutPayment(
          sessionId,
          { dashboardId },
          onboardingToken,
        )
        const subscription = await billingService.getSubscription(
          dashboardId,
          onboardingToken,
        )
        if (String(subscription?.status || "").toUpperCase() !== "ACTIVE") {
          throw new Error("Pagamento confirmado, mas assinatura ainda não está ativa.")
        }

        const exchangeResponse = await authService.exchangeOnboardingToken(onboardingToken)
        const flow = authSession.resolveAuthFlow(exchangeResponse)

        if (flow.kind !== "final") {
          throw new Error("Não foi possível concluir a ativação da sua conta.")
        }

        authSession.persistFinalToken(flow.token)
        localStorage.removeItem("payment_required")
        window.dispatchEvent(
          new CustomEvent("payment-required", {
            detail: { required: false },
          }),
        )
        window.location.href = "/"
      } catch (checkoutError: any) {
        setError(
          checkoutError?.response?.data?.message ||
          checkoutError?.message ||
          "Falha ao confirmar pagamento e concluir seu acesso.",
        )
        setLoading(false)
      }
    }

    completeOnboarding()
  }, [searchParams])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle>{loading ? "Confirmando pagamento" : "Pagamento confirmado"}</CardTitle>
          <CardDescription>
            {loading
              ? "Estamos validando seu checkout e liberando seu acesso."
              : `Seu plano ${planLabel} foi ativado com sucesso.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {error && (
            <>
              <Link href="/plans" className="w-full">
                <Button className="w-full">Voltar para planos</Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">Ir para login</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
