"use client"

import { useState, useMemo, useEffect } from "react"
import { useFinance } from "@/lib/finance-context"
import { ExpenseDialog } from "@/components/expenses/ExpenseDialog"
import { CsvImport } from "@/components/expenses/CsvImport"
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters"
import { ExpenseList } from "@/components/expenses/ExpenseList"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { expenseService, categoryService } from "@/services/financeService"
import { Expense, Category } from "@/lib/types"

export default function DespesasPage() {
  const { viewMode, isLoaded: contextLoaded } = useFinance()

  // Local state for expenses and categories to ensure fresh data from API
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterPayment, setFilterPayment] = useState<string>("all")
  const [filterPerson, setFilterPerson] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(40)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true)
    try {
      const expenseParams: Record<string, string | number> = { page }
      if (searchTerm.trim()) expenseParams.search = searchTerm.trim()
      if (filterCategory !== "all") expenseParams.category = filterCategory
      if (viewMode === "casal" && filterPerson !== "all") expenseParams.person = filterPerson

      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getPage({ ...expenseParams, view: viewMode }),
        categoryService.getAll("EXPENSE")
      ])
      setExpenses(expensesData.items || [])
      setPage(expensesData.page || page)
      setPageSize(expensesData.pageSize || 40)
      setTotalItems(expensesData.totalItems || 0)
      setTotalPages(expensesData.totalPages || 1)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [viewMode, page, searchTerm, filterCategory, filterPerson])

  useEffect(() => {
    setPage(1)
  }, [viewMode, searchTerm, filterCategory, filterPayment, filterPerson])

  const handleAddExpense = async (expenseData: any) => {
    await expenseService.create(expenseData, viewMode)
    await fetchData() // Refresh list
  }

  const handleDeleteExpense = async (id: string) => {
    await expenseService.delete(id)
    await fetchData() // Refresh list
  }

  const handleEditExpense = async (
    id: string,
    payload: {
      description?: string
      amount?: number
      date?: string
      categoryId?: string | null
      paymentMethod?: string
      type?: string
    }
  ) => {
    await expenseService.update(id, payload, viewMode)
    await fetchData()
  }

  const handleImportExpenses = async () => {
    await fetchData()
  }

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (filterPayment !== "all") {
          const backendPaymentMap: Record<string, string> = {
            "pix": "PIX",
            "cartao": "CREDIT_CARD",
            "dinheiro": "CASH",
            "transferencia": "TRANSFER",
            "outro": "OTHER"
          };
          const expectedBackendValue = backendPaymentMap[filterPayment] || filterPayment;
          if (e.paymentMethod !== expectedBackendValue && e.paymentMethod !== filterPayment) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, filterPayment])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Despesas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="inline-flex items-center">
              {loading && !contextLoaded ? <Skeleton className="h-4 w-8" /> : totalItems}
            </span>{" "}
            despesas registradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExpenseDialog categories={categories} onAdd={handleAddExpense} />
        </div>
      </div>

      <CsvImport onImported={handleImportExpenses} />

      <ExpenseFilters
        categories={categories}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterPayment={filterPayment}
        setFilterPayment={setFilterPayment}
        filterPerson={filterPerson}
        setFilterPerson={setFilterPerson}
      />

      <ExpenseList
        expenses={filteredExpenses}
        categories={categories}
        loading={loading}
        onDelete={handleDeleteExpense}
        onEdit={handleEditExpense}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Página {page} de {totalPages} • {pageSize} por página
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={loading || page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={loading || page >= totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
