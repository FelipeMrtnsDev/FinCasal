"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, ArrowUpRight, Wallet } from "lucide-react"
import { Income } from "@/lib/types"
import { useFinance } from "@/lib/finance-context"
import { cn } from "@/lib/utils"

interface IncomeStatsProps {
  incomes: Income[]
}

function formatCurrency(value: number) {
  // Garantir que sempre tenha o prefixo R$
  const formatted = (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  if (!formatted.includes("R$")) {
    return `R$ ${formatted}`;
  }
  return formatted;
}

export function IncomeStats({ incomes }: IncomeStatsProps) {
  const { viewMode, personNames } = useFinance()

  const totalIncome = incomes.reduce((a, i) => a + i.amount, 0)
  const recurringIncome = incomes.filter((i) => i.recurring).reduce((a, i) => a + i.amount, 0)

  const stats = [
    { label: "Renda Total", value: totalIncome, icon: DollarSign },
    { label: "Recorrente", value: recurringIncome, icon: ArrowUpRight },
    ...(viewMode === "casal"
      ? [
          { label: personNames.eu, value: incomes.filter((i) => i.person === "eu").reduce((a, i) => a + i.amount, 0), icon: Wallet },
          { label: personNames.parceiro, value: incomes.filter((i) => i.person === "parceiro").reduce((a, i) => a + i.amount, 0), icon: Wallet },
        ]
      : []),
  ]

  return (
    <div className={cn("grid gap-3", viewMode === "casal" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2")}>
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-medium text-muted-foreground truncate">{stat.label}</span>
                <span className="text-base sm:text-lg font-bold font-mono text-foreground">{formatCurrency(stat.value)}</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
