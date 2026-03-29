"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useFinance } from "@/lib/finance-context"
import { summaryService, DashboardSummary, CategoryData, PaymentMethodData, PersonData } from "@/services/summaryService"
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

function ChartSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

const summaryZero: DashboardSummary = {
  totalIncomes: 0, totalExpenses: 0, balance: 0,
  pixExpenses: 0, cardExpenses: 0, fixedExpenses: 0, variableExpenses: 0,
  byPerson: { eu: 0, parceiro: 0 },
}

export default function DashboardPage() {
  const { currentMonth, setCurrentMonth, viewMode, startMonth, viewModeReady } = useFinance()
  const [activeTab, setActiveTab] = useState("evolucao")

  // Main dashboard data — single aggregated call
  const { data: initData, isLoading: loading } = useQuery({
    queryKey: ["dashboard-init", currentMonth, viewMode],
    queryFn: () => summaryService.getDashboardInit(currentMonth, viewMode),
    enabled: viewModeReady,
  })

  const summary = initData?.summary ?? summaryZero
  const recentExpenses = (initData?.recentExpenses ?? []) as unknown as Expense[]
  const recentIncomes = (initData?.recentIncomes ?? []) as unknown as Income[]

  // Evolution data — independent of month filter
  const { data: evolution = [] } = useQuery({
    queryKey: ["evolution", viewMode],
    queryFn: () => summaryService.getAllMonthlyEvolution(viewMode),
    enabled: viewModeReady,
  })

  // Lazy: Categories tab — only fetched when selected
  const { data: categories = [], isLoading: categoriesLoading, isFetched: categoriesLoaded } = useQuery({
    queryKey: ["categories-summary", currentMonth, viewMode],
    queryFn: () => summaryService.getByCategory(currentMonth, viewMode),
    enabled: viewModeReady && activeTab === "categorias",
  })

  // Lazy: Details tab — only fetched when selected
  const { data: detailsData, isLoading: detailsLoading, isFetched: detailsLoaded } = useQuery({
    queryKey: ["details", currentMonth, viewMode],
    queryFn: async () => {
      const [paymentData, peopleData] = await Promise.all([
        summaryService.getByPaymentMethod(currentMonth, viewMode),
        summaryService.getByPerson(currentMonth, viewMode),
      ])
      return { paymentMethods: paymentData, people: peopleData }
    },
    enabled: viewModeReady && activeTab === "detalhes",
  })

  const paymentMethods = detailsData?.paymentMethods ?? []
  const people = detailsData?.people ?? []

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                {categoriesLoading ? (
                  <ChartSkeleton />
                ) : categories.length === 0 && categoriesLoaded ? (
                  emptyChartMessage
                ) : categoriesLoaded ? (
                  <CategoryChart data={categories} totalExpenses={summary?.totalExpenses || 0} />
                ) : (
                  <ChartSkeleton />
                )}
              </TabsContent>

              <TabsContent value="detalhes" className="mt-0">
                {detailsLoading ? (
                  <ChartSkeleton />
                ) : detailsLoaded ? (
                  hasDetailsData ? (
                    <PaymentMethodChart data={paymentMethods} summary={summary} />
                  ) : (
                    emptyChartMessage
                  )
                ) : (
                  <ChartSkeleton />
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      )}

      {viewMode === "casal" && !loading && detailsLoaded && (
        <PersonChart data={people} totalExpenses={summary.totalExpenses} />
      )}

      <RecentActivity loading={loading} expenses={recentExpenses} incomes={recentIncomes} categories={categories} />
    </div>
  )
}
