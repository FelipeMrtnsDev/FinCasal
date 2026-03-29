"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowUpRight, Loader2, CheckCircle2, Circle, ListChecks } from "lucide-react"
import { Income } from "@/lib/types"
import { useFinance } from "@/lib/finance-context"
import { format, parseISO } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"

interface IncomeListProps {
  incomes: Income[]
  loading?: boolean
  onDelete: (id: string) => Promise<void>
  onDeleteMultiple?: (ids: string[]) => Promise<void>
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

export function IncomeList({ incomes, loading = false, onDelete, onDeleteMultiple }: IncomeListProps) {
  const { personNames } = useFinance()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Selection mode states
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false)

  const handleDeleteIncome = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleIncomeClick = (income: Income) => {
    if (isSelectionMode) {
      const next = new Set(selectedIds)
      if (next.has(income.id)) next.delete(income.id)
      else next.add(income.id)
      setSelectedIds(next)
      return
    }
  }

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds(new Set())
  }

  const handleSelectAll = () => {
    if (selectedIds.size === incomes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(incomes.map(i => i.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (!onDeleteMultiple || selectedIds.size === 0) return
    setIsDeletingMultiple(true)
    try {
      await onDeleteMultiple(Array.from(selectedIds))
      setIsSelectionMode(false)
      setSelectedIds(new Set())
    } finally {
      setIsDeletingMultiple(false)
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">Fontes de Renda</CardTitle>
          <CardDescription>{incomes.length} registros</CardDescription>
        </div>
        {incomes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSelectionMode}
            className="h-8 text-xs font-medium text-primary hover:text-primary/80"
          >
            <ListChecks className="w-4 h-4 mr-2" />
            {isSelectionMode ? "Cancelar" : "Selecionar"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isSelectionMode && incomes.length > 0 && (
          <div className="flex items-center justify-between bg-muted/30 p-2 sm:p-3 rounded-md mb-4 border border-border/50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs h-8"
              >
                {selectedIds.size === incomes.length ? "Desmarcar Todos" : "Selecionar Todos"}
              </Button>
              <span className="text-xs text-muted-foreground font-medium">
                {selectedIds.size} selecionado{selectedIds.size !== 1 && 's'}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs gap-1.5"
              disabled={selectedIds.size === 0 || isDeletingMultiple}
              onClick={handleBulkDelete}
            >
              {isDeletingMultiple ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Excluir</span>
            </Button>
          </div>
        )}
        {incomes.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">Nenhuma renda registrada. Adicione sua primeira fonte de renda!</div>
        ) : (
          <div className="flex flex-col gap-1">
            {incomes
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((income) => (
                <div
                  key={income.id}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => handleIncomeClick(income)}
                >
                  {isSelectionMode && (
                    <div className="shrink-0 transition-opacity duration-200">
                      {selectedIds.has(income.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                      )}
                    </div>
                  )}
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
                    {!isSelectionMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDeleteIncome(income.id) }}
                        disabled={deletingId === income.id}
                      >
                        {deletingId === income.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
