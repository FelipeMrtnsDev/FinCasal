"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { PaymentMethodData, DashboardSummary } from "@/services/summaryService"

interface PaymentMethodChartProps {
  data: PaymentMethodData[]
  summary: DashboardSummary
}

function formatCurrency(value: number) {
  return (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function CustomTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; fill?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      {label && <p className="text-xs font-medium text-foreground mb-2">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function PaymentMethodChart({ data, summary }: PaymentMethodChartProps) {
  // Dados simulados para gráfico vazio se não houver dados
  const chartData = data.length > 0 ? data : [{ name: "Sem dados", value: 1, color: "#374151" }]
  const hasData = data.length > 0

  const hasSummaryData = summary.fixedExpenses > 0 || summary.variableExpenses > 0
  const fixedVarPie = hasSummaryData ? [
    { name: "Variaveis", value: summary.variableExpenses, fill: "#4ade80" },
    { name: "Fixos", value: summary.fixedExpenses, fill: "#21C25E" },
  ] : [
    { name: "Vazio", value: 1, fill: "#374151" }
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Por metodo de pagamento</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={75} paddingAngle={2} dataKey="value" animationBegin={0} animationDuration={800}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-pm-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {hasData && <Tooltip content={<CustomTooltipContent />} />}
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
            {hasData ? (
              data.map((pm) => (
                <div key={pm.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pm.color }} />
                  <span className="text-sm text-foreground flex-1">{pm.name}</span>
                  <span className="text-sm font-mono text-foreground shrink-0">{formatCurrency(pm.value)}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">Nenhuma despesa registrada</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-3">Fixos vs Variaveis</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fixedVarPie} cx="50%" cy="50%" outerRadius={75} paddingAngle={2} dataKey="value" animationBegin={0} animationDuration={800}>
                  {fixedVarPie.map((entry, index) => (
                    <Cell key={`cell-fv-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                {hasSummaryData && <Tooltip content={<CustomTooltipContent />} />}
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
            {hasSummaryData ? (
              fixedVarPie.map((row) => (
                <div key={row.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.fill }} />
                  <span className="text-sm text-foreground flex-1">{row.name}</span>
                  <span className="text-sm font-mono text-foreground shrink-0">{formatCurrency(row.value)}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">Nenhuma despesa registrada</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
