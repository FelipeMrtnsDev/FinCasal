"use client"

import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useFinance } from "@/lib/finance-context"
import { savingsGoalService } from "@/services/financeService"
import { Calendar, PiggyBank, Target, TrendingUp, Wallet } from "lucide-react"
import { SavingsGoal } from "@/lib/types"
import { GoalDialog } from "./GoalDialog"
import { ProjectionStats } from "./ProjectionStats"
import { ProjectionChartCard } from "./ProjectionChartCard"
import { GoalsList } from "./GoalsList"
import { DepositDialog } from "./DepositDialog"
import { GoalFormState, ProjectionStat } from "./types"
import { buildProjectionData } from "./utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BudgetTabContent } from "@/components/orcamento/BudgetTabContent"

export function ProjecaoClient() {
  const { incomes, expenses, isLoaded } = useFinance()
  const queryClient = useQueryClient()
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("metas")
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [savingGoal, setSavingGoal] = useState(false)
  const [depositing, setDepositing] = useState(false)
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null)
  const [goalForm, setGoalForm] = useState<GoalFormState>({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  })

  const { data: savingsGoals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ["savings-goals"],
    queryFn: async () => {
      const data = await savingsGoalService.getAll()
      return (data || []).map((goal) => ({
        ...goal,
        targetAmount: Number(goal.targetAmount) || 0,
        currentAmount: Number(goal.currentAmount) || 0,
      }))
    },
  })

  const invalidateGoals = () => {
    queryClient.invalidateQueries({ queryKey: ["savings-goals"] })
  }

  const resetGoalForm = () => {
    setGoalForm({ name: "", targetAmount: "", currentAmount: "", deadline: "" })
  }

  const handleAddGoal = async () => {
    if (!goalForm.name || !goalForm.targetAmount || savingGoal) return
    const deadline = goalForm.deadline
      ? new Date(`${goalForm.deadline}T00:00:00.000Z`).toISOString()
      : undefined
    setSavingGoal(true)
    try {
      await savingsGoalService.create({
        name: goalForm.name,
        targetAmount: parseFloat(goalForm.targetAmount),
        currentAmount: parseFloat(goalForm.currentAmount || "0"),
        ...(deadline ? { deadline } : {}),
      })
      invalidateGoals()
      resetGoalForm()
      setGoalDialogOpen(false)
    } finally {
      setSavingGoal(false)
    }
  }

  const handleDeposit = async () => {
    if (!selectedGoalId || !depositAmount || depositing) return
    const goal = savingsGoals.find((g) => g.id === selectedGoalId)
    if (!goal) return
    setDepositing(true)
    try {
      await savingsGoalService.update(selectedGoalId, {
        currentAmount: goal.currentAmount + parseFloat(depositAmount),
      })
      invalidateGoals()
      setDepositAmount("")
      setDepositDialogOpen(false)
      setSelectedGoalId(null)
    } finally {
      setDepositing(false)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (deletingGoalId) return
    setDeletingGoalId(id)
    try {
      await savingsGoalService.delete(id)
      invalidateGoals()
    } finally {
      setDeletingGoalId(null)
    }
  }

  const totalMonthlyIncome = useMemo(
    () => incomes.filter((i) => i.recurring).reduce((a, i) => a + i.amount, 0),
    [incomes]
  )

  const totalMonthlyExpenses = useMemo(
    () => expenses.reduce((a, e) => a + e.amount, 0),
    [expenses]
  )

  const avgMonthlyExpenses = useMemo(
    () =>
      expenses.length > 0
        ? totalMonthlyExpenses / Math.max(1, new Set(expenses.map((e) => e.date.substring(0, 7))).size)
        : 0,
    [expenses, totalMonthlyExpenses]
  )

  const estimatedMonthlySavings = totalMonthlyIncome - avgMonthlyExpenses
  const projectionData = useMemo(
    () => buildProjectionData(savingsGoals, estimatedMonthlySavings),
    [savingsGoals, estimatedMonthlySavings]
  )
  const totalSaved = useMemo(
    () => savingsGoals.reduce((a, g) => a + g.currentAmount, 0),
    [savingsGoals]
  )
  const totalTarget = useMemo(
    () => savingsGoals.reduce((a, g) => a + g.targetAmount, 0),
    [savingsGoals]
  )

  const stats: ProjectionStat[] = [
    { label: "Total Guardado", value: totalSaved, icon: PiggyBank },
    { label: "Meta Total", value: totalTarget, icon: Target },
    { label: "Economia/Mes Est.", value: estimatedMonthlySavings, icon: TrendingUp },
    { label: "Metas Ativas", value: savingsGoals.length, icon: Calendar, isCurrency: false },
  ]

  const pageLoading = !isLoaded || loadingGoals

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Projecao & Metas</h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe quanto conseguem guardar</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-grid">
          <TabsTrigger value="metas" className="gap-2">
            <Target className="w-4 h-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="orcamentos" className="gap-2">
            <Wallet className="w-4 h-4" />
            Orcamentos
          </TabsTrigger>
        </TabsList>

        <BudgetTabContent active={activeTab === "orcamentos"} />

        <TabsContent value="metas" className="mt-6 flex flex-col gap-6">
          <div className="flex justify-end">
            <GoalDialog
              open={goalDialogOpen}
              onOpenChange={setGoalDialogOpen}
              goalForm={goalForm}
              onGoalFormChange={setGoalForm}
              onCreate={handleAddGoal}
              saving={savingGoal}
            />
          </div>

          <ProjectionStats stats={stats} estimatedMonthlySavings={estimatedMonthlySavings} loading={pageLoading} />

          <ProjectionChartCard projectionData={projectionData} totalTarget={totalTarget} />

          <GoalsList
            savingsGoals={savingsGoals}
            onOpenDeposit={(goalId) => {
              setSelectedGoalId(goalId)
              setDepositDialogOpen(true)
            }}
            onDeleteGoal={handleDeleteGoal}
            deletingGoalId={deletingGoalId}
          />
        </TabsContent>
      </Tabs>

      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        depositAmount={depositAmount}
        onDepositAmountChange={setDepositAmount}
        onDeposit={handleDeposit}
        saving={depositing}
      />
    </div>
  )
}
