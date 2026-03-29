"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { incomeService } from "@/services/financeService"
import { useFinance } from "@/lib/finance-context"
import { IncomeDialog } from "@/components/incomes/IncomeDialog"
import { IncomeStats } from "@/components/incomes/IncomeStats"
import { IncomeList } from "@/components/incomes/IncomeList"

export default function RendaPage() {
  const { viewMode, viewModeReady } = useFinance()
  const queryClient = useQueryClient()

  const { data: incomes = [], isLoading: loading } = useQuery({
    queryKey: ["incomes", viewMode],
    queryFn: () => incomeService.getAll({ view: viewMode }),
    enabled: viewModeReady,
  })

  const invalidateIncomes = () => {
    queryClient.invalidateQueries({ queryKey: ["incomes"] })
    queryClient.invalidateQueries({ queryKey: ["dashboard-init"] })
  }

  const createMutation = useMutation({
    mutationFn: (data: any) => incomeService.create(data, viewMode),
    onSuccess: invalidateIncomes,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => incomeService.delete(id),
    onSuccess: invalidateIncomes,
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => incomeService.deleteMany(ids),
    onSuccess: invalidateIncomes,
  })

  const handleAddIncome = async (incomeData: any) => {
    await createMutation.mutateAsync(incomeData)
  }

  const handleDeleteIncome = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const handleDeleteMultipleIncomes = async (ids: string[]) => {
    if (!ids.length) return
    await bulkDeleteMutation.mutateAsync(ids)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Renda</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie suas fontes de renda</p>
        </div>
        <div className="flex items-center gap-2">
          <IncomeDialog onAdd={handleAddIncome} />
        </div>
      </div>

      <IncomeStats incomes={incomes} loading={loading} />

      <IncomeList
        incomes={incomes}
        loading={loading}
        onDelete={handleDeleteIncome}
        onDeleteMultiple={handleDeleteMultipleIncomes}
      />
    </div>
  )
}
