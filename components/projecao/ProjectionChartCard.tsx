"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "./utils"

type ProjectionChartCardProps = {
  projectionData: Array<{ month: string; economizado: number; meta: number }>
  totalTarget: number
}

export function ProjectionChartCard({ projectionData, totalTarget }: ProjectionChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Projecao de Economia</CardTitle>
        <CardDescription>
          Estimativa para os proximos 12 meses baseada na sua renda recorrente e media de gastos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorEcon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#21C25E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#21C25E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-foreground)",
                }}
              />
              <Area type="monotone" dataKey="economizado" stroke="#21C25E" fill="url(#colorEcon)" strokeWidth={2} name="Economizado" />
              {totalTarget > 0 && (
                <Area type="monotone" dataKey="meta" stroke="#15803d" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
