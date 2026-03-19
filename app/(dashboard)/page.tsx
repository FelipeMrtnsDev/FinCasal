"use client"

import { useEffect, useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { summaryService, DashboardSummary, MonthlyEvolution, CategoryData, PaymentMethodData, PersonData } from "@/services/summaryService"
import { expenseService, incomeService } from "@/services/financeService"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { EvolutionChart } from "@/components/dashboard/EvolutionChart"
import { CategoryChart } from "@/components/dashboard/CategoryChart"
import { PaymentMethodChart } from "@/components/dashboard/PaymentMethodChart"
import { PersonChart } from "@/components/dashboard/PersonChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, PieChartIcon, Activity } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Expense, Income } from "@/lib/types"
import { getMonthOptionsFromStart } from "@/lib/month-options"

export default function DashboardPage() {
  const { currentMonth, setCurrentMonth, viewMode, startMonth } = useFinance()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary>({
    totalIncomes: 0,
    totalExpenses: 0,
    balance: 0,
    pixExpenses: 0,
    cardExpenses: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    byPerson: { eu: 0, parceiro: 0 },
  })
  const [evolution, setEvolution] = useState<MonthlyEvolution[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([])
  const [people, setPeople] = useState<PersonData[]>([])
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [recentIncomes, setRecentIncomes] = useState<Income[]>([])

  const getPaymentValue = (rows: PaymentMethodData[], match: RegExp): number => {
    return rows
      .filter((row) => match.test((row.name || "").toLowerCase()))
      .reduce((acc, row) => acc + (Number(row.value) || 0), 0)
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [summaryData, evolutionData, categoriesData, paymentMethodsData, peopleData, expensesData, incomesData] = await Promise.all([
          summaryService.getSummary(currentMonth, viewMode),
          summaryService.getMonthlyEvolution(currentMonth, startMonth, viewMode),
          summaryService.getByCategory(currentMonth, viewMode),
          summaryService.getByPaymentMethod(currentMonth, viewMode),
          summaryService.getByPerson(currentMonth, viewMode),
          expenseService.getAll({ month: currentMonth, limit: 5, view: viewMode }),
          incomeService.getAll({ month: currentMonth, limit: 5, view: viewMode })
        ])

        const allMonthExpenses = await expenseService.getAll({ month: currentMonth, view: viewMode })
        const pixFromExpenses = allMonthExpenses
          .filter((expense) => {
            const method = String(expense.paymentMethod || "").toLowerCase()
            return method === "pix"
          })
          .reduce((acc, expense) => acc + (Number(expense.amount) || 0), 0)
        const cardFromExpenses = allMonthExpenses
          .filter((expense) => {
            const method = String(expense.paymentMethod || "").toLowerCase()
            return method.includes("credit") || method.includes("card") || method.includes("cart")
          })
          .reduce((acc, expense) => acc + (Number(expense.amount) || 0), 0)

        const pixFallback = getPaymentValue(paymentMethodsData, /pix/)
        const cardFallback = getPaymentValue(paymentMethodsData, /cart|credit/)
        setSummary({
          ...summaryData,
          pixExpenses: summaryData.pixExpenses > 0 ? summaryData.pixExpenses : Math.max(pixFallback, pixFromExpenses),
          cardExpenses: summaryData.cardExpenses > 0 ? summaryData.cardExpenses : Math.max(cardFallback, cardFromExpenses),
        })
        setEvolution(evolutionData)
        setCategories(categoriesData)
        setPaymentMethods(paymentMethodsData)
        setPeople(peopleData)
        setRecentExpenses(expensesData)
        setRecentIncomes(incomesData)
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
        setError("Falha ao carregar dados do painel")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentMonth, startMonth, viewMode])

  const [currentYear, currentMonthNumber] = currentMonth.split("-").map(Number)
  const monthDate = new Date(currentYear, (currentMonthNumber || 1) - 1, 1)
  const monthName = format(monthDate, "MMMM 'de' yyyy", { locale: ptBR })
  const monthOptions = getMonthOptionsFromStart(startMonth)
  const emptyChartMessage = (
    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
      Nenhum dado encontrado para este mes
    </div>
  )
  const hasDetailsData = paymentMethods.length > 0 || summary.totalExpenses > 0

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
            {viewMode === "casal" ? "Painel do Casal" : "Painel Individual"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 capitalize">{monthName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={currentMonth} onValueChange={setCurrentMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value} className="capitalize">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <StatsCards summary={summary} loading={loading} />

      {loading ? (
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-56 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Tabs defaultValue="evolucao" className="w-full">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Graficos</CardTitle>
                  <CardDescription>Analise visual dos seus gastos e rendas</CardDescription>
                </div>
                <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                  <TabsTrigger value="evolucao" className="text-xs gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 hidden sm:block" />
                    Evolucao
                  </TabsTrigger>
                  <TabsTrigger value="categorias" className="text-xs gap-1.5">
                    <PieChartIcon className="w-3.5 h-3.5 hidden sm:block" />
                    Categorias
                  </TabsTrigger>
                  <TabsTrigger value="detalhes" className="text-xs gap-1.5">
                    <Activity className="w-3.5 h-3.5 hidden sm:block" />
                    Detalhes
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="evolucao" className="mt-0">
                <EvolutionChart data={evolution} />
              </TabsContent>

              <TabsContent value="categorias" className="mt-0">
                {categories.length === 0 ? emptyChartMessage : <CategoryChart data={categories} totalExpenses={summary?.totalExpenses || 0} />}
              </TabsContent>

              <TabsContent value="detalhes" className="mt-0">
                {hasDetailsData ? <PaymentMethodChart data={paymentMethods} summary={summary} /> : emptyChartMessage}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      )}

      {viewMode === "casal" && !loading && summary && (
        <PersonChart data={people} totalExpenses={summary.totalExpenses} />
      )}

      <RecentActivity expenses={recentExpenses} incomes={recentIncomes} categories={categories} />
    </div>
  )
}
