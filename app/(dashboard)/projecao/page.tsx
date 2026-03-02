"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Trash2, Target, TrendingUp, PiggyBank, Calendar } from "lucide-react"
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

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function ProjecaoPage() {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    removeSavingsGoal,
    incomes,
    expenses,
  } = useFinance()

  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState("")

  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  })

  const resetGoalForm = () => {
    setGoalForm({ name: "", targetAmount: "", currentAmount: "", deadline: "" })
  }

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

  // Calculate monthly balance for projection
  const totalMonthlyIncome = incomes
    .filter((i) => i.recurring)
    .reduce((a, i) => a + i.amount, 0)
  const totalMonthlyExpenses = expenses.reduce((a, e) => a + e.amount, 0)
  const avgMonthlyExpenses = expenses.length > 0 ? totalMonthlyExpenses / Math.max(1, new Set(expenses.map((e) => e.date.substring(0, 7))).size) : 0
  const estimatedMonthlySavings = totalMonthlyIncome - avgMonthlyExpenses

  // Projection data for next 12 months
  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() + i)
    const totalSaved = savingsGoals.reduce((a, g) => a + g.currentAmount, 0)
    return {
      month: format(month, "MMM yy", { locale: ptBR }),
      economizado: totalSaved + estimatedMonthlySavings * (i + 1),
      meta: savingsGoals.reduce((a, g) => a + g.targetAmount, 0),
    }
  })

  const totalSaved = savingsGoals.reduce((a, g) => a + g.currentAmount, 0)
  const totalTarget = savingsGoals.reduce((a, g) => a + g.targetAmount, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Projecao & Metas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe quanto conseguem guardar
          </p>
        </div>
        <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Meta</span>
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
              <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddGoal}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!goalForm.name || !goalForm.targetAmount}
              >
                Criar Meta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Guardado", value: totalSaved, icon: PiggyBank, color: "text-primary" },
          { label: "Meta Total", value: totalTarget, icon: Target, color: "text-foreground" },
          { label: "Economia Mensal Est.", value: estimatedMonthlySavings, icon: TrendingUp, color: estimatedMonthlySavings >= 0 ? "text-primary" : "text-destructive" },
          { label: "Metas Ativas", value: savingsGoals.length, icon: Calendar, color: "text-foreground", isCurrency: false },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    <p className={cn("text-lg font-bold font-mono mt-1", stat.color)}>
                      {"isCurrency" in stat && stat.isCurrency === false
                        ? stat.value
                        : formatCurrency(stat.value as number)}
                    </p>
                  </div>
                  <div className="rounded-lg p-2 bg-primary/10">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Projection Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projecao de Economia</CardTitle>
            <CardDescription>
              Estimativa para os proximos 12 meses baseada na sua renda recorrente e media de gastos
            </CardDescription>
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
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
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
                  <Area
                    type="monotone"
                    dataKey="economizado"
                    stroke="#21C25E"
                    fill="url(#colorEcon)"
                    strokeWidth={2}
                    name="Economizado"
                  />
                  {totalTarget > 0 && (
                    <Area
                      type="monotone"
                      dataKey="meta"
                      stroke="#15803d"
                      fill="none"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Meta"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metas de Economia</CardTitle>
          <CardDescription>Acompanhe o progresso de cada meta</CardDescription>
        </CardHeader>
        <CardContent>
          {savingsGoals.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhuma meta criada. Crie sua primeira meta de economia!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {savingsGoals.map((goal) => {
                  const progress = goal.targetAmount > 0
                    ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
                    : 0
                  const remaining = goal.targetAmount - goal.currentAmount
                  const monthsLeft = goal.deadline
                    ? differenceInMonths(parseISO(goal.deadline), new Date())
                    : null
                  const monthlyNeeded = monthsLeft && monthsLeft > 0
                    ? remaining / monthsLeft
                    : null

                  return (
                    <motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{goal.name}</h3>
                          {goal.deadline && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Prazo: {(() => { try { return format(parseISO(goal.deadline), "dd/MM/yyyy") } catch { return goal.deadline } })()}
                              {monthsLeft !== null && monthsLeft > 0 && ` (${monthsLeft} meses)`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary h-8 px-2"
                            onClick={() => {
                              setSelectedGoalId(goal.id)
                              setDepositDialogOpen(true)
                            }}
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
                          <span className="font-mono text-primary font-medium">
                            {formatCurrency(goal.currentAmount)}
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full",
                              progress >= 100 ? "bg-primary" : "bg-primary/80"
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{progress.toFixed(1)}% concluido</span>
                          {monthlyNeeded && monthlyNeeded > 0 && (
                            <span>Precisa guardar {formatCurrency(monthlyNeeded)}/mes</span>
                          )}
                          {remaining > 0 && (
                            <span>Faltam {formatCurrency(remaining)}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

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
            <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeposit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!depositAmount}
            >
              Depositar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
