"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, ShoppingBag, Trash2, Loader2, CheckCircle2, Circle, ListChecks } from "lucide-react"
import { Sale } from "./types"
import { formatCurrency } from "./utils"

type SalesHistoryCardProps = {
  sales: Sale[]
  onSelectSale: (sale: Sale) => void
  onDeleteMultiple?: (ids: string[]) => Promise<void>
}

export function SalesHistoryCard({ sales, onSelectSale, onDeleteMultiple }: SalesHistoryCardProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false)

  const handleSaleClick = (sale: Sale) => {
    if (isSelectionMode) {
      const next = new Set(selectedIds)
      if (next.has(sale.id)) next.delete(sale.id)
      else next.add(sale.id)
      setSelectedIds(next)
      return
    }
    onSelectSale(sale)
  }

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds(new Set())
  }

  const handleSelectAll = () => {
    if (selectedIds.size === sales.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sales.map(s => s.id)))
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
          <CardTitle className="text-base">Historico de Vendas</CardTitle>
          <CardDescription>{sales.length} registros</CardDescription>
        </div>
        {sales.length > 0 && (
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
        {isSelectionMode && sales.length > 0 && (
          <div className="flex items-center justify-between bg-muted/30 p-2 sm:p-3 rounded-md mb-4 border border-border/50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs h-8"
              >
                {selectedIds.size === sales.length ? "Desmarcar Todos" : "Selecionar Todos"}
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
        {sales.length === 0 ? (
          <div className="py-10 text-center">
            <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {sales
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((sale) => (
                <button
                  key={sale.id}
                  type="button"
                  onClick={() => handleSaleClick(sale)}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer group"
                >
                  {isSelectionMode && (
                    <div className="shrink-0 transition-opacity duration-200">
                      {selectedIds.has(sale.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                      )}
                    </div>
                  )}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{sale.productName}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded w-fit bg-primary/10 text-primary">
                      {sale.quantity}x
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-mono font-medium text-foreground">
                      {formatCurrency(sale.unitPrice * sale.quantity)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          return format(parseISO(sale.date), "dd/MM")
                        } catch {
                          return sale.date
                        }
                      })()}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
