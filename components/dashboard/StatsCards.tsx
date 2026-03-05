"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet, Smartphone, CreditCard, PiggyBank } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardSummary } from "@/services/summaryService"

interface StatsCardsProps {
  summary: DashboardSummary
}

function formatCurrency(value: number) {
  return (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function StatsCards({ summary }: StatsCardsProps) {
  const stats = [
    { label: "Renda Total", value: summary.totalIncomes, icon: TrendingUp, trend: "up" as const, color: "text-primary", bg: "bg-primary/10" },
    { label: "Despesas", value: summary.totalExpenses, icon: TrendingDown, trend: "down" as const, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Saldo", value: summary.balance, icon: Wallet, trend: summary.balance >= 0 ? "up" as const : "down" as const, color: summary.balance >= 0 ? "text-primary" : "text-destructive", bg: summary.balance >= 0 ? "bg-primary/10" : "bg-destructive/10" },
    { label: "Pix", value: summary.pixExpenses, icon: Smartphone, trend: "neutral" as const, color: "text-muted-foreground", bg: "bg-muted" },
    { label: "Cartao", value: summary.cardExpenses, icon: CreditCard, trend: "neutral" as const, color: "text-muted-foreground", bg: "bg-muted" },
    { label: "Custos Fixos", value: summary.fixedExpenses, icon: PiggyBank, trend: "neutral" as const, color: "text-muted-foreground", bg: "bg-muted" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">{stat.label}</span>
                <span className="text-sm sm:text-lg font-bold text-foreground font-mono truncate">
                  {formatCurrency(stat.value)}
                </span>
              </div>
              <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", stat.color)} />
              </div>
            </div>
            {stat.trend !== "neutral" && (
              <div className="flex items-center gap-1 mt-1.5">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 text-primary" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-destructive" />
                )}
                <span className={cn("text-[10px] sm:text-xs font-medium", stat.trend === "up" ? "text-primary" : "text-destructive")}>
                  Este mês
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
