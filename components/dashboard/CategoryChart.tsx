"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { CategoryData } from "@/services/summaryService"
import { motion } from "framer-motion"

interface CategoryChartProps {
  data: CategoryData[]
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

export function CategoryChart({ data, totalExpenses }: CategoryChartProps) {
  // Se não houver dados, cria um item "Sem dados" para mostrar o gráfico vazio
  const chartData = data.length > 0 ? data : [{ name: "Sem dados", value: 1, color: "#374151" }]
  const hasData = data.length > 0
  const rankingData = hasData ? [...data].sort((a, b) => b.value - a.value) : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Distribuicao por categoria</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-56 w-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={800}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {hasData && <Tooltip content={<CustomTooltipContent />} />}
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2.5 flex-1 min-w-0 w-full">
            {hasData ? (
              data.map((cat, i) => {
                const percent = totalExpenses > 0 ? ((cat.value / totalExpenses) * 100).toFixed(1) : "0"
                return (
                  <div key={`${cat.name}-${cat.color}-${i}`} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-foreground truncate flex-1">{cat.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{percent}%</span>
                    <span className="text-sm font-mono text-foreground shrink-0">{formatCurrency(cat.value)}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">Nenhuma despesa registrada</div>
            )}
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Ranking de gastos</p>
        <div className="flex flex-col gap-3">
          {hasData ? (
            rankingData.map((cat, i) => {
              const maxValue = rankingData[0]?.value || 1
              return (
                <div key={`${cat.name}-${cat.color}-rank-${i}`} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <span className="text-sm text-foreground w-28 truncate">{cat.name}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cat.value / maxValue) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                  <span className="text-sm font-mono text-foreground w-24 text-right shrink-0">{formatCurrency(cat.value)}</span>
                </div>
              )
            })
          ) : (
            <div className="text-sm text-muted-foreground">Sem dados para ranking</div>
          )}
        </div>
      </div>
    </div>
  )
}
