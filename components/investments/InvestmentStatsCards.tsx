"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { InvestmentStat } from "./types"
import { formatCurrency } from "./constants"

type InvestmentStatsCardsProps = {
  stats: InvestmentStat[]
  loading?: boolean
}

export function InvestmentStatsCards({ stats, loading = false }: InvestmentStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.trend === "down" ? "bg-amber-100" : "bg-primary/10")}>
                <stat.icon className={cn("w-4 h-4", stat.trend === "down" ? "text-amber-600" : "text-primary")} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</span>
                {loading ? (
                  <Skeleton className="h-5 w-24" />
                ) : (
                  <span className={cn("text-base font-bold font-mono", stat.trend === "down" ? "text-amber-600" : "text-foreground")}>
                    {stat.trend === "neutral" ? stat.value : formatCurrency(stat.value)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
