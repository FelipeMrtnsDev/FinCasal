"use client"

import { useState, useMemo, useEffect } from "react"
import { useFinance } from "@/lib/finance-context"
import { ExpenseDialog } from "@/components/expenses/ExpenseDialog"
import { CsvImport } from "@/components/expenses/CsvImport"
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters"
import { ExpenseList } from "@/components/expenses/ExpenseList"
import { PageSkeleton } from "@/components/skeleton-loader"
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

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true)
    try {
      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getAll(),
        categoryService.getAll()
      ])
      setExpenses(expensesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddExpense = async (expenseData: any) => {
    await expenseService.create(expenseData)
    await fetchData() // Refresh list
  }

  const handleDeleteExpense = async (id: string) => {
    await expenseService.delete(id)
    await fetchData() // Refresh list
  }

  const handleImportExpenses = async (expensesData: any[]) => {
    // Process sequentially or in batches if API supports bulk
    // Assuming backend might need one by one or we adapt service
    // For now, let's assume we send one by one or create a bulk endpoint
    // But expenseService.importCsv takes FormData.
    // If CsvImport component parses CSV, we might need to change it to send FormData
    // OR we loop and create. 
    // The previous CsvImport implementation parsed it. 
    // Let's adjust CsvImport to use expenseService.create in loop or use importCsv endpoint if we want to send file.
    // The previous implementation in page.tsx used importCSV from context which took array.
    // expenseService.create takes one.
    
    // Let's loop for now as it's safer without bulk endpoint info
    for (const expense of expensesData) {
      await expenseService.create(expense)
    }
    await fetchData()
  }

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (searchTerm && !e.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
        if (filterCategory !== "all" && e.category !== filterCategory) return false
        if (filterPayment !== "all" && e.paymentMethod !== filterPayment) return false
        if (filterPerson !== "all" && e.person !== filterPerson) return false
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, searchTerm, filterCategory, filterPayment, filterPerson])

  if (loading && !contextLoaded) return <PageSkeleton />

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Despesas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredExpenses.length} despesas registradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExpenseDialog categories={categories} onAdd={handleAddExpense} />
        </div>
      </div>

      <CsvImport onImport={handleImportExpenses} />

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
        onDelete={handleDeleteExpense} 
      />
    </div>
  )
}
