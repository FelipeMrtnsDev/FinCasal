"use client"

import { useEffect, useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { summaryService, DashboardSummary, MonthlyEvolution, CategoryData, PaymentMethodData, PersonData, DailySpending } from "@/services/summaryService"
import { expenseService, incomeService } from "@/services/financeService"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { EvolutionChart } from "@/components/dashboard/EvolutionChart"
import { CategoryChart } from "@/components/dashboard/CategoryChart"
import { PaymentMethodChart } from "@/components/dashboard/PaymentMethodChart"
import { PersonChart } from "@/components/dashboard/PersonChart"
import { DailyChart } from "@/components/dashboard/DailyChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, BarChart3, PieChartIcon, LineChartIcon, Activity, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Expense, Income } from "@/lib/types"

export default function DashboardPage() {
  const { currentMonth, setCurrentMonth, viewMode } = useFinance()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [evolution, setEvolution] = useState<MonthlyEvolution[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([])
  const [people, setPeople] = useState<PersonData[]>([])
  const [daily, setDaily] = useState<DailySpending[]>([])
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [recentIncomes, setRecentIncomes] = useState<Income[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [summaryData, evolutionData, categoriesData, paymentMethodsData, peopleData, dailyData, expensesData, incomesData] = await Promise.all([
          summaryService.getSummary(currentMonth),
          summaryService.getMonthlyEvolution(),
          summaryService.getByCategory(currentMonth),
          summaryService.getByPaymentMethod(currentMonth),
          summaryService.getByPerson(currentMonth),
          summaryService.getDailySpending(currentMonth),
          expenseService.getAll({ month: currentMonth, limit: 5 }),
          incomeService.getAll({ month: currentMonth, limit: 5 })
        ])

        setSummary(summaryData)
        setEvolution(evolutionData)
        setCategories(categoriesData)
        setPaymentMethods(paymentMethodsData)
        setPeople(peopleData)
        setDaily(dailyData)
        setRecentExpenses(expensesData)
        setRecentIncomes(incomesData)
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentMonth])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  const monthDate = new Date(currentMonth + "-01")
  const monthName = format(monthDate, "MMMM 'de' yyyy", { locale: ptBR })

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
              <SelectItem value="2026-01">Janeiro 2026</SelectItem>
              <SelectItem value="2026-02">Fevereiro 2026</SelectItem>
              <SelectItem value="2026-03">Março 2026</SelectItem>
              <SelectItem value="2026-04">Abril 2026</SelectItem>
              <SelectItem value="2026-05">Maio 2026</SelectItem>
              <SelectItem value="2026-06">Junho 2026</SelectItem>
              <SelectItem value="2026-07">Julho 2026</SelectItem>
              <SelectItem value="2026-08">Agosto 2026</SelectItem>
              <SelectItem value="2026-09">Setembro 2026</SelectItem>
              <SelectItem value="2026-10">Outubro 2026</SelectItem>
              <SelectItem value="2026-11">Novembro 2026</SelectItem>
              <SelectItem value="2026-12">Dezembro 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {summary && <StatsCards summary={summary} />}

      <Card>
        <Tabs defaultValue="evolucao" className="w-full">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base">Graficos</CardTitle>
                <CardDescription>Analise visual dos seus gastos e rendas</CardDescription>
              </div>
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="evolucao" className="text-xs gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 hidden sm:block" />
                  Evolucao
                </TabsTrigger>
                <TabsTrigger value="categorias" className="text-xs gap-1.5">
                  <PieChartIcon className="w-3.5 h-3.5 hidden sm:block" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="diario" className="text-xs gap-1.5">
                  <LineChartIcon className="w-3.5 h-3.5 hidden sm:block" />
                  Diario
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
              <CategoryChart data={categories} totalExpenses={summary?.totalExpenses || 0} />
            </TabsContent>

            <TabsContent value="diario" className="mt-0">
              <DailyChart data={daily} />
            </TabsContent>

            <TabsContent value="detalhes" className="mt-0">
              {summary && <PaymentMethodChart data={paymentMethods} summary={summary} />}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {viewMode === "casal" && summary && (
        <PersonChart data={people} totalExpenses={summary.totalExpenses} />
      )}

      <RecentActivity expenses={recentExpenses} incomes={recentIncomes} categories={categories} />
    </div>
  )
}
