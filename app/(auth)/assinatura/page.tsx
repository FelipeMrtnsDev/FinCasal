"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { billingService, BillingPlan, BillingPlanId, dashboardService } from "@/services/financeService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formatPrice = (priceInCents: number, currency: string) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  }).format((priceInCents || 0) / 100)

const getPlanFromQuery = (plan: string | null): BillingPlanId | null => {
  if (plan === "individual") return "INDIVIDUAL"
  if (plan === "casal" || plan === "couple") return "COUPLE"
  return null
}

export default function AssinaturaPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [startingCheckout, setStartingCheckout] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [dashboardId, setDashboardId] = useState("")
  const [selectedPlanId, setSelectedPlanId] = useState<BillingPlanId | null>(
    getPlanFromQuery(searchParams.get("plan")),
  )

  useEffect(() => {
    const queryPlan = getPlanFromQuery(searchParams.get("plan"))
    if (queryPlan) setSelectedPlanId(queryPlan)
  }, [searchParams])

  useEffect(() => {
    const loadBillingData = async () => {
      setLoading(true)
      setError(null)
      try {
        const dashboardData = await dashboardService.get()
        const dashboardRecord = dashboardData as Record<string, unknown>
        const resolvedDashboardId =
          (typeof dashboardRecord.dashboardId === "string" &&
            dashboardRecord.dashboardId) ||
          (typeof dashboardRecord.id === "string" && dashboardRecord.id) ||
          ""
        if (!resolvedDashboardId) {
          throw new Error("Dashboard não encontrado.")
        }
        setDashboardId(resolvedDashboardId)
        const availablePlans = await billingService.getPlans(resolvedDashboardId)
        setPlans(availablePlans)
        if (!selectedPlanId && availablePlans.length > 0) {
          setSelectedPlanId(availablePlans[0].id)
        }
      } catch (loadError: any) {
        setError(loadError?.message || "Não foi possível carregar os planos.")
      } finally {
        setLoading(false)
      }
    }
    loadBillingData()
  }, [])

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || null,
    [plans, selectedPlanId],
  )

  const handleStartCheckout = async () => {
    if (!dashboardId || !selectedPlanId || startingCheckout) return
    setStartingCheckout(true)
    setError(null)
    try {
      const origin = window.location.origin
      const completionPlan = selectedPlanId === "COUPLE" ? "casal" : "individual"
      const checkout = await billingService.createPlanCheckout({
        dashboardId,
        planId: selectedPlanId,
        returnUrl: `${origin}/assinatura/voltar`,
        completionUrl: `${origin}/assinatura/sucesso?plan=${completionPlan}`,
        methods: ["PIX", "CARD"],
      })
      window.location.href = checkout.url
    } catch (checkoutError: any) {
      setError(
        checkoutError?.message ||
          "Não foi possível iniciar o checkout do plano.",
      )
      setStartingCheckout(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Escolha seu plano</CardTitle>
          <CardDescription>
            Para continuar para o sistema, finalize o pagamento de um plano.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <div className="py-10 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando planos...
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`text-left rounded-lg border p-4 transition-colors ${
                      selectedPlanId === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                    <p className="text-lg font-bold text-foreground mt-3">
                      {formatPrice(plan.price, plan.currency)}
                      <span className="text-xs text-muted-foreground font-medium ml-1">
                        /{plan.interval}
                      </span>
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  className="sm:flex-1"
                  onClick={handleStartCheckout}
                  disabled={!selectedPlan || startingCheckout}
                >
                  {startingCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Redirecionando...
                    </>
                  ) : (
                    "Ir para pagamento"
                  )}
                </Button>
                <Link href="/login" className="sm:flex-1">
                  <Button variant="outline" className="w-full">
                    Trocar conta
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
