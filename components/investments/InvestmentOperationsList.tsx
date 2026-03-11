"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { INVESTMENT_TYPES, type Investment } from "@/lib/types"
import { format, parseISO } from "date-fns"
import { INVEST_COLORS, INVEST_ICONS, formatCurrency } from "./constants"

type InvestmentOperationsListProps = {
  investments: Investment[]
  onSelect: (investment: Investment) => void
}

export function InvestmentOperationsList({ investments, onSelect }: InvestmentOperationsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historico de Operacoes</CardTitle>
        <CardDescription>{investments.length} registros</CardDescription>
      </CardHeader>
      <CardContent>
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
                    onClick={() => onSelect(inv)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer"
                  >
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
