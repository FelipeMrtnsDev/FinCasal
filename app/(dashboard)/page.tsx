"use client"

import { useFinance } from "@/lib/finance-context"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  Activity,
} from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const CHART_COLORS = ["#21C25E", "#15803d", "#4ade80", "#166534", "#86efac", "#0d9488", "#bbf7d0", "#059669", "#10b981"]

function CustomTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      {label && <p className="text-xs font-medium text-foreground mb-2">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { expenses, incomes, categories, viewMode, personNames, isLoaded } = useFinance()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const currentMonthExpenses = expenses.filter((e) => {
    try {
      const d = parseISO(e.date)
      return isWithinInterval(d, { start: monthStart, end: monthEnd })
    } catch {
      return false
    }
  })

  const currentMonthIncomes = incomes.filter((i) => {
    try {
      const d = parseISO(i.date)
      return isWithinInterval(d, { start: monthStart, end: monthEnd })
    } catch {
      return false
    }
  })

  const totalExpenses = currentMonthExpenses.reduce((a, e) => a + e.amount, 0)
  const totalIncomes = currentMonthIncomes.reduce((a, i) => a + i.amount, 0)
  const balance = totalIncomes - totalExpenses

  const pixExpenses = currentMonthExpenses
    .filter((e) => e.paymentMethod === "pix")
    .reduce((a, e) => a + e.amount, 0)
  const cardExpenses = currentMonthExpenses
    .filter((e) => e.paymentMethod === "cartao")
    .reduce((a, e) => a + e.amount, 0)
  const fixedExpenses = currentMonthExpenses
    .filter((e) => e.type === "fixo")
    .reduce((a, e) => a + e.amount, 0)
  const variableExpenses = currentMonthExpenses
    .filter((e) => e.type === "variavel")
    .reduce((a, e) => a + e.amount, 0)

  // Category data
  const categoryData = categories
    .map((cat) => ({
      name: cat.name,
      value: currentMonthExpenses
        .filter((e) => e.category === cat.id)
        .reduce((a, e) => a + e.amount, 0),
      color: cat.color,
    }))
    .filter((c) => c.value > 0)

  // Last 6 months data
  const monthsData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const mStart = startOfMonth(month)
    const mEnd = endOfMonth(month)

    const monthExp = expenses
      .filter((e) => {
        try {
          return isWithinInterval(parseISO(e.date), { start: mStart, end: mEnd })
        } catch {
          return false
        }
      })
      .reduce((a, e) => a + e.amount, 0)

    const monthInc = incomes
      .filter((i) => {
        try {
          return isWithinInterval(parseISO(i.date), { start: mStart, end: mEnd })
        } catch {
          return false
        }
      })
      .reduce((a, i) => a + i.amount, 0)

    return {
      month: format(month, "MMM", { locale: ptBR }),
      despesas: monthExp,
      renda: monthInc,
      saldo: monthInc - monthExp,
    }
  })

  // Person split data
  const euExpenses = currentMonthExpenses
    .filter((e) => e.person === "eu")
    .reduce((a, e) => a + e.amount, 0)
  const parceiroExpenses = currentMonthExpenses
    .filter((e) => e.person === "parceiro")
    .reduce((a, e) => a + e.amount, 0)

  const personData = [
    { name: personNames.eu, value: euExpenses, color: "#21C25E" },
    { name: personNames.parceiro, value: parceiroExpenses, color: "#15803d" },
  ].filter((p) => p.value > 0)

  // Payment method data
  const paymentMethodData = [
    { name: "Pix", value: pixExpenses, color: "#21C25E" },
    { name: "Cartao", value: cardExpenses, color: "#15803d" },
    {
      name: "Dinheiro",
      value: currentMonthExpenses.filter((e) => e.paymentMethod === "dinheiro").reduce((a, e) => a + e.amount, 0),
      color: "#4ade80",
    },
    {
      name: "Transferencia",
      value: currentMonthExpenses.filter((e) => e.paymentMethod === "transferencia").reduce((a, e) => a + e.amount, 0),
      color: "#166534",
    },
    {
      name: "Outro",
      value: currentMonthExpenses.filter((e) => e.paymentMethod === "outro").reduce((a, e) => a + e.amount, 0),
      color: "#86efac",
    },
  ].filter((p) => p.value > 0)

  // Daily spending data
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: now > monthEnd ? monthEnd : now })
  const dailySpending = daysInMonth.map((day) => {
    const dayTotal = currentMonthExpenses
      .filter((e) => {
        try {
          return isSameDay(parseISO(e.date), day)
        } catch {
          return false
        }
      })
      .reduce((a, e) => a + e.amount, 0)
    return {
      dia: format(day, "dd"),
      valor: dayTotal,
    }
  })

  // Radar chart data (categories comparison)
  const radarData = categories
    .map((cat) => {
      const euVal = currentMonthExpenses
        .filter((e) => e.category === cat.id && e.person === "eu")
        .reduce((a, e) => a + e.amount, 0)
      const parceiroVal = currentMonthExpenses
        .filter((e) => e.category === cat.id && e.person === "parceiro")
        .reduce((a, e) => a + e.amount, 0)
      return {
        category: cat.name,
        [personNames.eu]: euVal,
        [personNames.parceiro]: parceiroVal,
      }
    })
    .filter((d) => d[personNames.eu] > 0 || d[personNames.parceiro] > 0)

  // Radial bar for fixed vs variable
  const fixedVarRadial = [
    { name: "Variaveis", value: variableExpenses, fill: "#4ade80" },
    { name: "Fixos", value: fixedExpenses, fill: "#21C25E" },
  ]

  const monthName = format(now, "MMMM 'de' yyyy", { locale: ptBR })

  const stats = [
    {
      label: "Renda Total",
      value: totalIncomes,
      icon: TrendingUp,
      trend: "up" as const,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Despesas Totais",
      value: totalExpenses,
      icon: TrendingDown,
      trend: "down" as const,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Saldo",
      value: balance,
      icon: Wallet,
      trend: balance >= 0 ? ("up" as const) : ("down" as const),
      color: balance >= 0 ? "text-primary" : "text-destructive",
      bg: balance >= 0 ? "bg-primary/10" : "bg-destructive/10",
    },
    {
      label: "Pix",
      value: pixExpenses,
      icon: Smartphone,
      trend: "neutral" as const,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      label: "Cartao",
      value: cardExpenses,
      icon: CreditCard,
      trend: "neutral" as const,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      label: "Custos Fixos",
      value: fixedExpenses,
      icon: PiggyBank,
      trend: "neutral" as const,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ]

  const emptyChartMessage = (
    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
      Nenhuma despesa registrada este mes
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
          {viewMode === "casal" ? "Painel do Casal" : "Painel Individual"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{monthName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                    <span className="text-lg md:text-xl font-bold text-foreground font-mono">
                      {formatCurrency(stat.value)}
                    </span>
                  </div>
                  <div className={cn("rounded-lg p-2", stat.bg)}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                </div>
                {stat.trend !== "neutral" && (
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3 text-primary" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-destructive" />
                    )}
                    <span className={cn("text-xs font-medium", stat.trend === "up" ? "text-primary" : "text-destructive")}>
                      Este mes
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section with Tabs */}
      <motion.div variants={itemVariants}>
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
              {/* Tab 1: Evolucao Mensal */}
              <TabsContent value="evolucao" className="mt-0">
                <div className="flex flex-col gap-6">
                  {/* Bar chart: Renda vs Despesas */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Renda vs Despesas (6 meses)</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthsData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="month" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                          <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                          <Tooltip content={<CustomTooltipContent />} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '12px', color: 'var(--color-muted-foreground)' }}
                          />
                          <Bar dataKey="renda" fill="#21C25E" radius={[4, 4, 0, 0]} name="Renda" />
                          <Bar dataKey="despesas" fill="#15803d" radius={[4, 4, 0, 0]} name="Despesas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* Area chart: Saldo ao longo dos meses */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Saldo mensal</p>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthsData}>
                          <defs>
                            <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#21C25E" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#21C25E" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="month" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                          <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                          <Tooltip content={<CustomTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="saldo"
                            stroke="#21C25E"
                            fill="url(#saldoGrad)"
                            strokeWidth={2}
                            name="Saldo"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Categorias */}
              <TabsContent value="categorias" className="mt-0">
                {categoryData.length === 0 ? (
                  emptyChartMessage
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Donut chart */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Distribuicao por categoria</p>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-56 w-56 shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltipContent />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2.5 flex-1 min-w-0 w-full">
                          {categoryData.map((cat) => {
                            const percent = totalExpenses > 0 ? ((cat.value / totalExpenses) * 100).toFixed(1) : "0"
                            return (
                              <div key={cat.name} className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm text-foreground truncate flex-1">{cat.name}</span>
                                <span className="text-xs text-muted-foreground font-mono">{percent}%</span>
                                <span className="text-sm font-mono text-foreground shrink-0">
                                  {formatCurrency(cat.value)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Horizontal bars */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Ranking de gastos</p>
                      <div className="flex flex-col gap-3">
                        {categoryData
                          .sort((a, b) => b.value - a.value)
                          .map((cat, i) => {
                            const maxValue = categoryData[0]?.value || 1
                            return (
                              <div key={cat.name} className="flex items-center gap-3">
                                <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}.</span>
                                <span className="text-sm text-foreground w-28 truncate">{cat.name}</span>
                                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(cat.value / maxValue) * 100}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                </div>
                                <span className="text-sm font-mono text-foreground w-24 text-right shrink-0">
                                  {formatCurrency(cat.value)}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Gastos Diarios */}
              <TabsContent value="diario" className="mt-0">
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Gastos por dia do mes</p>
                    {dailySpending.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailySpending}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="dia" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} interval="preserveStartEnd" />
                            <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey="valor"
                              stroke="#21C25E"
                              strokeWidth={2}
                              dot={{ fill: '#21C25E', r: 3, strokeWidth: 0 }}
                              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                              name="Gasto"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      emptyChartMessage
                    )}
                  </div>

                  {/* Acumulado no mes */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Gasto acumulado no mes</p>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={dailySpending.reduce((acc, day, i) => {
                            const prev = i > 0 ? acc[i - 1].acumulado : 0
                            acc.push({ dia: day.dia, acumulado: prev + day.valor })
                            return acc
                          }, [] as { dia: string; acumulado: number }[])}
                        >
                          <defs>
                            <linearGradient id="acumGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#21C25E" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#21C25E" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="dia" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} interval="preserveStartEnd" />
                          <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                          <Tooltip content={<CustomTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="acumulado"
                            stroke="#21C25E"
                            fill="url(#acumGrad)"
                            strokeWidth={2}
                            name="Acumulado"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Detalhes */}
              <TabsContent value="detalhes" className="mt-0">
                <div className="flex flex-col gap-6">
                  {/* Payment method breakdown */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Por metodo de pagamento</p>
                    {paymentMethodData.length > 0 ? (
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-48 w-48 shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentMethodData}
                                cx="50%"
                                cy="50%"
                                outerRadius={75}
                                paddingAngle={2}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                              >
                                {paymentMethodData.map((entry, index) => (
                                  <Cell key={`cell-pm-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltipContent />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
                          {paymentMethodData.map((pm) => (
                            <div key={pm.name} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pm.color }} />
                              <span className="text-sm text-foreground flex-1">{pm.name}</span>
                              <span className="text-sm font-mono text-foreground shrink-0">{formatCurrency(pm.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      emptyChartMessage
                    )}
                  </div>

                  {/* Fixed vs Variable radial */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Fixos vs Variaveis</p>
                    {totalExpenses > 0 ? (
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-48 w-48 shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                              innerRadius="40%"
                              outerRadius="100%"
                              data={fixedVarRadial}
                              startAngle={180}
                              endAngle={0}
                              cx="50%"
                              cy="80%"
                            >
                              <RadialBar
                                dataKey="value"
                                cornerRadius={6}
                                animationDuration={800}
                              />
                              <Tooltip content={<CustomTooltipContent />} />
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-4 flex-1">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-sm text-foreground">Custos Fixos</span>
                              </div>
                              <span className="text-sm font-mono font-medium text-foreground">{formatCurrency(fixedExpenses)}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: totalExpenses > 0 ? `${(fixedExpenses / totalExpenses) * 100}%` : "0%" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full bg-primary"
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {totalExpenses > 0 ? ((fixedExpenses / totalExpenses) * 100).toFixed(1) : "0"}% do total
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#4ade80" }} />
                                <span className="text-sm text-foreground">Custos Variaveis</span>
                              </div>
                              <span className="text-sm font-mono font-medium text-foreground">{formatCurrency(variableExpenses)}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: totalExpenses > 0 ? `${(variableExpenses / totalExpenses) * 100}%` : "0%" }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: "#4ade80" }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {totalExpenses > 0 ? ((variableExpenses / totalExpenses) * 100).toFixed(1) : "0"}% do total
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      emptyChartMessage
                    )}
                  </div>

                  {/* Radar chart - per person per category (only in couple mode) */}
                  {viewMode === "casal" && radarData.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">
                        Comparacao por categoria ({personNames.eu} vs {personNames.parceiro})
                      </p>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid className="stroke-border" />
                            <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} />
                            <PolarRadiusAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }} />
                            <Radar
                              name={personNames.eu}
                              dataKey={personNames.eu}
                              stroke="#21C25E"
                              fill="#21C25E"
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                            <Radar
                              name={personNames.parceiro}
                              dataKey={personNames.parceiro}
                              stroke="#15803d"
                              fill="#15803d"
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                            <Tooltip content={<CustomTooltipContent />} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>

      {/* Person Split (only in couple mode) */}
      {viewMode === "casal" && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Divisao por Pessoa</CardTitle>
              <CardDescription>Quanto cada um gastou este mes</CardDescription>
            </CardHeader>
            <CardContent>
              {personData.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-48 w-48 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={personData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {personData.map((entry, index) => (
                            <Cell key={`cell-person-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-4 flex-1 min-w-0 w-full">
                    {personData.map((p) => {
                      const percent = totalExpenses > 0 ? ((p.value / totalExpenses) * 100).toFixed(1) : "0"
                      return (
                        <div key={p.name} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                              <span className="text-sm font-medium text-foreground">{p.name}</span>
                            </div>
                            <span className="text-sm font-mono font-medium text-foreground">{formatCurrency(p.value)}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{percent}% do total</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Nenhuma despesa registrada este mes
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade Recente</CardTitle>
            <CardDescription>Ultimas transacoes</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 && incomes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Nenhuma transacao registrada. Comece adicionando suas despesas e renda.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {[...expenses, ...incomes]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((item) => {
                    const isExpense = "paymentMethod" in item
                    const cat = isExpense ? categories.find((c) => c.id === (item as typeof expenses[0]).category) : null
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          isExpense ? "bg-destructive/10" : "bg-primary/10"
                        )}>
                          {isExpense ? (
                            <ArrowDownRight className="w-4 h-4 text-destructive" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground truncate">{item.description}</span>
                          <span className="text-xs text-muted-foreground">
                            {cat?.name || "Renda"} {" - "}
                            {(() => { try { return format(parseISO(item.date), "dd/MM/yyyy") } catch { return item.date } })()}
                          </span>
                        </div>
                        <span className={cn(
                          "text-sm font-mono font-medium shrink-0",
                          isExpense ? "text-destructive" : "text-primary"
                        )}>
                          {isExpense ? "-" : "+"}{formatCurrency(item.amount)}
                        </span>
                      </motion.div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
