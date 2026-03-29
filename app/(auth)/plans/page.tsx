"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, User, Users, Check, ArrowRight, LogOut } from "lucide-react"
import { billingService, BillingPlan, BillingPlanId } from "@/services/financeService"
import { authSession } from "@/lib/authSession"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

const UI_CONFIG = {
  INDIVIDUAL: {
    icon: User,
    description: "Para quem quer organizar suas finanças pessoais",
    features: [
      "Controle de gastos ilimitado",
      "Categorização automática",
      "Metas financeiras",
      "Relatórios mensais",
      "Alertas de vencimento",
      "Dashboard completo",
      "Acesso por 1 ano"
    ],
    highlighted: false,
    badge: undefined,
    cta: "Assinar Individual",
  },
  COUPLE: {
    icon: Users,
    description: "Para casais que querem organizar as finanças juntos",
    features: [
      "Tudo do plano Individual",
      "2 usuários na mesma conta",
      "Dashboard compartilhado",
      "Metas em conjunto",
      "Divisão de despesas",
      "Relatórios comparativos",
      "Acesso simultâneo"
    ],
    highlighted: true,
    badge: "Mais popular",
    cta: "Assinar Casal",
  }
}

const formatPrice = (priceInCents: number, currency: string) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  }).format((priceInCents || 0) / 100)

export default function PlansPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [startingCheckout, setStartingCheckout] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [dashboardId, setDashboardId] = useState("")
  const [onboardingToken, setOnboardingToken] = useState("")

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  // Check query param for initial selection, though we don't use radio buttons anymore,
  // we could just highlight or scroll, but the cards are self-contained now.
  
  useEffect(() => {
    const storedName = localStorage.getItem("onboarding_name") || ""
    const storedEmail = localStorage.getItem("onboarding_email") || ""
    setCustomerName(storedName)
    setCustomerEmail(storedEmail)
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

  const handleStartCheckout = async (planId: BillingPlanId) => {
    if (!dashboardId || !planId || !onboardingToken || startingCheckout) return
    setStartingCheckout(planId)
    setError(null)
    try {
      const origin = window.location.origin
      const completionPlan = planId === "COUPLE" ? "casal" : "individual"
      const checkout = await billingService.createPlanCheckout(
        {
          dashboardId,
          planId: planId,
          returnUrl: `${origin}/checkout/cancel`,
          completionUrl: `${origin}/checkout/success?plan=${completionPlan}&session_id={CHECKOUT_SESSION_ID}`,
          customer: {
            name: customerName,
            email: customerEmail,
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
      setStartingCheckout(null)
    }
  }

  const handleSwitchAccount = () => {
    authSession.clearOnboardingSession()
    authSession.clearFinalToken()
    window.location.href = "/login?reauth=1"
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p>Carregando planos disponíveis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col relative">
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-lg text-white hidden sm:block">FinCasal</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSwitchAccount} className="text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4 mr-2" />
          Sair / Trocar conta
        </Button>
      </header>

      {error && (
        <div className="pt-24 px-4 container mx-auto mb-[-2rem] z-10 relative">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Dark background section */}
      <div className="bg-sidebar pt-32 pb-24 border-b border-sidebar-border relative">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold text-sidebar-foreground md:text-5xl">
                Sua vida financeira.
                <br />
                <span className="text-shimmer-slow">Organizada em um só lugar.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sidebar-foreground/70 text-lg">
                Escolha o plano ideal e comece a ter previsibilidade financeira.
                Sem surpresas, sem taxas escondidas.
              </p>
            </div>
            {customerEmail && (
               <div className="text-left md:text-right">
                  <p className="text-sidebar-foreground/50 text-sm">Assinando como</p>
                  <p className="text-sidebar-foreground font-medium">{customerEmail}</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Light background pricing cards */}
      <div className="diagonal-lines flex-1 relative bg-background pb-24">
        <div className="container mx-auto px-4 relative -top-12">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              {plans.map((plan) => {
                const config = UI_CONFIG[plan.id as keyof typeof UI_CONFIG] || UI_CONFIG.INDIVIDUAL;
                const Icon = config.icon;
                const isHighlight = config.highlighted;
                const isProcessing = startingCheckout === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border p-8 transition-all duration-500 ${
                      isHighlight
                        ? "animate-glow-pulse animate-border-shine border-primary bg-card shadow-xl"
                        : "border-border bg-card hover:border-primary/30 hover:shadow-lg"
                    }`}
                  >
                    {/* Shine effect on highlighted card */}
                    {isHighlight && (
                      <div className="card-shine pointer-events-none absolute inset-0 rounded-2xl" />
                    )}

                    {config.badge && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1.5 bg-primary text-primary-foreground font-semibold px-3 py-1 text-sm shadow-md">
                        {config.badge}
                      </Badge>
                    )}

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="mb-6 flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                          isHighlight ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <Icon className={`h-6 w-6 ${isHighlight ? "text-primary" : "text-foreground"}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className={`font-mono text-5xl font-bold ${isHighlight ? "text-shimmer-slow" : "text-foreground"}`}>
                            {formatPrice(plan.price, plan.currency)}
                          </span>
                          <span className="text-muted-foreground font-medium">/{plan.interval === 'year' ? 'ano' : 'mês'}</span>
                        </div>
                      </div>

                      <ul className="mb-8 space-y-3 flex-1">
                        {config.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isHighlight ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-sm text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full gap-2 transition-all mt-auto h-12 text-base font-semibold ${
                          isHighlight
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                        onClick={() => handleStartCheckout(plan.id)}
                        disabled={!!startingCheckout}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Redirecionando...
                          </>
                        ) : (
                          <>
                            {config.cta}
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
              Pagamento 100% seguro processado pela Stripe. Cancele quando quiser.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
