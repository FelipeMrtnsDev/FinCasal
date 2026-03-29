"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useFinance } from "@/lib/finance-context"
import { ExpenseDialog } from "@/components/expenses/ExpenseDialog"
import { CsvImport } from "@/components/expenses/CsvImport"
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters"
import { ExpenseList } from "@/components/expenses/ExpenseList"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { expenseService, categoryService } from "@/services/financeService"
import { Category } from "@/lib/types"

export default function DespesasPage() {
  const { viewMode, isLoaded: contextLoaded, viewModeReady } = useFinance()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterPayment, setFilterPayment] = useState<string>("all")
  const [filterPerson, setFilterPerson] = useState<string>("all")
  const [page, setPage] = useState(1)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [viewMode, searchTerm, filterCategory, filterPayment, filterPerson])

  // Build query params
  const expenseParams = useMemo(() => {
    const params: Record<string, string | number> = { page }
    if (searchTerm.trim()) params.search = searchTerm.trim()
    if (filterCategory !== "all") params.category = filterCategory
    if (viewMode === "casal" && filterPerson !== "all") params.person = filterPerson
    return params
  }, [page, searchTerm, filterCategory, filterPerson, viewMode])

  // Fetch expenses with cache
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses", viewMode, expenseParams],
    queryFn: () => expenseService.getPage({ ...expenseParams, view: viewMode }),
    enabled: viewModeReady,
  })

  // Fetch categories with cache
  const { data: categories = [] } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => categoryService.getAll("EXPENSE"),
    enabled: viewModeReady,
    staleTime: 60_000,
  })

  const expenses = expensesData?.items ?? []
  const totalItems = expensesData?.totalItems ?? 0
  const totalPages = expensesData?.totalPages ?? 1
  const pageSize = expensesData?.pageSize ?? 40
  const loading = expensesLoading

  const invalidateExpenses = () => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] })
    queryClient.invalidateQueries({ queryKey: ["dashboard-init"] })
  }

  const createMutation = useMutation({
    mutationFn: (data: any) => expenseService.create(data, viewMode),
    onSuccess: invalidateExpenses,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: invalidateExpenses,
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => expenseService.deleteMany(ids),
    onSuccess: invalidateExpenses,
  })

  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      expenseService.update(id, payload, viewMode),
    onSuccess: invalidateExpenses,
  })

  const handleAddExpense = async (expenseData: any) => {
    await createMutation.mutateAsync(expenseData)
  }

  const handleDeleteExpense = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const handleDeleteMultipleExpenses = async (ids: string[]) => {
    if (!ids.length) return
    await bulkDeleteMutation.mutateAsync(ids)
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
    await editMutation.mutateAsync({ id, payload })
  }

  const handleImportExpenses = async () => {
    invalidateExpenses()
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
        onDeleteMultiple={handleDeleteMultipleExpenses}
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
