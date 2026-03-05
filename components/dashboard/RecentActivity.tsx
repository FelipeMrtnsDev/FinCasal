"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { Expense, Income } from "@/lib/types"

interface RecentActivityProps {
  expenses: Expense[]
  incomes: Income[]
  categories: any[]
}

function formatCurrency(value: number) {
  return (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function RecentActivity({ expenses, incomes, categories }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividade Recente</CardTitle>
        <CardDescription>Ultimas transacoes</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 && incomes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Nenhuma transacao registrada. Comece adicionando suas despesas e renda.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {[...expenses, ...incomes]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((item) => {
                const isExpense = "paymentMethod" in item
                const cat = isExpense ? categories.find((c) => c.id === (item as Expense).category) : null
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      isExpense ? "bg-destructive/10" : "bg-primary/10"
                    )}>
                      {isExpense ? (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground truncate">{item.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {cat?.name || "Renda"} {" - "}
                        {(() => { try { return format(parseISO(item.date), "dd/MM/yyyy") } catch { return item.date } })()}
                      </span>
                    </div>
                    <span className={cn(
                      "text-sm font-mono font-medium shrink-0",
                      isExpense ? "text-destructive" : "text-primary"
                    )}>
                      {isExpense ? "-" : "+"}{formatCurrency(item.amount)}
                    </span>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
