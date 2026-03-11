"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { SalesStat } from "./types"
import { formatCurrency } from "./utils"

type SalesStatsCardsProps = {
  stats: SalesStat[]
  loading?: boolean
}

export function SalesStatsCards({ stats, loading = false }: SalesStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.color === "amber" ? "bg-amber-100" : stat.color === "neutral" ? "bg-muted" : "bg-primary/10")}>
                <stat.icon className={cn("w-4 h-4", stat.color === "amber" ? "text-amber-600" : stat.color === "neutral" ? "text-muted-foreground" : "text-primary")} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</span>
                {loading ? (
                  <Skeleton className="h-5 w-24" />
                ) : (
                  <span className={cn("text-base font-bold font-mono", stat.color === "amber" ? "text-amber-600" : "text-foreground")}>
                    {stat.color === "neutral" ? stat.value : formatCurrency(stat.value)}
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
