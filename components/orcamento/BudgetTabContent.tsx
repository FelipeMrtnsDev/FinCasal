"use client"

import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { AlertTriangle } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { budgetService, categoryService } from "@/services/financeService"
import { Category } from "@/lib/types"
import { useFinance } from "@/lib/finance-context"
import { BudgetDialog } from "./BudgetDialog"
import { BudgetListCard } from "./BudgetListCard"
import { BudgetSummaryStats } from "./BudgetSummaryStats"
import { Budget } from "./types"
import { getBudgetStatus, getMonthOptionsFromStart } from "./utils"

export function BudgetTabContent({ active = true }: { active?: boolean }) {
  const { startMonth } = useFinance()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [budgetForm, setBudgetForm] = useState({ categoryId: "", limitAmount: "" })
  const monthOptions = useMemo(() => getMonthOptionsFromStart(startMonth), [startMonth])

  // Categories — only load when tab is active
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["budget-categories"],
    queryFn: async () => {
      const data = await categoryService.getAll("EXPENSE")
      return (data || []).map((c) => ({
        ...c,
        color: c.color || "#21C25E",
      }))
    },
    enabled: active,
    staleTime: 60_000,
  })

  // Month budgets + status — only load when tab is active
  const { data: monthData, isLoading: loading } = useQuery({
    queryKey: ["budgets", selectedMonth],
    queryFn: async () => {
      const [budgetsData, statusData] = await Promise.all([
        budgetService.getAll(selectedMonth),
        budgetService.getStatus(selectedMonth),
      ])
      const normalizedBudgets: Budget[] = budgetsData.map((b) => ({
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.categoryName,
        limitAmount: Number(b.limitAmount) || 0,
        month: b.month,
      }))
      return {
        budgets: normalizedBudgets,
        status: getBudgetStatus(statusData, selectedMonth),
      }
    },
    enabled: active,
  })

  const monthBudgets = monthData?.budgets ?? []
  const budgetStatus = monthData?.status ?? []

  const invalidateBudgets = () => {
    queryClient.invalidateQueries({ queryKey: ["budgets"] })
  }

  const totalBudget = monthBudgets.reduce((a, b) => a + b.limitAmount, 0)
  const totalSpentOnBudgets = budgetStatus.reduce((a, b) => a + b.spent, 0)
  const overBudgetCount = budgetStatus.filter((b) => b.isOver).length

  const resetBudgetForm = () => setBudgetForm({ categoryId: "", limitAmount: "" })

  const handleAddBudget = async () => {
    if (saving) return
    const selectedCategory = categories.find((c) => c.id === budgetForm.categoryId)
    if (!selectedCategory || !budgetForm.limitAmount) return
    setSaving(true)
    try {
      const limitAmount = Number(budgetForm.limitAmount)
      const existing = monthBudgets.find((b) => b.categoryId === budgetForm.categoryId)
      if (existing) {
        await budgetService.update(existing.id, { limitAmount })
      } else {
        await budgetService.create({
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name,
          limitAmount,
          month: selectedMonth,
        })
      }
      invalidateBudgets()
      resetBudgetForm()
      setBudgetDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const removeBudget = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await budgetService.delete(id)
      invalidateBudgets()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <TabsContent value="orcamentos" className="mt-6 flex flex-col gap-6">
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

        <BudgetDialog
          open={budgetDialogOpen}
          onOpenChange={setBudgetDialogOpen}
          categories={categories}
          saving={saving || loadingCategories}
          categoryId={budgetForm.categoryId}
          limitAmount={budgetForm.limitAmount}
          onChangeCategoryId={(v) => setBudgetForm({ ...budgetForm, categoryId: v })}
          onChangeLimitAmount={(v) => setBudgetForm({ ...budgetForm, limitAmount: v })}
          onSave={handleAddBudget}
          onCancel={() => { setBudgetDialogOpen(false); resetBudgetForm() }}
        />
      </div>

      {overBudgetCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            {overBudgetCount === 1 ? "1 categoria estourou o orcamento este mes!" : `${overBudgetCount} categorias estouraram o orcamento este mes!`}
          </p>
        </div>
      )}

      <BudgetSummaryStats totalBudget={totalBudget} totalSpentOnBudgets={totalSpentOnBudgets} loading={loading} />

      <BudgetListCard
        selectedMonth={selectedMonth}
        categories={categories}
        budgetStatus={budgetStatus}
        removeBudget={removeBudget}
        deletingId={deletingId}
      />
    </TabsContent>
  )
}
