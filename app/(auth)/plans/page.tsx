"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { billingService, BillingPlan, BillingPlanId } from "@/services/financeService"
import { authSession } from "@/lib/authSession"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

export default function PlansPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [startingCheckout, setStartingCheckout] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [dashboardId, setDashboardId] = useState("")
  const [onboardingToken, setOnboardingToken] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerCellphone, setCustomerCellphone] = useState("")
  const [customerTaxId, setCustomerTaxId] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [selectedPlanId, setSelectedPlanId] = useState<BillingPlanId | null>(
    getPlanFromQuery(searchParams.get("plan")),
  )

  useEffect(() => {
    const queryPlan = getPlanFromQuery(searchParams.get("plan"))
    if (queryPlan) setSelectedPlanId(queryPlan)
  }, [searchParams])

  useEffect(() => {
    const storedName = localStorage.getItem("onboarding_name")
    const storedEmail = localStorage.getItem("onboarding_email")
    if (storedName) setCustomerName(storedName)
    if (storedEmail) setCustomerEmail(storedEmail)
  }, [])

  useEffect(() => {
    const loadBillingData = async () => {
      setLoading(true)
      setError(null)
      try {
        const storedOnboardingToken = authSession.getOnboardingToken() || ""
        const storedDashboardId = authSession.getOnboardingDashboardId() || ""

        if (!storedOnboardingToken) {
          window.location.href = "/login"
          return
        }

        setOnboardingToken(storedOnboardingToken)
        setDashboardId(storedDashboardId)

        if (!storedDashboardId) {
          throw new Error("Não encontramos o dashboard do onboarding. Faça login novamente.")
        }

        const availablePlans = await billingService.getPlans(
          storedDashboardId,
          storedOnboardingToken,
        )
        setPlans(availablePlans)
        if (!selectedPlanId && availablePlans.length > 0) {
          setSelectedPlanId(availablePlans[0].id)
        }
      } catch (loadError: any) {
        if (loadError?.response?.status === 401 || loadError?.response?.status === 403) {
          authSession.clearOnboardingSession()
          window.location.href = "/login"
          return
        }
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
    if (!dashboardId || !selectedPlanId || !onboardingToken || startingCheckout) return
    if (!customerName.trim() || !customerEmail.trim() || !customerCellphone.trim() || !customerTaxId.trim()) {
      setError("Preencha nome, e-mail, celular e CPF/CNPJ para continuar.")
      return
    }
    setStartingCheckout(true)
    setError(null)
    try {
      const origin = window.location.origin
      const completionPlan = selectedPlanId === "COUPLE" ? "casal" : "individual"
      const checkout = await billingService.createPlanCheckout(
        {
          dashboardId,
          planId: selectedPlanId,
          returnUrl: `${origin}/checkout/cancel`,
          completionUrl: `${origin}/checkout/success?plan=${completionPlan}&session_id={CHECKOUT_SESSION_ID}`,
          customerId: customerId || undefined,
          customer: {
            name: customerName.trim(),
            email: customerEmail.trim(),
            cellphone: customerCellphone.trim(),
            taxId: customerTaxId.trim(),
          },
        },
        onboardingToken,
      )
      window.location.href = checkout.url
    } catch (checkoutError: any) {
      if (checkoutError?.response?.status === 401 || checkoutError?.response?.status === 403) {
        authSession.clearOnboardingSession()
        window.location.href = "/login"
        return
      }
      setError(
        checkoutError?.response?.data?.message ||
          checkoutError?.message ||
          "Não foi possível iniciar o checkout do plano.",
      )
      setStartingCheckout(false)
    }
  }

  const handleSwitchAccount = () => {
    authSession.clearOnboardingSession()
    authSession.clearFinalToken()
    window.location.href = "/login?reauth=1"
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Escolha seu plano</CardTitle>
          <CardDescription>Para continuar para o sistema, finalize o pagamento do plano.</CardDescription>
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
                    className={`text-left rounded-lg border p-4 transition-colors ${selectedPlanId === plan.id
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="customer-name">Nome</Label>
                  <Input
                    id="customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="customer-email">E-mail</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="voce@email.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="customer-cellphone">Celular</Label>
                  <Input
                    id="customer-cellphone"
                    value={customerCellphone}
                    onChange={(e) => setCustomerCellphone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="customer-tax-id">CPF ou CNPJ</Label>
                  <Input
                    id="customer-tax-id"
                    value={customerTaxId}
                    onChange={(e) => setCustomerTaxId(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
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
                <Button variant="outline" className="sm:flex-1" onClick={handleSwitchAccount}>
                  Trocar conta
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
