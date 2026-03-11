"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ProjectionStat } from "./types"
import { formatCurrency } from "./utils"

type ProjectionStatsProps = {
  stats: ProjectionStat[]
  estimatedMonthlySavings: number
  loading?: boolean
}

export function ProjectionStats({ stats, estimatedMonthlySavings, loading = false }: ProjectionStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">{stat.label}</span>
                {loading ? (
                  <Skeleton className="h-5 w-28" />
                ) : (
                  <span
                    className={cn(
                      "text-sm sm:text-lg font-bold font-mono text-foreground",
                      stat.label.includes("Economia") && estimatedMonthlySavings < 0 && "text-destructive"
                    )}
                  >
                    {stat.isCurrency === false ? stat.value : formatCurrency(stat.value as number)}
                  </span>
                )}
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
