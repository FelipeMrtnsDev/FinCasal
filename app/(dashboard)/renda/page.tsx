"use client"

import { useState, useEffect } from "react"
import { useFinance } from "@/lib/finance-context"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PageSkeleton } from "@/components/skeleton-loader"
import { incomeService } from "@/services/financeService"
import { Income } from "@/lib/types"
import { IncomeDialog } from "@/components/incomes/IncomeDialog"
import { IncomeStats } from "@/components/incomes/IncomeStats"
import { IncomeList } from "@/components/incomes/IncomeList"

export default function RendaPage() {
  const { isLoaded: contextLoaded } = useFinance()
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await incomeService.getAll()
      console.log("Fetched incomes:", data)
      setIncomes(data)
    } catch (error) {
      console.error("Failed to fetch incomes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddIncome = async (incomeData: any) => {
    await incomeService.create(incomeData)
    await fetchData()
  }

  const handleDeleteIncome = async (id: string) => {
    await incomeService.delete(id)
    await fetchData()
  }

  if (loading && !contextLoaded) return <PageSkeleton />

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

      <IncomeStats incomes={incomes} />

      <IncomeList 
        incomes={incomes} 
        loading={loading} 
        onDelete={handleDeleteIncome} 
      />
    </div>
  )
}
