"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"
import { PIE_COLORS, formatCurrency } from "./utils"

type SalesCategoryCardProps = {
  byCategory: Array<{ name: string; unidades: number; faturamento: number; lucro: number }>
}

export function SalesCategoryCard({ byCategory }: SalesCategoryCardProps) {
  if (byCategory.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Por Categoria</CardTitle>
        <CardDescription>Toque para ver detalhes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {byCategory.map((cat, idx) => (
            <button
              key={cat.name}
              type="button"
              className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left"
              onClick={() => {}}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PIE_COLORS[idx % PIE_COLORS.length]}20` }}>
                <ShoppingBag className="w-4 h-4" style={{ color: PIE_COLORS[idx % PIE_COLORS.length] }} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.unidades} unidades</span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-sm font-mono font-semibold text-foreground">{formatCurrency(cat.faturamento)}</span>
                <span className={cn("text-xs font-mono", cat.lucro >= 0 ? "text-primary" : "text-amber-600")}>
                  lucro {formatCurrency(cat.lucro)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
