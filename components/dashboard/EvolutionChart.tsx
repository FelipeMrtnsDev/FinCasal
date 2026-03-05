"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from "recharts"
import { MonthlyEvolution } from "@/services/summaryService"

interface EvolutionChartProps {
  data: MonthlyEvolution[]
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

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Renda vs Despesas (6 meses)</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltipContent />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="renda" fill="#21C25E" radius={[4, 4, 0, 0]} name="Renda" />
              <Bar dataKey="despesas" fill="#15803d" radius={[4, 4, 0, 0]} name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Saldo mensal</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#21C25E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#21C25E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltipContent />} />
              <Area type="monotone" dataKey="saldo" stroke="#21C25E" fill="url(#saldoGrad)" strokeWidth={2} name="Saldo" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
