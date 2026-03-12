"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowUpRight, Loader2 } from "lucide-react"
import { Income } from "@/lib/types"
import { useFinance } from "@/lib/finance-context"
import { format, parseISO } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"

interface IncomeListProps {
  incomes: Income[]
  loading?: boolean
  onDelete: (id: string) => Promise<void>
}

function formatCurrency(value: number) {
  const formatted = (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  if (!formatted.includes("R$")) {
    return `R$ ${formatted}`;
  }
  return formatted;
}

export function IncomeList({ incomes, loading = false, onDelete }: IncomeListProps) {
  const { personNames } = useFinance()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteIncome = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fontes de Renda</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-3">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex flex-col flex-1 gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fontes de Renda</CardTitle>
        <CardDescription>{incomes.length} registros</CardDescription>
      </CardHeader>
      <CardContent>
        {incomes.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">Nenhuma renda registrada. Adicione sua primeira fonte de renda!</div>
        ) : (
          <div className="flex flex-col gap-1">
            {incomes
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((income) => (
                <div
                  key={income.id}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground truncate">{income.description}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{income.person === "eu" ? personNames.eu : personNames.parceiro}</span>
                      {income.recurring && (
                        <>
                          <span>{"/"}</span>
                          <span className="text-primary font-medium">Recorrente</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-mono font-medium text-primary">+{formatCurrency(income.amount)}</span>
                      <span className="text-xs text-muted-foreground">
                        {(() => { try { return format(parseISO(income.date), "dd/MM/yyyy") } catch { return income.date } })()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteIncome(income.id)}
                      disabled={deletingId === income.id}
                    >
                      {deletingId === income.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
