"use client"

import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, ShoppingBag } from "lucide-react"
import { Sale } from "./types"
import { formatCurrency } from "./utils"

type SalesHistoryCardProps = {
  sales: Sale[]
  onSelectSale: (sale: Sale) => void
}

export function SalesHistoryCard({ sales, onSelectSale }: SalesHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historico de Vendas</CardTitle>
        <CardDescription>{sales.length} registros</CardDescription>
      </CardHeader>
      <CardContent>
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
                  onClick={() => onSelectSale(sale)}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer"
                >
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
