"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { AlertTriangle } from "lucide-react"
import { TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { budgetService, categoryService } from "@/services/financeService"
import { Category } from "@/lib/types"
import { BudgetDialog } from "./BudgetDialog"
import { BudgetListCard } from "./BudgetListCard"
import { BudgetSummaryStats } from "./BudgetSummaryStats"
import { Budget } from "./types"
import { getBudgetStatus, getMonthOptions } from "./utils"

export function BudgetTabContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [monthBudgets, setMonthBudgets] = useState<Budget[]>([])
  const [budgetStatus, setBudgetStatus] = useState<ReturnType<typeof getBudgetStatus>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [budgetForm, setBudgetForm] = useState({ categoryId: "", limitAmount: "" })

  const monthOptions = useMemo(() => getMonthOptions(), [])

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const data = await categoryService.getAll()
        const normalized = (data || []).map((c) => ({
          ...c,
          color: c.color || "#21C25E",
        }))
        setCategories(normalized)
      } catch (error) {
        console.error("Erro ao carregar categorias:", error)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  const loadMonthData = useCallback(async (month: string) => {
    setLoading(true)
    try {
      const [budgetsData, statusData] = await Promise.all([
        budgetService.getAll(month),
        budgetService.getStatus(month),
      ])
      const normalizedBudgets: Budget[] = budgetsData.map((b) => ({
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.categoryName,
        limitAmount: Number(b.limitAmount) || 0,
        month: b.month,
      }))
      setMonthBudgets(normalizedBudgets)
      setBudgetStatus(getBudgetStatus(statusData, month))
    } catch (error) {
      console.error("Erro ao carregar orcamentos:", error)
      setMonthBudgets([])
      setBudgetStatus([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMonthData(selectedMonth)
  }, [selectedMonth, loadMonthData])

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
      await loadMonthData(selectedMonth)
      resetBudgetForm()
      setBudgetDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const removeBudget = async (id: string) => {
    await budgetService.delete(id)
    await loadMonthData(selectedMonth)
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

      {!loading && monthBudgets.length > 0 && (
        <BudgetSummaryStats totalBudget={totalBudget} totalSpentOnBudgets={totalSpentOnBudgets} />
      )}

      <BudgetListCard
        selectedMonth={selectedMonth}
        categories={categories}
        budgetStatus={budgetStatus}
        removeBudget={removeBudget}
      />
    </TabsContent>
  )
}
