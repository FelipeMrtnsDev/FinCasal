"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { FinanceState, Expense, Income, Investment, SavingsGoal, Category, ViewMode } from "@/lib/types"
import { DEFAULT_CATEGORIES } from "@/lib/types"

const STORAGE_KEY = "finance-app-data"
const getLocalYearMonth = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${now.getFullYear()}-${month}`
}

const defaultState: FinanceState = {
  expenses: [],
  incomes: [],
  investments: [],
  categories: DEFAULT_CATEGORIES,
  savingsGoals: [],
  viewMode: "individual",
  personNames: { eu: "Eu", parceiro: "Parceiro(a)" },
  currentMonth: getLocalYearMonth(),
  startMonth: getLocalYearMonth(),
}

interface FinanceContextType extends FinanceState {
  addExpense: (expense: Omit<Expense, "id">) => void
  removeExpense: (id: string) => void
  addIncome: (income: Omit<Income, "id">) => void
  removeIncome: (id: string) => void
  addInvestment: (investment: Omit<Investment, "id">) => void
  removeInvestment: (id: string) => void
  addCategory: (category: Omit<Category, "id">) => void
  removeCategory: (id: string) => void
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void
  removeSavingsGoal: (id: string) => void
  setViewMode: (mode: ViewMode) => void
  setPersonNames: (names: { eu: string; parceiro: string }) => void
  setCurrentMonth: (month: string) => void
  importCSV: (data: Omit<Expense, "id">[]) => void
  isLoaded: boolean
  viewModeReady: boolean
  setViewModeReady: (ready: boolean) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinanceState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)
  const [viewModeReady, setViewModeReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as FinanceState
        const currentMonth = typeof parsed.currentMonth === "string" ? parsed.currentMonth : defaultState.currentMonth
        const startMonth = typeof parsed.startMonth === "string" ? parsed.startMonth : currentMonth
        setState({
          ...defaultState,
          ...parsed,
          categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
          currentMonth,
          startMonth,
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

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((s) => ({ ...s, viewMode: mode }))
  }, [])

  const setPersonNames = useCallback((names: { eu: string; parceiro: string }) => {
    setState((s) => ({ ...s, personNames: names }))
  }, [])

  const setCurrentMonth = useCallback((month: string) => {
    setState((s) => ({ ...s, currentMonth: month }))
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
        addCategory,
        removeCategory,
        addSavingsGoal,
        updateSavingsGoal,
        removeSavingsGoal,
        setViewMode,
        setPersonNames,
        setCurrentMonth,
        importCSV,
        isLoaded,
        viewModeReady,
        setViewModeReady,
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
