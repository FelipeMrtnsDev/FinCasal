import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function getMonthOptionsFromStart(startMonth: string) {
  const start = new Date(`${startMonth}-01`)
  const end = new Date(new Date().getFullYear(), 11, 1)
  const months: Array<{ value: string; label: string }> = []

  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  while (current <= end) {
    months.push({
      value: format(current, "yyyy-MM"),
      label: format(current, "MMMM yyyy", { locale: ptBR }),
    })
    current.setMonth(current.getMonth() + 1)
  }

  return months
}

