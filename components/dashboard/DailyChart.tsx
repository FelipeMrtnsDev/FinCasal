"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, CartesianGrid, Line } from "recharts"
import { DailySpending } from "@/services/summaryService"

interface DailyChartProps {
  data: DailySpending[]
}

function formatCurrency(value: number) {
  return (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function CustomTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      {label && <p className="text-xs font-medium text-foreground mb-2">Dia {label}</p>}
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

export function DailyChart({ data }: DailyChartProps) {
  const emptyChartMessage = (
    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
      Nenhuma despesa registrada este mes
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Gastos por dia do mes</p>
        {data.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="dia" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltipContent />} />
                <Line type="monotone" dataKey="valor" stroke="#21C25E" strokeWidth={2} dot={{ fill: '#21C25E', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} name="Gasto" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : emptyChartMessage}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Gasto acumulado no mes</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.reduce((acc, day, i) => {
                const prev = i > 0 ? acc[i - 1].acumulado : 0
                acc.push({ dia: day.dia, acumulado: prev + day.valor })
                return acc
              }, [] as { dia: string; acumulado: number }[])}
            >
              <defs>
                <linearGradient id="acumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#21C25E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#21C25E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="dia" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltipContent />} />
              <Area type="monotone" dataKey="acumulado" stroke="#21C25E" fill="url(#acumGrad)" strokeWidth={2} name="Acumulado" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
