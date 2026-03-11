"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart as LineChartIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AssetSummary } from "./types"
import { formatCurrency } from "./constants"

type InvestmentAssetCardsProps = {
  byAsset: AssetSummary[]
  onSelect: (asset: AssetSummary) => void
}

export function InvestmentAssetCards({ byAsset, onSelect }: InvestmentAssetCardsProps) {
  if (byAsset.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Por Ativo</CardTitle>
        <CardDescription>Toque para ver detalhes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {byAsset.map((asset) => (
            <button
              key={asset.name}
              type="button"
              onClick={() => onSelect(asset)}
              className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <LineChartIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">{asset.name}</span>
                <span className="text-xs text-muted-foreground">{formatCurrency(asset.aportes)} aportado</span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className={cn("text-sm font-mono font-bold", asset.lucro >= 0 ? "text-primary" : "text-amber-600")}>
                  {asset.lucro >= 0 ? "+" : ""}
                  {formatCurrency(asset.lucro)}
                </span>
                {asset.aportes > 0 && (
                  <span className={cn("text-xs font-mono", asset.lucro >= 0 ? "text-primary/70" : "text-amber-500")}>
                    {asset.lucro >= 0 ? "+" : ""}
                    {((asset.lucro / asset.aportes) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
