import { Sale } from "./types"

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function byCategoryData(sales: Sale[]) {
  const map = new Map<string, { faturamento: number; custo: number; unidades: number }>()
  sales.forEach((s) => {
    const key = s.category || "Geral"
    const curr = map.get(key) || { faturamento: 0, custo: 0, unidades: 0 }
    curr.faturamento += s.unitPrice * s.quantity
    curr.custo += s.unitCost * s.quantity
    curr.unidades += s.quantity
    map.set(key, curr)
  })
  return Array.from(map.entries()).map(([name, d]) => ({
    name,
    faturamento: d.faturamento,
    custo: d.custo,
    unidades: d.unidades,
    lucro: d.faturamento - d.custo,
  }))
}

export function byProductData(sales: Sale[]) {
  const map = new Map<string, { faturamento: number; custo: number; unidades: number }>()
  sales.forEach((s) => {
    const curr = map.get(s.productName) || { faturamento: 0, custo: 0, unidades: 0 }
    curr.faturamento += s.unitPrice * s.quantity
    curr.custo += s.unitCost * s.quantity
    curr.unidades += s.quantity
    map.set(s.productName, curr)
  })
  return Array.from(map.entries()).map(([name, d]) => ({
    name,
    faturamento: d.faturamento,
    custo: d.custo,
    unidades: d.unidades,
    lucro: d.faturamento - d.custo,
  }))
}

export const PIE_COLORS = ["#166534", "#21C25E", "#4ade80", "#0d9488", "#f59e0b"]
