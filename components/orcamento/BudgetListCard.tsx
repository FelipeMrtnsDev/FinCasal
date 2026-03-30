"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Category } from "@/lib/types"
import { Loader2, Trash2, Wallet } from "lucide-react"
import { BudgetStatus } from "./types"
import { formatCurrency } from "./utils"

type BudgetListCardProps = {
  selectedMonth: string
  categories: Category[]
  budgetStatus: BudgetStatus[]
  removeBudget: (id: string) => Promise<void>
  deletingId?: string | null
}

export function BudgetListCard({ selectedMonth, categories, budgetStatus, removeBudget, deletingId }: BudgetListCardProps) {
  const [yearRaw, monthRaw] = selectedMonth.split("-")
  const year = Number(yearRaw)
  const monthIndex = Number(monthRaw) - 1
  const selectedMonthDate = Number.isInteger(year) && Number.isInteger(monthIndex)
    ? new Date(year, monthIndex, 1)
    : new Date()

  if (budgetStatus.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Wallet className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Nenhum orcamento definido para este mes</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Clique em "Novo Orcamento" para comecar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Orcamentos por Categoria</CardTitle>
        <CardDescription>{format(selectedMonthDate, "MMMM 'de' yyyy", { locale: ptBR })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {budgetStatus.map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId)
            return (
              <div key={b.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color ?? "#21C25E" }} />
                    <span className="text-sm font-medium text-foreground truncate">{b.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-xs font-mono font-semibold", b.isOver ? "text-destructive" : "text-foreground")}>{formatCurrency(b.spent)}</span>
                    <span className="text-xs text-muted-foreground font-mono">/ {formatCurrency(b.limitAmount)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeBudget(b.id)}
                      disabled={deletingId === b.id}
                    >
                      {deletingId === b.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, b.percent)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={cn("h-full rounded-full", b.isOver ? "bg-destructive" : b.isNear ? "bg-amber-400" : "bg-primary")}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{b.percent.toFixed(0)}% utilizado</span>
                  {b.isOver ? (
                    <span className="text-destructive font-medium">{formatCurrency(b.spent - b.limitAmount)} acima do limite</span>
                  ) : (
                    <span className="text-primary font-medium">{formatCurrency(b.limitAmount - b.spent)} disponivel</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
