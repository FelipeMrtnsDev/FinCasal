"use client"

import React, { useState, useMemo } from "react"
import { useFinance } from "@/lib/finance-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Trash2,
  Target,
  TrendingUp,
  PiggyBank,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Wallet,
} from "lucide-react"
import { format, parseISO, differenceInMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import { PageSkeleton } from "@/components/skeleton-loader"
import { motion } from "framer-motion"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function getCurrentMonth() {
  return format(new Date(), "yyyy-MM")
}

export default function ProjecaoPage() {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    removeSavingsGoal,
    budgets,
    addBudget,
    removeBudget,
    incomes,
    expenses,
    categories,
    isLoaded,
  } = useFinance()

  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())

  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  })

  const [budgetForm, setBudgetForm] = useState({
    categoryId: "",
    limitAmount: "",
  })

  const resetGoalForm = () => setGoalForm({ name: "", targetAmount: "", currentAmount: "", deadline: "" })
  const resetBudgetForm = () => setBudgetForm({ categoryId: "", limitAmount: "" })

  const handleAddGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) return
    addSavingsGoal({
      name: goalForm.name,
      targetAmount: parseFloat(goalForm.targetAmount),
      currentAmount: parseFloat(goalForm.currentAmount || "0"),
      deadline: goalForm.deadline || "",
    })
    resetGoalForm()
    setGoalDialogOpen(false)
  }

  const handleAddBudget = () => {
    if (!budgetForm.categoryId || !budgetForm.limitAmount) return
    const cat = categories.find((c) => c.id === budgetForm.categoryId)
    if (!cat) return
    // remove existing budget for same category+month to avoid duplicates
    const existing = budgets.find((b) => b.categoryId === budgetForm.categoryId && b.month === selectedMonth)
    if (existing) removeBudget(existing.id)
    addBudget({
      categoryId: budgetForm.categoryId,
      categoryName: cat.name,
      limitAmount: parseFloat(budgetForm.limitAmount),
      month: selectedMonth,
    })
    resetBudgetForm()
    setBudgetDialogOpen(false)
  }

  const handleDeposit = () => {
    if (!selectedGoalId || !depositAmount) return
    const goal = savingsGoals.find((g) => g.id === selectedGoalId)
    if (!goal) return
    updateSavingsGoal(selectedGoalId, {
      currentAmount: goal.currentAmount + parseFloat(depositAmount),
    })
    setDepositAmount("")
    setDepositDialogOpen(false)
    setSelectedGoalId(null)
  }

  if (!isLoaded) return <PageSkeleton />

  // --- budget calculations ---
  const monthBudgets = budgets.filter((b) => b.month === selectedMonth)
  const monthExpenses = expenses.filter((e) => e.date?.startsWith(selectedMonth))

  const budgetStatus = monthBudgets.map((b) => {
    const spent = monthExpenses
      .filter((e) => e.category === b.categoryId)
      .reduce((acc, e) => acc + e.amount, 0)
    const percent = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0
    const isOver = spent > b.limitAmount
    const isNear = !isOver && percent >= 80
    return { ...b, spent, percent, isOver, isNear }
  })

  const totalBudget = monthBudgets.reduce((a, b) => a + b.limitAmount, 0)
  const totalSpentOnBudgets = budgetStatus.reduce((a, b) => a + b.spent, 0)
  const overBudgetCount = budgetStatus.filter((b) => b.isOver).length

  // --- savings/projection calculations ---
  const totalMonthlyIncome = incomes.filter((i) => i.recurring).reduce((a, i) => a + i.amount, 0)
  const months = new Set(expenses.map((e) => e.date?.substring(0, 7))).size
  const avgMonthlyExpenses = months > 0 ? expenses.reduce((a, e) => a + e.amount, 0) / months : 0
  const estimatedMonthlySavings = totalMonthlyIncome - avgMonthlyExpenses

  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() + i)
    const totalSaved = savingsGoals.reduce((a, g) => a + g.currentAmount, 0)
    return {
      month: format(month, "MMM yy", { locale: ptBR }),
      economizado: Math.max(0, totalSaved + estimatedMonthlySavings * (i + 1)),
      meta: savingsGoals.reduce((a, g) => a + g.targetAmount, 0),
    }
  })

  const totalSaved = savingsGoals.reduce((a, g) => a + g.currentAmount, 0)
  const totalTarget = savingsGoals.reduce((a, g) => a + g.targetAmount, 0)

  // month selector options (current + 5 next months)
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() + i)
    return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy", { locale: ptBR }) }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Projecao & Metas</h1>
          <p className="text-muted-foreground text-sm mt-1">Orcamentos por categoria e metas de economia</p>
        </div>
      </div>

      <Tabs defaultValue="orcamentos" className="w-full">
        <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-grid">
          <TabsTrigger value="orcamentos" className="gap-2">
            <Wallet className="w-4 h-4" />
            Orcamentos
          </TabsTrigger>
          <TabsTrigger value="metas" className="gap-2">
            <Target className="w-4 h-4" />
            Metas
          </TabsTrigger>
        </TabsList>

        {/* ---- ORCAMENTOS ---- */}
        <TabsContent value="orcamentos" className="mt-6 flex flex-col gap-6">
          {/* Header actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="capitalize">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:ml-auto">
                  <Plus className="w-4 h-4" />
                  Novo Orcamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Definir Orcamento</DialogTitle>
                  <DialogDescription>Defina o limite de gasto para uma categoria neste mes.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-2">
                    <Label>Categoria</Label>
                    <Select value={budgetForm.categoryId} onValueChange={(v) => setBudgetForm({ ...budgetForm, categoryId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Limite (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={budgetForm.limitAmount}
                      onChange={(e) => setBudgetForm({ ...budgetForm, limitAmount: e.target.value })}
                      placeholder="Ex: 500,00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setBudgetDialogOpen(false); resetBudgetForm() }}>Cancelar</Button>
                  <Button
                    onClick={handleAddBudget}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!budgetForm.categoryId || !budgetForm.limitAmount}
                  >
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Alert banner if any over budget */}
          {overBudgetCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive font-medium">
                {overBudgetCount === 1
                  ? "1 categoria estourou o orcamento este mes!"
                  : `${overBudgetCount} categorias estouraram o orcamento este mes!`}
              </p>
            </div>
          )}

          {/* Summary stats */}
          {monthBudgets.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Limite total", value: formatCurrency(totalBudget), icon: Wallet, color: "text-foreground" },
                { label: "Gasto", value: formatCurrency(totalSpentOnBudgets), icon: TrendingUp, color: totalSpentOnBudgets > totalBudget ? "text-destructive" : "text-foreground" },
                { label: "Disponivel", value: formatCurrency(Math.max(0, totalBudget - totalSpentOnBudgets)), icon: PiggyBank, color: "text-primary" },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <s.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{s.label}</span>
                        <span className={cn("text-sm sm:text-base font-bold font-mono", s.color)}>{s.value}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Budget list */}
          {monthBudgets.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Wallet className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum orcamento definido para este mes</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Clique em "Novo Orcamento" para comecar</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Orcamentos por Categoria</CardTitle>
                <CardDescription>
                  {format(new Date(selectedMonth + "-01"), "MMMM 'de' yyyy", { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-5">
                  {budgetStatus.map((b) => {
                    const cat = categories.find((c) => c.id === b.categoryId)
                    return (
                      <div key={b.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color ?? "#21C25E" }} />
                            <span className="text-sm font-medium text-foreground truncate">{b.categoryName}</span>
                            {b.isOver && (
                              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded shrink-0">
                                ESTOUROU
                              </span>
                            )}
                            {b.isNear && !b.isOver && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                                PERTO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn("text-xs font-mono font-semibold", b.isOver ? "text-destructive" : "text-foreground")}>
                              {formatCurrency(b.spent)}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">/ {formatCurrency(b.limitAmount)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeBudget(b.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, b.percent)}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full",
                              b.isOver ? "bg-destructive" : b.isNear ? "bg-amber-400" : "bg-primary"
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{b.percent.toFixed(0)}% utilizado</span>
                          {b.isOver ? (
                            <span className="text-destructive font-medium">
                              {formatCurrency(b.spent - b.limitAmount)} acima do limite
                            </span>
                          ) : (
                            <span className="text-primary font-medium">
                              {formatCurrency(b.limitAmount - b.spent)} disponivel
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ---- METAS ---- */}
        <TabsContent value="metas" className="mt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
              {[
                { label: "Total Guardado", value: formatCurrency(totalSaved), icon: PiggyBank },
                { label: "Meta Total", value: formatCurrency(totalTarget), icon: Target },
                { label: "Economia/Mes Est.", value: formatCurrency(estimatedMonthlySavings), icon: TrendingUp },
                { label: "Metas Ativas", value: String(savingsGoals.length), icon: Calendar },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <stat.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight">{stat.label}</span>
                        <span className={cn("text-sm sm:text-base font-bold font-mono text-foreground", stat.label.includes("Economia") && estimatedMonthlySavings < 0 && "text-destructive")}>
                          {stat.value}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Meta de Economia</DialogTitle>
                  <DialogDescription>Defina uma meta de economia para voces.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-2">
                    <Label>Nome da Meta</Label>
                    <Input
                      value={goalForm.name}
                      onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                      placeholder="Ex: Viagem, Reserva de emergencia"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label>Valor da Meta (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={goalForm.targetAmount}
                        onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                        placeholder="10.000"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Ja guardado (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={goalForm.currentAmount}
                        onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Prazo (opcional)</Label>
                    <Input
                      type="date"
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddGoal} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!goalForm.name || !goalForm.targetAmount}>
                    Criar Meta
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projection Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Projecao de Economia</CardTitle>
              <CardDescription>Estimativa para os proximos 12 meses baseada na renda recorrente e media de gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="colorEcon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#21C25E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#21C25E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Area type="monotone" dataKey="economizado" stroke="#21C25E" fill="url(#colorEcon)" strokeWidth={2} name="Economizado" />
                    {totalTarget > 0 && (
                      <Area type="monotone" dataKey="meta" stroke="#15803d" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Goals list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metas de Economia</CardTitle>
              <CardDescription>Acompanhe o progresso de cada meta</CardDescription>
            </CardHeader>
            <CardContent>
              {savingsGoals.length === 0 ? (
                <div className="py-12 text-center">
                  <Target className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma meta criada ainda.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {savingsGoals.map((goal) => {
                    const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0
                    const remaining = goal.targetAmount - goal.currentAmount
                    const monthsLeft = goal.deadline ? differenceInMonths(parseISO(goal.deadline), new Date()) : null
                    const monthlyNeeded = monthsLeft && monthsLeft > 0 ? remaining / monthsLeft : null
                    const isComplete = progress >= 100

                    return (
                      <div key={goal.id} className="border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {isComplete ? (
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            ) : (
                              <Target className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground truncate text-sm">{goal.name}</h3>
                              {goal.deadline && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Prazo: {(() => { try { return format(parseISO(goal.deadline), "dd/MM/yyyy") } catch { return goal.deadline } })()}
                                  {monthsLeft !== null && monthsLeft > 0 && ` (${monthsLeft} meses)`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary h-8 px-2 text-xs"
                              onClick={() => { setSelectedGoalId(goal.id); setDepositDialogOpen(true) }}
                            >
                              + Depositar
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeSavingsGoal(goal.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-mono text-primary font-medium">{formatCurrency(goal.currentAmount)}</span>
                            <span className="font-mono text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={cn("h-full rounded-full", isComplete ? "bg-primary" : "bg-primary/80")}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-1">
                            <span>{progress.toFixed(1)}% concluido</span>
                            {monthlyNeeded && monthlyNeeded > 0 && <span>Guardar {formatCurrency(monthlyNeeded)}/mes</span>}
                            {remaining > 0 && <span>Faltam {formatCurrency(remaining)}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Depositar na Meta</DialogTitle>
            <DialogDescription>Adicione um valor guardado nesta meta.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleDeposit} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!depositAmount}>
              Depositar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
