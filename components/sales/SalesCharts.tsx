"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts"
import { PIE_COLORS, formatCurrency } from "./utils"

type SalesChartsProps = {
  byCategory: Array<{ name: string; faturamento: number }>
  byProduct: Array<{ name: string; faturamento: number; custo: number }>
}

export function SalesCharts({ byCategory, byProduct }: SalesChartsProps) {
  if (byCategory.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Faturamento por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="faturamento" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {byCategory.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Faturamento"]} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Faturamento vs Custo por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byProduct}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="custo" name="Custo" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="faturamento" name="Faturamento" fill="#21C25E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
