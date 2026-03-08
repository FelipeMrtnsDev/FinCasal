"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { FinanceState, Expense, Income, Investment, SavingsGoal, Category, ViewMode, SaleProduct, Sale, Budget } from "@/lib/types"
import { DEFAULT_CATEGORIES } from "@/lib/types"

const STORAGE_KEY = "finance-app-data"

const defaultState: FinanceState = {
  expenses: [],
  incomes: [],
  investments: [],
  saleProducts: [],
  sales: [],
  categories: DEFAULT_CATEGORIES,
  savingsGoals: [],
  budgets: [],
  viewMode: "casal",
  personNames: { eu: "Eu", parceiro: "Parceiro(a)" },
}

interface FinanceContextType extends FinanceState {
  addExpense: (expense: Omit<Expense, "id">) => void
  removeExpense: (id: string) => void
  addIncome: (income: Omit<Income, "id">) => void
  removeIncome: (id: string) => void
  addInvestment: (investment: Omit<Investment, "id">) => void
  removeInvestment: (id: string) => void
  addSaleProduct: (product: Omit<SaleProduct, "id">) => void
  updateSaleProduct: (id: string, updates: Partial<SaleProduct>) => void
  removeSaleProduct: (id: string) => void
  addSale: (sale: Omit<Sale, "id">) => void
  removeSale: (id: string) => void
  addCategory: (category: Omit<Category, "id">) => void
  removeCategory: (id: string) => void
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void
  removeSavingsGoal: (id: string) => void
  addBudget: (budget: Omit<Budget, "id">) => void
  updateBudget: (id: string, updates: Partial<Budget>) => void
  removeBudget: (id: string) => void
  setViewMode: (mode: ViewMode) => void
  setPersonNames: (names: { eu: string; parceiro: string }) => void
  importCSV: (data: Omit<Expense, "id">[]) => void
  isLoaded: boolean
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinanceState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as FinanceState
        setState({
          ...defaultState,
          ...parsed,
          categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
        })
      }
    } catch {
      // ignore
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isLoaded])

  const genId = () => crypto.randomUUID()

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    setState((s) => ({ ...s, expenses: [...s.expenses, { ...expense, id: genId() }] }))
  }, [])

  const removeExpense = useCallback((id: string) => {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }))
  }, [])

  const addIncome = useCallback((income: Omit<Income, "id">) => {
    setState((s) => ({ ...s, incomes: [...s.incomes, { ...income, id: genId() }] }))
  }, [])

  const removeIncome = useCallback((id: string) => {
    setState((s) => ({ ...s, incomes: s.incomes.filter((i) => i.id !== id) }))
  }, [])

  const addInvestment = useCallback((investment: Omit<Investment, "id">) => {
    setState((s) => ({ ...s, investments: [...s.investments, { ...investment, id: genId() }] }))
  }, [])

  const removeInvestment = useCallback((id: string) => {
    setState((s) => ({ ...s, investments: s.investments.filter((i) => i.id !== id) }))
  }, [])

  const addSaleProduct = useCallback((product: Omit<SaleProduct, "id">) => {
    setState((s) => ({ ...s, saleProducts: [...s.saleProducts, { ...product, id: genId() }] }))
  }, [])

  const updateSaleProduct = useCallback((id: string, updates: Partial<SaleProduct>) => {
    setState((s) => ({
      ...s,
      saleProducts: s.saleProducts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  }, [])

  const removeSaleProduct = useCallback((id: string) => {
    setState((s) => ({ ...s, saleProducts: s.saleProducts.filter((p) => p.id !== id) }))
  }, [])

  const addSale = useCallback((sale: Omit<Sale, "id">) => {
    setState((s) => ({ ...s, sales: [...s.sales, { ...sale, id: genId() }] }))
  }, [])

  const removeSale = useCallback((id: string) => {
    setState((s) => ({ ...s, sales: s.sales.filter((s2) => s2.id !== id) }))
  }, [])

  const addCategory = useCallback((category: Omit<Category, "id">) => {
    setState((s) => ({
      ...s,
      categories: [...s.categories, { ...category, id: category.name.toLowerCase().replace(/\s+/g, "-") }],
    }))
  }, [])

  const removeCategory = useCallback((id: string) => {
    setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }))
  }, [])

  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, "id">) => {
    setState((s) => ({ ...s, savingsGoals: [...s.savingsGoals, { ...goal, id: genId() }] }))
  }, [])

  const updateSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setState((s) => ({
      ...s,
      savingsGoals: s.savingsGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }))
  }, [])

  const removeSavingsGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, savingsGoals: s.savingsGoals.filter((g) => g.id !== id) }))
  }, [])

  const addBudget = useCallback((budget: Omit<Budget, "id">) => {
    setState((s) => ({ ...s, budgets: [...s.budgets, { ...budget, id: genId() }] }))
  }, [])

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setState((s) => ({
      ...s,
      budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }))
  }, [])

  const removeBudget = useCallback((id: string) => {
    setState((s) => ({ ...s, budgets: s.budgets.filter((b) => b.id !== id) }))
  }, [])

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((s) => ({ ...s, viewMode: mode }))
  }, [])

  const setPersonNames = useCallback((names: { eu: string; parceiro: string }) => {
    setState((s) => ({ ...s, personNames: names }))
  }, [])

  const importCSV = useCallback((data: Omit<Expense, "id">[]) => {
    setState((s) => ({
      ...s,
      expenses: [...s.expenses, ...data.map((e) => ({ ...e, id: genId() }))],
    }))
  }, [])

  return (
    <FinanceContext.Provider
      value={{
        ...state,
        addExpense,
        removeExpense,
        addIncome,
        removeIncome,
        addInvestment,
        removeInvestment,
        addSaleProduct,
        updateSaleProduct,
        removeSaleProduct,
        addSale,
        removeSale,
        addCategory,
        removeCategory,
        addSavingsGoal,
        updateSavingsGoal,
        removeSavingsGoal,
        addBudget,
        updateBudget,
        removeBudget,
        setViewMode,
        setPersonNames,
        importCSV,
        isLoaded,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider")
  return ctx
}
