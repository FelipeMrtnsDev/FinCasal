import { ArrowDownRight, BarChart3, DollarSign, TrendingUp, Wallet } from "lucide-react"
import type { InvestmentType } from "@/lib/types"

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export const INVEST_COLORS: Record<InvestmentType, string> = {
  aporte: "#166534",
  retorno: "#21C25E",
  dividendo: "#4ade80",
  venda: "#0d9488",
  resgate: "#f59e0b",
}

export const INVEST_ICONS: Record<InvestmentType, typeof TrendingUp> = {
  aporte: ArrowDownRight,
  retorno: TrendingUp,
  dividendo: DollarSign,
  venda: BarChart3,
  resgate: Wallet,
}

export const PIE_COLORS = ["#166534", "#21C25E", "#4ade80", "#0d9488", "#f59e0b"]
