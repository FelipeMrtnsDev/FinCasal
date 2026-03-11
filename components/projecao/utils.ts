import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SavingsGoal } from "@/lib/types"

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function buildProjectionData(
  savingsGoals: SavingsGoal[],
  estimatedMonthlySavings: number
) {
  return Array.from({ length: 12 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() + i)
    const totalSaved = savingsGoals.reduce((a, g) => a + g.currentAmount, 0)
    return {
      month: format(month, "MMM yy", { locale: ptBR }),
      economizado: totalSaved + estimatedMonthlySavings * (i + 1),
      meta: savingsGoals.reduce((a, g) => a + g.targetAmount, 0),
    }
  })
}
