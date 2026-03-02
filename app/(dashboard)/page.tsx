"use client"

import { useFinance } from "@/lib/finance-context"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
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

  // Category data for pie chart
  const categoryData = categories
    .map((cat) => ({
      name: cat.name,
      value: currentMonthExpenses
        .filter((e) => e.category === cat.id)
        .reduce((a, e) => a + e.amount, 0),
      color: cat.color,
    }))
    .filter((c) => c.value > 0)

  // Last 6 months data for bar chart
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Evolution */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolucao Mensal</CardTitle>
              <CardDescription>Renda vs Despesas nos ultimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-foreground)',
                      }}
                    />
                    <Bar dataKey="renda" fill="#21C25E" radius={[4, 4, 0, 0]} name="Renda" />
                    <Bar dataKey="despesas" fill="#15803d" radius={[4, 4, 0, 0]} name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gastos por Categoria</CardTitle>
              <CardDescription>Distribuicao deste mes</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="h-52 w-52 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            color: 'var(--color-foreground)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {categoryData.slice(0, 5).map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs text-foreground truncate">{cat.name}</span>
                        <span className="text-xs font-mono text-muted-foreground ml-auto shrink-0">
                          {formatCurrency(cat.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                  Nenhuma despesa registrada este mes
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Fixed vs Variable */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fixos vs Variaveis</CardTitle>
              <CardDescription>Comparacao de custos deste mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Custos Fixos</span>
                    <span className="text-sm font-mono font-medium text-foreground">{formatCurrency(fixedExpenses)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: totalExpenses > 0 ? `${(fixedExpenses / totalExpenses) * 100}%` : "0%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Custos Variaveis</span>
                    <span className="text-sm font-mono font-medium text-foreground">{formatCurrency(variableExpenses)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: totalExpenses > 0 ? `${(variableExpenses / totalExpenses) * 100}%` : "0%" }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      className="h-full rounded-full bg-chart-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Person Split */}
        {viewMode === "casal" && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Divisao por Pessoa</CardTitle>
                <CardDescription>Quanto cada um gastou este mes</CardDescription>
              </CardHeader>
              <CardContent>
                {personData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="h-52 w-52 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={personData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {personData.map((entry, index) => (
                              <Cell key={`cell-person-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: 'var(--color-card)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '8px',
                              color: 'var(--color-foreground)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-3 flex-1 min-w-0">
                      {personData.map((p) => (
                        <div key={p.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="text-sm text-foreground">{p.name}</span>
                          <span className="text-sm font-mono text-muted-foreground ml-auto">{formatCurrency(p.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                    Nenhuma despesa registrada este mes
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

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
              <div className="flex flex-col gap-2">
                {[...expenses, ...incomes]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 8)
                  .map((item) => {
                    const isExpense = "paymentMethod" in item
                    const cat = isExpense ? categories.find((c) => c.id === (item as typeof expenses[0]).category) : null
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
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
