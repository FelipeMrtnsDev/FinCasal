"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { PiggyBank, TrendingUp, Wallet } from "lucide-react"
import { formatCurrency } from "./utils"

type BudgetSummaryStatsProps = {
  totalBudget: number
  totalSpentOnBudgets: number
  loading?: boolean
}

export function BudgetSummaryStats({ totalBudget, totalSpentOnBudgets, loading = false }: BudgetSummaryStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Limite total", value: formatCurrency(totalBudget), icon: Wallet, color: "text-foreground" },
        { label: "Gasto", value: formatCurrency(totalSpentOnBudgets), icon: TrendingUp, color: totalSpentOnBudgets > totalBudget ? "text-destructive" : "text-foreground" },
        { label: "Disponivel", value: formatCurrency(Math.max(0, totalBudget - totalSpentOnBudgets)), icon: PiggyBank, color: "text-primary" },
      ].map((s) => (
        <Card key={s.label}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{s.label}</span>
                {loading ? (
                  <Skeleton className="h-5 w-24" />
                ) : (
                  <span className={cn("text-sm sm:text-base font-bold font-mono", s.color)}>{s.value}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
