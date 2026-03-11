"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { AssetSummary } from "./types"
import { formatCurrency, PIE_COLORS } from "./constants"

type InvestmentChartsProps = {
  byType: Array<{ name: string; value: number }>
  byAsset: AssetSummary[]
}

export function InvestmentCharts({ byType, byAsset }: InvestmentChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuicao por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          {byType.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Sem dados ainda</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byType}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {byType.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Valor"]} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {byAsset.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance por Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byAsset}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="aportes" name="Aportes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retornos" name="Retornos" fill="#21C25E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
