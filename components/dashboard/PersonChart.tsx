"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { PersonData, DashboardSummary } from "@/services/summaryService"
import { motion } from "framer-motion"

interface PersonChartProps {
  data: PersonData[]
  totalExpenses: number
}

function formatCurrency(value: number) {
  return (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function CustomTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      {label && <p className="text-xs font-medium text-foreground mb-2">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function PersonChart({ data, totalExpenses }: PersonChartProps) {
  const emptyChartMessage = (
    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
      Nenhuma despesa registrada este mes
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Divisao por Pessoa</CardTitle>
        <CardDescription>Quanto cada um gastou este mes</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {data.map((entry, index) => (
                      <Cell key={`cell-person-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4 flex-1 min-w-0 w-full">
              {data.map((p) => {
                const percent = totalExpenses > 0 ? ((p.value / totalExpenses) * 100).toFixed(1) : "0"
                return (
                  <div key={p.name} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                      </div>
                      <span className="text-sm font-mono font-medium text-foreground">{formatCurrency(p.value)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{percent}% do total</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : emptyChartMessage}
      </CardContent>
    </Card>
  )
}
