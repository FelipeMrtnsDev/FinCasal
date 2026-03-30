"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { INVESTMENT_TYPES, type Investment } from "@/lib/types"
import { format, parseISO } from "date-fns"
import { INVEST_COLORS, INVEST_ICONS, formatCurrency } from "./constants"
import { Trash2, Loader2, CheckCircle2, Circle, ListChecks } from "lucide-react"

type InvestmentOperationsListProps = {
  investments: Investment[]
  onSelect: (investment: Investment) => void
  onDeleteMultiple?: (ids: string[]) => Promise<void>
}

export function InvestmentOperationsList({ investments, onSelect, onDeleteMultiple }: InvestmentOperationsListProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false)

  const handleItemClick = (inv: Investment) => {
    if (isSelectionMode) {
      const next = new Set(selectedIds)
      if (next.has(inv.id)) next.delete(inv.id)
      else next.add(inv.id)
      setSelectedIds(next)
      return
    }
    onSelect(inv)
  }

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds(new Set())
  }

  const handleSelectAll = () => {
    if (selectedIds.size === investments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(investments.map(i => i.id)))
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">Historico de Operacoes</CardTitle>
          <CardDescription>{investments.length} registros</CardDescription>
        </div>
        {investments.length > 0 && (
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
        {isSelectionMode && investments.length > 0 && (
          <div className="flex items-center justify-between bg-muted/30 p-2 sm:p-3 rounded-md mb-4 border border-border/50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs h-8"
              >
                {selectedIds.size === investments.length ? "Desmarcar Todos" : "Selecionar Todos"}
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
        {investments.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">Nenhum investimento registrado. Adicione seu primeiro registro!</div>
        ) : (
          <div className="flex flex-col gap-1">
            {investments
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((inv) => {
                const Icon = INVEST_ICONS[inv.type]
                const isInflow = inv.type !== "aporte"
                const typeLabel = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label || inv.type
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => handleItemClick(inv)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer group"
                  >
                    {isSelectionMode && (
                      <div className="shrink-0 transition-opacity duration-200">
                        {selectedIds.has(inv.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                        )}
                      </div>
                    )}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}20` }}>
                      <Icon className="w-4 h-4" style={{ color: INVEST_COLORS[inv.type] }} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground truncate">{inv.asset || inv.description}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded w-fit" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}15`, color: INVEST_COLORS[inv.type] }}>
                        {typeLabel}
                      </span>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className={cn("text-sm font-mono font-medium", isInflow ? "text-primary" : "text-amber-600")}>
                        {isInflow ? "+" : "-"}
                        {formatCurrency(inv.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(() => {
                          try {
                            return format(parseISO(inv.date), "dd/MM")
                          } catch {
                            return inv.date
                          }
                        })()}
                      </span>
                    </div>
                  </button>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
